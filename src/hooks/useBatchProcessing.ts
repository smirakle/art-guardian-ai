import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BatchJob {
  id: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  items_processed: number;
  total_items: number;
  error_message?: string;
  metadata: any;
}

export const useBatchProcessing = () => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createBatchJob = useCallback(async (
    operationType: string,
    totalItems: number,
    metadata: any = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('batch_processing_queue')
        .insert({
          user_id: user.id,
          operation_type: operationType,
          total_items: totalItems,
          metadata,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setJobs(prev => [...prev, data as BatchJob]);
      return data.id;
    } catch (error) {
      console.error('Error creating batch job:', error);
      toast({
        title: "Error",
        description: "Failed to create batch processing job",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const updateJobProgress = useCallback(async (
    jobId: string,
    itemsProcessed: number,
    status?: string
  ) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const progressPercentage = Math.round((itemsProcessed / job.total_items) * 100);
      
      const updateData: any = {
        items_processed: itemsProcessed,
        progress_percentage: progressPercentage
      };

      if (status) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('batch_processing_queue')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, ...updateData }
          : job
      ));
    } catch (error) {
      console.error('Error updating job progress:', error);
    }
  }, [jobs]);

  const processBatch = useCallback(async <T>(
    items: T[],
    processor: (item: T, index: number) => Promise<void>,
    batchSize: number = 10,
    operationType: string = 'batch_operation'
  ) => {
    setIsProcessing(true);
    
    const jobId = await createBatchJob(operationType, items.length, { batchSize });
    if (!jobId) {
      setIsProcessing(false);
      return;
    }

    try {
      // Update job status to processing
      await supabase
        .from('batch_processing_queue')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', jobId);

      let processed = 0;

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        // Process batch items in parallel
        await Promise.all(
          batch.map(async (item, batchIndex) => {
            try {
              await processor(item, i + batchIndex);
              processed++;
              await updateJobProgress(jobId, processed);
            } catch (error) {
              console.error(`Error processing item ${i + batchIndex}:`, error);
              // Continue processing other items
            }
          })
        );

        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      await updateJobProgress(jobId, processed, 'completed');
      
      toast({
        title: "Batch Processing Complete",
        description: `Successfully processed ${processed} of ${items.length} items`,
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      
      await supabase
        .from('batch_processing_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', jobId);

      toast({
        title: "Batch Processing Failed",
        description: "An error occurred during batch processing",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [createBatchJob, updateJobProgress, toast]);

  const getJobStatus = useCallback((jobId: string) => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  const getUserJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('batch_processing_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setJobs((data || []) as BatchJob[]);
    } catch (error) {
      console.error('Error fetching user jobs:', error);
    }
  }, []);

  return {
    jobs,
    isProcessing,
    createBatchJob,
    updateJobProgress,
    processBatch,
    getJobStatus,
    getUserJobs
  };
};