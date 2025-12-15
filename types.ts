
export type ScratchcardState = 'AMOSTRA' | 'VOID' | 'MUESTRA' | 'CAMPIONE' | 'MINT' | 'CS' | 'SC';

export type Continent = 'Europa' | 'América' | 'Ásia' | 'África' | 'Oceania' | 'Mundo';

export type Category = 'raspadinha' | 'lotaria';

export type LineType = 'blue' | 'red' | 'multicolor' | 'none';

export interface ScratchcardData {
  id: string; // Internal unique ID
  customId: string; // "ID feita por ti" (e.g. CAT-001)
  frontUrl: string; // Imagem da frente
  backUrl?: string; // Imagem do verso (opcional)
  gameName: string; // Nome do jogo
  gameNumber: string; // Nº de jogo
  releaseDate: string; // Data de lançamento
  size: string; // Tamanho
  values: string; // Usado para "Nota" ou "Informação Histórica"
  price?: string; // Preço Facial
  state: ScratchcardState; // Estado
  country: string; // País de origem
  region?: string; // Novo: Região / Cantão / Estado
  continent: Continent; // Continente
  collector?: string; // Nome do colecionador
  
  // New Fields
  emission?: string; // Emissão / Tiragem
  printer?: string; // Impresso por (Gráfica)
  isSeries?: boolean; // É um SET / Série?
  seriesDetails?: string; // Detalhes manuais do SET
  lines?: LineType; // Tipo de Linhas
  
  isRarity?: boolean; // Novo campo: É uma raridade?
  
  category: Category; // Categoria

  aiGenerated: boolean;
  createdAt: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string; // Base64 PDF data
  fileName: string;
  createdAt: number;
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
}