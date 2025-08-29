export interface InventorInfo {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  citizenship: string;
  inventorshipDeclaration: boolean;
}

export interface PriorArt {
  id: string;
  title: string;
  authors: string;
  publicationDate: string;
  patentNumber?: string;
  url?: string;
  relevance: string;
  differentiatingFactors: string;
  documentType: 'patent' | 'publication' | 'article' | 'product' | 'other';
}

export interface PatentClaim {
  id: string;
  claimNumber: number;
  claimType: 'independent' | 'dependent';
  dependsOn?: number;
  claimText: string;
  isNew?: boolean;
}

export interface ApplicationInfo {
  title: string;
  inventionType: string;
  filingType: string;
  applicationEntity: string;
  assigneeCompany: string;
  priorityClaim: string;
  crossReference: string;
}