import { supabase } from '@/integrations/supabase/client';

interface GetImageUrlOptions {
  useSignedUrl?: boolean;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

/**
 * Storage utility for managing image URLs from Supabase Storage
 * 
 * USAGE EXAMPLES:
 * 
 * // Fast public URL (default, best for thumbnails)
 * const url = await storageUtils.getImageUrl('path/to/image.jpg');
 * 
 * // Secure signed URL (for private galleries, premium content)
 * const secureUrl = await storageUtils.getImageUrl('path/to/image.jpg', {
 *   useSignedUrl: true,
 *   expiresIn: 7200 // 2 hours
 * });
 * 
 * // Batch get multiple images
 * const urls = await storageUtils.getImageUrls([
 *   'image1.jpg',
 *   'image2.jpg'
 * ]);
 * 
 * // Batch create signed URLs for secure gallery
 * const signedUrls = await storageUtils.createSignedUrls([
 *   'premium/image1.jpg',
 *   'premium/image2.jpg'
 * ], 3600);
 */
export const storageUtils = {
  /**
   * Get image URL from storage
   * @param path - Storage path to the image
   * @param options - Configuration options
   * @returns Promise<string> - Image URL
   */
  async getImageUrl(
    path: string, 
    options: GetImageUrlOptions = {}
  ): Promise<string> {
    const { useSignedUrl = false, expiresIn = 3600 } = options;

    // If path is already a full URL, return it
    if (path?.startsWith('http')) {
      return path;
    }

    // Use signed URL for sensitive content
    if (useSignedUrl) {
      const { data, error } = await supabase.storage
        .from('artwork')
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      return data.signedUrl;
    }

    // Use public URL for standard content (faster)
    const { data } = supabase.storage
      .from('artwork')
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Get multiple image URLs
   * @param paths - Array of storage paths
   * @param options - Configuration options
   * @returns Promise<string[]> - Array of image URLs
   */
  async getImageUrls(
    paths: string[], 
    options: GetImageUrlOptions = {}
  ): Promise<string[]> {
    return Promise.all(
      paths.map(path => this.getImageUrl(path, options))
    );
  },

  /**
   * Get signed URLs for batch of images (for secure galleries)
   * @param paths - Array of storage paths
   * @param expiresIn - Expiration time in seconds
   * @returns Promise<Array<{path: string, signedUrl: string}>>
   */
  async createSignedUrls(
    paths: string[], 
    expiresIn: number = 3600
  ): Promise<Array<{path: string, signedUrl: string}>> {
    const { data, error } = await supabase.storage
      .from('artwork')
      .createSignedUrls(paths, expiresIn);
    
    if (error) throw error;
    return data;
  }
};
