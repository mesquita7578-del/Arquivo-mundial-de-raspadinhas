
import { ScratchcardData, WebsiteLink } from './types';

export const INITIAL_RASPADINHAS: ScratchcardData[] = [
  {
    id: '1',
    customId: 'RASP-PT-001',
    frontUrl: 'https://placehold.co/600x600/1f2937/white?text=Super+Pe+de+Meia',
    backUrl: 'https://placehold.co/600x400/1f2937/white?text=Verso+Super+Pe+de+Meia',
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
  },
  {
    id: '8',
    customId: 'RASP-PT-CHLOE',
    frontUrl: 'https://placehold.co/400x400/f472b6/white?text=Chloe+Collection',
    gameName: 'Edição Especial Princesa',
    gameNumber: '001',
    releaseDate: '2024-01-01',
    size: '10x10cm',
    values: 'Inestimável',
    state: 'MINT',
    country: 'Portugal',
    continent: 'Europa',
    category: 'objeto',
    collector: 'Chloe',
    aiGenerated: true,
    createdAt: Date.now() - 5000,
  }
];

export const OFFICIAL_LOTTERIES: (Partial<WebsiteLink> & { continent: string })[] = [
  // GLOBAL / ASSOCIATIONS
  { name: "World Lottery Association (WLA)", url: "https://www.world-lotteries.org", country: "Global", category: "Global Organization", continent: "Mundo" },
  { name: "European Lotteries (EL)", url: "https://www.european-lotteries.org", country: "Europa", category: "Association", continent: "Europa" },
  { name: "CIBELAE (Ibero-América)", url: "https://cibelae.net", country: "Ibero-América", category: "Association", continent: "América" },
  { name: "Multi-State Lottery Association (MUSL)", url: "https://www.musl.com", country: "EUA", category: "Association", continent: "América" },
  { name: "ALEA (Argentina)", url: "https://www.alea.org.ar", country: "Argentina", category: "Association", continent: "América" },

  // AMÉRICA - SUL & CENTRAL
  { name: "Loterias CAIXA", url: "https://loterias.caixa.gov.br", country: "Brasil", category: "Official Operator", continent: "América" },
  { name: "Lotería de la Ciudad (LOTBA)", url: "https://www.loteriadelaciudad.gob.ar", country: "Argentina", category: "Official Operator", continent: "América" },
  { name: "Lotería de la Provincia", url: "https://www.loteria.gba.gov.ar", country: "Argentina", category: "Official Operator", continent: "América" },
  { name: "Polla Chilena de Beneficencia", url: "https://www.pollachilena.cl", country: "Chile", category: "Official Operator", continent: "América" },
  { name: "Lotería Nacional de México", url: "https://www.gob.mx/lotenal", country: "México", category: "Official Operator", continent: "América" },

  // AMÉRICA - NORTE
  { name: "Texas Lottery", url: "https://www.texaslottery.com", country: "EUA", category: "Official Operator", continent: "América" },
  { name: "California Lottery", url: "https://www.calottery.com", country: "EUA", category: "Official Operator", continent: "América" },
  { name: "New York Lottery", url: "https://nylottery.ny.gov", country: "EUA", category: "Official Operator", continent: "América" },
  { name: "Loto-Québec", url: "https://loteries.lotoquebec.com", country: "Canadá", category: "Official Operator", continent: "América" },
  { name: "OLG (Ontario)", url: "https://www.olg.ca", country: "Canadá", category: "Official Operator", continent: "América" },

  // EUROPA
  { name: "Jogos Santa Casa", url: "https://www.jogossantacasa.pt", country: "Portugal", category: "Official Operator", continent: "Europa" },
  { name: "Lottomatica", url: "https://www.lottomatica.it", country: "Itália", category: "Official Operator", continent: "Europa" },
  { name: "Sisal", url: "https://www.sisal.it", country: "Itália", category: "Official Operator", continent: "Europa" },
  { name: "FDJ (Française des Jeux)", url: "https://www.fdj.fr", country: "França", category: "Official Operator", continent: "Europa" },
  { name: "Loterías y Apuestas (SELAE)", url: "https://www.loteriasyapuestas.es", country: "Espanha", category: "Official Operator", continent: "Europa" },
  { name: "ONCE", url: "https://www.juegosonce.es", country: "Espanha", category: "Official Operator", continent: "Europa" },
  { name: "The National Lottery (Allwyn)", url: "https://www.national-lottery.co.uk", country: "Reino Unido", category: "Official Operator", continent: "Europa" },
  { name: "Loterie Nationale Luxembourg", url: "https://www.loterie.lu", country: "Luxemburgo", category: "Official Operator", continent: "Europa" },
  { name: "Swisslos", url: "https://www.swisslos.ch", country: "Suíça", category: "Official Operator", continent: "Europa" },
  { name: "Loterie Romande", url: "https://www.loro.ch", country: "Suíça", category: "Official Operator", continent: "Europa" },
  { name: "Lotto Bayern", url: "https://www.lotto-bayern.de", country: "Alemanha", category: "Regional Operator", continent: "Europa" },

  // ÁSIA & OCEANIA
  { name: "Hong Kong Jockey Club", url: "https://www.hkjc.com", country: "Hong Kong", category: "Official Operator", continent: "Ásia" },
  { name: "Singapore Pools", url: "https://www.singaporepools.com.sg", country: "Singapura", category: "Official Operator", continent: "Ásia" },
  { name: "Takara-kuji (Japan Lottery)", url: "https://www.takarakuji-official.jp", country: "Japão", category: "Official Operator", continent: "Ásia" },
  { name: "The Lott", url: "https://www.thelott.com", country: "Austrália", category: "Official Operator", continent: "Oceania" },
  { name: "Lotto NZ", url: "https://mylotto.co.nz", country: "Nova Zelândia", category: "Official Operator", continent: "Oceania" }
];
