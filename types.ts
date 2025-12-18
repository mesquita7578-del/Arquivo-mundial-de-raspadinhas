
export type ScratchcardState = 'AMOSTRA' | 'VOID' | 'MUESTRA' | 'CAMPIONE' | 'SPECIMEN' | 'MUSTER' | 'ÉCHANTILLON' | '견본' | 'STEEKPROEF' | 'PRØVE' | 'PROV' | '样本' | 'MINT' | 'CS' | 'SC';

export type Continent = 'Europa' | 'América' | 'Ásia' | 'África' | 'Oceania' | 'Mundo';

export type Category = 'raspadinha' | 'lotaria' | 'boletim' | 'objeto';

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
  size: string;
  values: string;
  price?: string;
  state: ScratchcardState;
  country: string;
  region?: string;
  continent: Continent;
  collector?: string;
  
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
  
  owners?: string[];
  category: Category;
  aiGenerated: boolean;
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
  // Added continent property to fix type mismatch in directory
  continent?: string;
}

export interface AnalysisResult {
  gameName: string;
  gameNumber: string;
  releaseDate: string;
  size: string;
  values: string;
  price?: string;
  state: ScratchcardState;
  country: string;
  region?: string;
  continent: Continent;
  emission?: string;
  printer?: string;
  category: Category;
  seriesDetails?: string;
  lines?: string;
}