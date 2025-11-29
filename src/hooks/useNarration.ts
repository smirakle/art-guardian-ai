import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNarration = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  const playNarration = useCallback(async (text: string, voice: string = 'nova') => {
    try {
      // Check cache first
      const cacheKey = `${text}-${voice}`;
      let audioUrl = audioCache.current.get(cacheKey);

      if (!audioUrl) {
        console.log('Generating narration for:', text.substring(0, 50) + '...');
        
        const { data, error } = await supabase.functions.invoke('generate-speech', {
          body: { text, voice }
        });

        if (error) throw error;
        if (!data?.audioContent) throw new Error('No audio content received');

        // Convert base64 to blob URL
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        audioUrl = URL.createObjectURL(audioBlob);
        audioCache.current.set(cacheKey, audioUrl);
      }

      // Stop any currently playing narration
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create and play new audio
      audioRef.current = new Audio(audioUrl);
      await audioRef.current.play();
      
      return new Promise<void>((resolve) => {
        if (audioRef.current) {
          audioRef.current.onended = () => resolve();
        }
      });
    } catch (error) {
      console.error('Error playing narration:', error);
      throw error;
    }
  }, []);

  const stopNarration = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { playNarration, stopNarration };
};
