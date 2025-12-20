
import { ScratchcardData, WebsiteLink } from './types';

export const INITIAL_RASPADINHAS: ScratchcardData[] = [
  {
    id: '1',
    customId: 'RASP-PT-001',
    frontUrl: 'https://images.unsplash.com/photo-1594902360217-194363228a47?q=80&w=800&auto=format&fit=crop',
    backUrl: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=800&auto=format&fit=crop',
    gameName: 'Super Pé de Meia',
    gameNumber: '105',
    releaseDate: '2023-05-12',
    size: '10x15cm',
    values: '5€, 10€, 50€, 1000€',
    state: 'MINT',
    country: 'Portugal',
    region: 'Continente',
    continent: 'Europa',
    category: 'raspadinha',
    collector: 'Jorge Mesquita',
    aiGenerated: false,
    createdAt: Date.now() - 100000,
    lines: 'none',
  },
  {
    id: '8',
    customId: 'CHLOE-MAGIC',
    frontUrl: 'https://images.unsplash.com/photo-1621244285741-20704d0d3679?q=80&w=800&auto=format&fit=crop',
    gameName: 'Edição Especial Chloe',
    gameNumber: '777',
    releaseDate: '2024-03-20',
    size: '12x12cm',
    values: 'Mágica',
    state: 'MINT',
    country: 'Itália',
    continent: 'Europa',
    category: 'objeto',
    collector: 'Chloe',
    aiGenerated: true,
    createdAt: Date.now() - 5000,
    lines: 'none',
  }
];

export const OFFICIAL_LOTTERIES: (Partial<WebsiteLink> & { continent: string })[] = [
  { name: "World Lottery Association (WLA)", url: "https://www.world-lotteries.org", country: "Global", category: "Global Organization", continent: "Mundo" },
  { name: "Jogos Santa Casa", url: "https://www.jogossantacasa.pt", country: "Portugal", category: "Official Operator", continent: "Europa" },
  { name: "Lottomatica", url: "https://www.lottomatica.it", country: "Itália", category: "Official Operator", continent: "Europa" },
  { name: "ONCE", url: "https://www.juegosonce.es", country: "Espanha", category: "Official Operator", continent: "Europa" },
  { name: "Catalogue des Tickets (França)", url: "http://tickets.chez.com/", country: "França", category: "Catálogo Técnico / Referência", continent: "Europa" },
  { name: "Atlantic Lottery Corporation", url: "https://www.alc.ca", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "BC Lottery (BCLC)", url: "https://www.bclc.com", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "Ontario Lottery and Gaming (OLG)", url: "https://www.olg.ca", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "Loto-Québec", url: "https://lotoquebec.com", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "Western Canada Lottery (WCLC)", url: "https://www.wclc.com", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "Tatts (Tattersall’s Sweeps)", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" },
  { name: "Tatts NT Lotteries", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" },
  { name: "NSW Lotteries (New South Wales)", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" },
  { name: "Golden Casket Lottery Corp", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" },
  { name: "SA Lotteries (Tatts SA)", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" }
];
