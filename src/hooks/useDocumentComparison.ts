import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DiffMatchPatch from "diff-match-patch";

interface ComparisonResult {
  id: string;
  original_document_id: string;
  comparison_url?: string;
  comparison_text?: string;
  similarity_score: number;
  total_chars: number;
  matched_chars: number;
  added_chars: number;
  removed_chars: number;
  differences: DiffSegment[];
  metadata: {
    compared_at: string;
    algorithm: string;
  };
}

interface DiffSegment {
  type: "equal" | "insert" | "delete";
  text: string;
}

export const useDocumentComparison = () => {
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const { toast } = useToast();

  const compareDocuments = useCallback(async (
    originalDocumentId: string,
    comparisonSource: { url?: string; text?: string }
  ): Promise<ComparisonResult | null> => {
    setComparing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch original document
      const { data: originalDoc, error: docError } = await supabase
        .from("ai_protection_records")
        .select("*")
        .eq("id", originalDocumentId)
        .eq("user_id", user.id)
        .single();

      if (docError || !originalDoc) {
        throw new Error("Original document not found");
      }

      // Get comparison text
      let comparisonText = comparisonSource.text;
      
      if (comparisonSource.url && !comparisonText) {
        const { data, error } = await supabase.functions.invoke(
          "fetch-document-content",
          {
            body: { url: comparisonSource.url }
          }
        );

        if (error) throw error;
        comparisonText = data.content;
      }

      if (!comparisonText) {
        throw new Error("No comparison text provided");
      }

      // Perform diff comparison
      const dmp = new DiffMatchPatch();
      const originalText = (originalDoc.metadata as any)?.original_text || "";
      
      const diffs = dmp.diff_main(originalText, comparisonText);
      dmp.diff_cleanupSemantic(diffs);

      // Calculate statistics
      let totalChars = 0;
      let matchedChars = 0;
      let addedChars = 0;
      let removedChars = 0;

      const differences: DiffSegment[] = diffs.map(([type, text]) => {
        const length = text.length;
        totalChars += length;

        if (type === 0) { // DIFF_EQUAL
          matchedChars += length;
          return { type: "equal", text };
        } else if (type === 1) { // DIFF_INSERT
          addedChars += length;
          return { type: "insert", text };
        } else { // DIFF_DELETE
          removedChars += length;
          return { type: "delete", text };
        }
      });

      const similarityScore = totalChars > 0 ? matchedChars / totalChars : 0;

      const result: ComparisonResult = {
        id: crypto.randomUUID(),
        original_document_id: originalDocumentId,
        comparison_url: comparisonSource.url,
        comparison_text: comparisonText,
        similarity_score: similarityScore,
        total_chars: totalChars,
        matched_chars: matchedChars,
        added_chars: addedChars,
        removed_chars: removedChars,
        differences,
        metadata: {
          compared_at: new Date().toISOString(),
          algorithm: "diff-match-patch"
        }
      };

      // Save comparison result to database
      await supabase.from("document_version_comparisons").insert({
        user_id: user.id,
        original_document_id: originalDocumentId,
        comparison_url: comparisonSource.url,
        similarity_score: similarityScore,
        total_chars: totalChars,
        matched_chars: matchedChars,
        added_chars: addedChars,
        removed_chars: removedChars,
        differences: differences as any,
        metadata: result.metadata as any
      });

      setComparisonResults(prev => [...prev, result]);

      toast({
        title: "Comparison Complete",
        description: `${(similarityScore * 100).toFixed(1)}% similarity detected`,
      });

      return result;
    } catch (error: any) {
      console.error("Document comparison error:", error);
      toast({
        title: "Comparison Failed",
        description: error.message || "Failed to compare documents",
        variant: "destructive",
      });
      return null;
    } finally {
      setComparing(false);
    }
  }, [toast]);

  const compareWithPlagiarismMatch = useCallback(async (
    matchId: string
  ): Promise<ComparisonResult | null> => {
    try {
      const { data: match, error } = await supabase
        .from("document_plagiarism_matches")
        .select("*, ai_protection_records(*)")
        .eq("id", matchId)
        .single();

      if (error || !match) {
        throw new Error("Plagiarism match not found");
      }

      return await compareDocuments(
        match.protection_record_id,
        {
          url: match.source_url,
          text: match.matched_content
        }
      );
    } catch (error: any) {
      console.error("Compare with match error:", error);
      toast({
        title: "Comparison Failed",
        description: error.message || "Failed to compare with plagiarism match",
        variant: "destructive",
      });
      return null;
    }
  }, [compareDocuments, toast]);

  const loadComparisonHistory = useCallback(async (originalDocumentId: string) => {
    try {
      const { data, error } = await supabase
        .from("document_version_comparisons")
        .select("*")
        .eq("original_document_id", originalDocumentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const results: ComparisonResult[] = (data as any[] || []).map((item: any) => ({
        id: item.id,
        original_document_id: item.original_document_id,
        comparison_url: item.comparison_url || undefined,
        comparison_text: null,
        similarity_score: item.similarity_score,
        total_chars: item.total_chars,
        matched_chars: item.matched_chars,
        added_chars: item.added_chars,
        removed_chars: item.removed_chars,
        differences: item.differences as DiffSegment[],
        metadata: item.metadata
      }));

      setComparisonResults(results);
    } catch (error: any) {
      console.error("Load comparison history error:", error);
    }
  }, []);

  return {
    comparing,
    comparisonResults,
    compareDocuments,
    compareWithPlagiarismMatch,
    loadComparisonHistory
  };
};
