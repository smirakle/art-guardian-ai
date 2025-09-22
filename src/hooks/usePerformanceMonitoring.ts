import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metadata?: any;
}

export const usePerformanceMonitoring = () => {
  const recordMetric = useCallback(async (metric: PerformanceMetric) => {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          metric_type: metric.metric_type,
          metric_value: metric.metric_value,
          metric_unit: 'ms', // Default unit
          source_component: metric.metric_name,
          additional_data: metric.metadata || {}
        });

      if (error) {
        console.error('Error recording performance metric:', error);
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }, []);

  const recordUploadPerformance = useCallback(async (
    fileName: string,
    fileSize: number,
    uploadTime: number,
    processingTime?: number
  ) => {
    await recordMetric({
      metric_type: 'upload',
      metric_name: 'file_upload_time',
      metric_value: uploadTime,
      metadata: {
        file_name: fileName,
        file_size: fileSize,
        processing_time: processingTime,
        upload_speed_mbps: (fileSize / 1024 / 1024) / (uploadTime / 1000)
      }
    });
  }, [recordMetric]);

  const recordStorageUsage = useCallback(async (
    operation: 'add' | 'remove',
    sizeDelta: number,
    totalUsage: number
  ) => {
    await recordMetric({
      metric_type: 'storage',
      metric_name: 'storage_operation',
      metric_value: sizeDelta,
      metadata: {
        operation,
        total_usage: totalUsage,
        percentage_used: (totalUsage / (1024 * 1024 * 1024)) * 100 // Assuming 1GB base limit
      }
    });
  }, [recordMetric]);

  const recordQueryPerformance = useCallback(async (
    query: string,
    executionTime: number,
    resultCount?: number
  ) => {
    await recordMetric({
      metric_type: 'database',
      metric_name: 'query_execution_time',
      metric_value: executionTime,
      metadata: {
        query_type: query,
        result_count: resultCount
      }
    });
  }, [recordMetric]);

  return {
    recordMetric,
    recordUploadPerformance,
    recordStorageUsage,
    recordQueryPerformance
  };
};