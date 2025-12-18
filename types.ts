
export type ScratchcardState = 'AMOSTRA' | 'VOID' | 'SAMPLE' | 'MUESTRA' | 'CAMPIONE' | 'SPECIMEN' | 'MUSTER' | 'ÉCHANTILLON' | '견본' | 'STEEKPROEF' | 'PRØVE' | 'PROV' | '样本' | 'MINT' | 'CS' | 'SC';

export type Continent = 'Europa' | 'América' | 'Ásia' | 'África' | 'Oceania' | 'Mundo';

export type Category = string;

export type LineType = 'blue' | 'red' | 'multicolor' | 'none' | 'green' | 'brown' | 'pink' | 'purple' | 'yellow' | 'gray' | string;

export interface ScratchcardData {
  id: string;
  customId: string;
  frontUrl: string;
  backUrl?: string;
  extraImages?: string[];
  gameName: string;
  gameNumber: string;
  releaseDate: string;
  closeDate?: string;
  size: string;
  values: string;
  price?: string;
  state: ScratchcardState;
  country: string;
  region?: string;
  continent: Continent;
  collector?: string;
  operator?: string;
  emission?: string;
  printer?: string;
  isSeries?: boolean;
  seriesDetails?: string;
  seriesGroupId?: string;
  lines?: LineType;
  isRarity?: boolean;
  isPromotional?: boolean;
  isFeatured?: boolean;
  isWinner?: boolean;
  prizeAmount?: string;
  winProbability?: string;
  owners?: string[];
  category: Category;
  aiGenerated: boolean;
  createdAt: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  createdAt: number;
  gameNumber?: string;
  year?: string;
  printer?: string;
  measures?: string;
  expiration?: string;
}

export interface WebsiteLink {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  country: string;
  category?: string;
  continent?: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface SiteMetadata {
  id: 'site_settings';
  founderPhotoUrl: string;
  founderBio?: string;
  founderQuote?: string;
  milestones?: Milestone[];
}

export interface AnalysisResult {
  gameName: string;
  gameNumber: string;
  releaseDate: string;
  closeDate?: string;
  size: string;
  values: string;
  price?: string;
  state: ScratchcardState;
  country: string;
  region?: string;
  continent: Continent;
  operator?: string;
  emission?: string;
  printer?: string;
  category: Category;
  seriesDetails?: string;
  lines?: string;
  winProbability?: string;
}
