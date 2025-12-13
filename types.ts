
export type ScratchcardState = 'AMOSTRA' | 'VOID' | 'MUESTRA' | 'CAMPIONE' | 'MINT' | 'CS' | 'SC';

export type Continent = 'Europa' | 'América' | 'Ásia' | 'África' | 'Oceania' | 'Mundo';

export interface ScratchcardData {
  id: string; // Internal unique ID
  customId: string; // "ID feita por ti" (e.g. CAT-001)
  frontUrl: string; // Imagem da frente
  backUrl?: string; // Imagem do verso (opcional)
  gameName: string; // Nome do jogo
  gameNumber: string; // Nº de jogo
  releaseDate: string; // Data de lançamento
  size: string; // Tamanho
  values: string; // Todos os valores
  price?: string; // Preço Facial (Novo campo)
  state: ScratchcardState; // Estado
  country: string; // País de origem
  continent: Continent; // Continente
  collector?: string; // Nome do colecionador
  
  // New Fields
  emission?: string; // Emissão / Tiragem
  printer?: string; // Impresso por (Gráfica)
  isSeries?: boolean; // É um SET / Série?

  aiGenerated: boolean;
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
  continent: Continent;
  emission?: string;
  printer?: string;
}