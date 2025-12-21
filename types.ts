
export interface ArchiveImage {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  albumId: string;
  date: string;
  createdAt: number;
}

export interface Album {
  id: string;
  name: string;
  createdAt: number;
}

export type Continent = 'Europa' | 'América' | 'Ásia' | 'África' | 'Oceania' | 'Mundo';

export type ScratchcardState = 'MINT' | 'SC' | 'CS' | 'AMOSTRA' | 'VOID' | 'SAMPLE' | 'MUESTRA' | 'CAMPIONE' | '样本' | 'MUSTER' | 'PRØVE';

export type LineType = 'blue' | 'red' | 'multicolor' | 'green' | 'brown' | 'pink' | 'purple' | 'yellow' | 'gray' | 'none';

export type Category = 'raspadinha' | 'lotaria' | 'boletim' | 'objeto' | string;

export interface ScratchcardData {
  id: string;
  customId: string;
  frontUrl: string;
  backUrl?: string;
  gallery?: string[]; 
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
  island?: string; 
  continent: Continent;
  category: string;
  theme?: string; // Novo campo para Temas
  operator?: string;
  printer?: string;
  emission?: string;
  winProbability?: string;
  lines: LineType;
  collector: string;
  aiGenerated: boolean;
  createdAt: number;
  owners?: string[];
  isWinner?: boolean;
  isRarity?: boolean;
  seriesGroupId?: string;
  isSeries?: boolean;
  seriesDetails?: string;
  setCount?: string; 
  subRegion?: string;
}

export interface AnalysisResult {
  category: string;
  gameName: string;
  gameNumber: string;
  releaseDate: string;
  size: string;
  values: string;
  price: string;
  state: string;
  country: string;
  island?: string;
  subRegion?: string;
  continent: Continent;
  operator: string;
  printer: string;
  emission: string;
  lines: string;
  theme?: string;
}

export interface WebsiteLink {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  country: string;
  category: string;
  continent?: string;
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
  description: string;
  fileName: string;
  fileUrl: string;
  createdAt: number;
  gameNumber?: string;
  year?: string;
  printer?: string;
  measures?: string;
}

export interface SiteMetadata {
  id: string;
  founderPhotoUrl: string;
  founderBio?: string;
  founderQuote?: string;
  milestones?: Milestone[];
  visitorCount?: number; 
  visitorLog?: VisitorEntry[]; 
}

export interface VisitorEntry {
  name: string;
  timestamp: number;
  isAdmin: boolean;
  location?: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}
