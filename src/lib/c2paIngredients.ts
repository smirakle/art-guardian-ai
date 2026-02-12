/**
 * C2PA v2.2 Ingredient Support
 * Implements ingredient data structures, SHA-256 hashing, and relationship types
 * per the C2PA Specification v2.2 §8.3 (Ingredients).
 */

export type IngredientRelationship = 'parentOf' | 'componentOf' | 'inputTo';

export interface C2PAIngredient {
  title: string;
  format: string;
  instanceID: string;
  relationship: IngredientRelationship;
  hash: string;          // SHA-256 hex digest of the ingredient file
  hashAlgorithm: string; // always "sha256"
  fileSize: number;
  thumbnail?: {
    format: string;
    hash: string;
  };
  validationStatus?: 'valid' | 'unknown' | 'invalid';
  c2pa_manifest?: {
    claimGenerator?: string;
    assertions?: string[];
  };
}

export interface IngredientAssertion {
  label: 'c2pa.ingredient';
  data: {
    dc_title: string;
    dc_format: string;
    instanceID: string;
    relationship: IngredientRelationship;
    data: {
      hash: string;
      alg: string;
    };
  };
}

/**
 * Compute SHA-256 hash of a file's ArrayBuffer.
 */
export async function computeIngredientHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build a C2PA v2.2 ingredient object from a file.
 */
export async function buildIngredient(
  file: File,
  relationship: IngredientRelationship = 'parentOf',
  existingManifest?: { claimGenerator?: string; assertions?: string[] }
): Promise<C2PAIngredient> {
  const hash = await computeIngredientHash(file);
  const instanceID = `urn:c2pa:${crypto.randomUUID()}`;

  return {
    title: file.name,
    format: file.type || 'application/octet-stream',
    instanceID,
    relationship,
    hash,
    hashAlgorithm: 'sha256',
    fileSize: file.size,
    validationStatus: existingManifest ? 'valid' : 'unknown',
    c2pa_manifest: existingManifest,
  };
}

/**
 * Convert a C2PAIngredient into a c2pa.ingredient assertion for manifest embedding.
 */
export function ingredientToAssertion(ingredient: C2PAIngredient): IngredientAssertion {
  return {
    label: 'c2pa.ingredient',
    data: {
      dc_title: ingredient.title,
      dc_format: ingredient.format,
      instanceID: ingredient.instanceID,
      relationship: ingredient.relationship,
      data: {
        hash: ingredient.hash,
        alg: ingredient.hashAlgorithm,
      },
    },
  };
}

/**
 * Parse an ingredient assertion from raw manifest data (validator use).
 */
export function parseIngredientAssertion(raw: Record<string, unknown>): C2PAIngredient | null {
  try {
    const data = raw.data as Record<string, unknown> | undefined;
    if (!data) return null;

    return {
      title: (data.dc_title as string) || 'Unknown',
      format: (data.dc_format as string) || 'application/octet-stream',
      instanceID: (data.instanceID as string) || '',
      relationship: (data.relationship as IngredientRelationship) || 'parentOf',
      hash: ((data.data as Record<string, unknown>)?.hash as string) || '',
      hashAlgorithm: ((data.data as Record<string, unknown>)?.alg as string) || 'sha256',
      fileSize: 0,
      validationStatus: 'unknown',
    };
  } catch {
    return null;
  }
}
