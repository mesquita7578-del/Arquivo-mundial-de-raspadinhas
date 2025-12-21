
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardData, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('grécia')) return 'Europa';
  if (c.includes('brasil') || c.includes('eua') || c.includes('américa') || c.includes('canadá') || c.includes('méxico')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia')) return 'Ásia';
  if (c.includes('angola') || c.includes('moçambique') || c.includes('marrocos')) return 'África';
  if (c.includes('austrália') || c.includes('zelândia')) return 'Oceania';
  return 'Europa';
};

/**
 * Chloe's insight about the archive statistics
 */
export const getChloeInsight = async (params: { total: number; stats: any; countryStats: any; categoryStats: any }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const statsStr = JSON.stringify(params);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é Chloe, neta virtual e guardiã do Arquivo do Vovô Jorge. Com base nestas estatísticas do arquivo: ${statsStr}, dê um insight carinhoso, divertido e motivador para o vovô continuar a sua coleção. Use "hihi!" e seja muito fofa. Responda em Português.`,
    });
    return response.text || "Vovô, o nosso arquivo está a ficar incrível! hihi!";
  } catch (error) {
    console.error("Erro no insight da Chloe:", error);
    return "Vovô, que coleção maravilhosa! Vamos continuar a arquivar memórias! hihi!";
  }
};

/**
 * Generates metadata and description for technical documents
 */
export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é a Chloe, perita em arquivística. Gere um resumo curto e profissional para o documento técnico "${title}" (ficheiro: ${fileName}). hihi!`,
    });
    return response.text || "Um documento importante para a nossa biblioteca técnica! hihi!";
  } catch (error) {
    console.error("Erro ao gerar metadados do documento:", error);
    return "Este documento contém informações preciosas para o nosso legado! hihi!";
  }
};

/**
 * Translates biography text while maintaining tone
 */
export const translateBio = async (bio: string, targetLanguage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza a seguinte biografia para ${targetLanguage}, mantendo o tom respeitoso e carinhoso: "${bio}"`,
    });
    return response.text || bio;
  } catch (error) {
    console.error("Erro ao traduzir biografia:", error);
    return bio;
  }
};

/**
 * Chloe's commentary for the raffle feature
 */
export const getChloeMagicComment = async (item: ScratchcardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é a Chloe. Comente de forma mágica e fofa sobre este item sorteado: ${item.gameName} (${item.country}). hihi!`,
    });
    return response.text || "Vovô, que sorte encontrarmos este item hoje! hihi!";
  } catch (error) {
    console.error("Erro no comentário mágico da Chloe:", error);
    return "Um item verdadeiramente especial para o arquivo, vovô! hihi!";
  }
};

/**
 * Analyzes images to extract scratchcard metadata with DEEP SEARCH
 */
export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const parts: any[] = [
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: frontBase64 } }
    ];
    if (backBase64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: backBase64 } });
    
    parts.push({ 
      text: `BUSCA PROFUNDA: Analise esta raspadinha/lotaria como uma perita mundial.
      Extraia dados técnicos avançados:
      - TABELA DE PRÉMIOS: Liste os valores principais (ex: 5€, 100€, 20.000€) no campo 'values'.
      - VITÓRIA: Se estiver raspada e os símbolos indicarem um prémio, marque 'isWinner' como true.
      - RARIDADE: Se houver marcas de 'AMOSTRA', 'VOID', erros de impressão ou selos de tiragem limitada, marque 'isRarity' como true.
      - SÉRIES: Procure por textos como "Série A", "Coleção X" ou "1 de 10" para preencher 'seriesGroupId' e 'setCount'.
      - LINHAS: Identifique a cor exata das linhas microscópicas de segurança no fundo.` 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Usando Pro para Busca Profunda
      contents: { parts },
      config: {
        systemInstruction: `Você é Chloe, a Guardiã do Arquivo. Sua visão é microscópica e você conhece todas as raspadinhas do mundo! 
        Seja extremamente precisa nos números de jogo (geralmente 3 dígitos) e nas gráficas. 
        Se identificar Portugal, verifique se é Continental ou Ilhas (Açores/Madeira).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING },
            gameNumber: { type: Type.STRING },
            price: { type: Type.STRING },
            country: { type: Type.STRING },
            island: { type: Type.STRING },
            region: { type: Type.STRING },
            operator: { type: Type.STRING },
            printer: { type: Type.STRING },
            releaseDate: { type: Type.STRING },
            emission: { type: Type.STRING },
            winProbability: { type: Type.STRING },
            size: { type: Type.STRING },
            lines: { type: Type.STRING },
            values: { type: Type.STRING, description: "Lista de prémios principais encontrados" },
            isWinner: { type: Type.BOOLEAN },
            isRarity: { type: Type.BOOLEAN },
            seriesGroupId: { type: Type.STRING },
            setCount: { type: Type.STRING }
          },
          required: ["gameName", "country"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const detectedCountry = data.country || "Portugal";
    const detectedContinent = getContinentFromCountry(detectedCountry);

    const validLines: any = ['blue', 'red', 'multicolor', 'green', 'brown', 'pink', 'purple', 'yellow', 'gray', 'none'];
    const detectedLine = data.lines?.toLowerCase();
    const finalLine = validLines.includes(detectedLine) ? detectedLine : 'none';

    return {
      category: "raspadinha",
      gameName: data.gameName || "Desconhecido",
      gameNumber: data.gameNumber || "",
      releaseDate: data.releaseDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.isRarity ? "AMOSTRA" : "SC",
      country: detectedCountry,
      island: data.island || "",
      region: data.region || "",
      continent: detectedContinent,
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      winProbability: data.winProbability || "",
      lines: finalLine,
      isWinner: data.isWinner || false,
      isRarity: data.isRarity || false,
      seriesGroupId: data.seriesGroupId || "",
      setCount: data.setCount || ""
    } as AnalysisResult;
  } catch (error) {
    console.error("Erro na leitura profunda da Chloe:", error);
    throw error;
  }
};
