
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('italia') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('europa') || c.includes('germany') || c.includes('france') || c.includes('uk') || c.includes('austria') || c.includes('belgium')) return 'Europa';
  if (c.includes('argentina') || c.includes('brasil') || c.includes('eua') || c.includes('usa') || c.includes('canadá') || c.includes('américa') || c.includes('mexico') || c.includes('chile')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia') || c.includes('ásia') || c.includes('japan') || c.includes('korea')) return 'Ásia';
  if (c.includes('áfrica') || c.includes('africa') || c.includes('egito') || c.includes('marrocos')) return 'África';
  if (c.includes('oceania') || c.includes('austrália') || c.includes('australia')) return 'Oceania';
  return 'Europa'; // Default
};

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const validMimeType = mimeType || "image/jpeg";

    const prompt = `Aja como Chloe, a guardiã do arquivo de Jorge Mesquita.
    Analise esta raspadinha/lotaria e extraia os dados técnicos exatos.
    
    CAMPOS OBRIGATÓRIOS:
    1. gameName: Nome do jogo.
    2. country: País de origem (ex: Argentina, Portugal, Brasil).
    3. continent: Continente correto (Europa, América, Ásia, África, Oceania). ATENÇÃO: Argentina e Brasil são AMÉRICA.
    4. region: Estado/Cantão/Região (se aplicável).
    5. gameNumber: Número do jogo/modelo.
    6. emission: Tiragem ou série (ex: 1.000.000).
    7. printer: Gráfica/Impressor.
    8. price: Preço facial (ex: 5€).
    9. size: Medidas/Tamanho (ex: 10x15cm).
    10. releaseDate: Ano de lançamento (apenas o ano).
    11. state: "SC" (raspada) ou "MINT" (nova).
    12. lines: Identifique a cor das linhas de segurança ou série (ex: azul, vermelha, multicolor, verde, amarela, castanha, cinza).
    
    Retorne APENAS JSON puro. Se não ler algum campo, deixe vazio.`;

    const parts: any[] = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } }
    ];

    if (backBase64) {
      parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING },
            gameNumber: { type: Type.STRING },
            price: { type: Type.STRING },
            country: { type: Type.STRING },
            continent: { type: Type.STRING },
            region: { type: Type.STRING },
            state: { type: Type.STRING },
            values: { type: Type.STRING },
            emission: { type: Type.STRING },
            printer: { type: Type.STRING },
            size: { type: Type.STRING },
            releaseDate: { type: Type.STRING },
            lines: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      category: "raspadinha",
      gameName: data.gameName || "",
      gameNumber: data.gameNumber || "000",
      releaseDate: data.releaseDate || new Date().getFullYear().toString(),
      size: data.size || "10x15cm",
      values: data.values || "",
      price: data.price || "",
      state: (data.state === "MINT" || data.state === "SC") ? data.state : "SC",
      country: data.country || "Portugal",
      continent: data.continent || getContinentFromCountry(data.country || "Portugal"),
      region: data.region || "",
      emission: data.emission || "",
      printer: data.printer || "",
      lines: data.lines || ""
    } as AnalysisResult;

  } catch (error) {
    console.error("Chloe falhou a leitura profunda:", error);
    return {
      category: "raspadinha",
      gameName: "",
      gameNumber: "",
      releaseDate: new Date().getFullYear().toString(),
      size: "10x15cm",
      values: "",
      price: "",
      state: "SC",
      country: "Portugal",
      continent: "Europa",
      region: "",
      emission: "",
      printer: "",
      lines: ""
    };
  }
};

export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise informações oficiais sobre esta raspadinha/lotaria: "${query}".`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return {}; 
  } catch (error) {
    return {};
  }
};

export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um resumo técnico para: "${title}".`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
};
