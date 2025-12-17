
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

// Initialization should occur within the function call context to ensure the correct API key is used, especially when dynamic key selection is supported.

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  /* Coding Guidelines: Create a new GoogleGenAI instance right before making an API call */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const validMimeType = mimeType || "image/jpeg";

    const prompt = `Aja como Chloe, a guardiã do arquivo de Jorge Mesquita.
    Analise esta raspadinha/lotaria e extraia os dados técnicos exatos.
    
    CAMPOS OBRIGATÓRIOS:
    1. gameName: Nome do jogo.
    2. country: País de origem.
    3. region: Estado/Cantão/Região (se aplicável).
    4. gameNumber: Número do jogo/modelo.
    5. emission: Tiragem ou série (ex: 1.000.000).
    6. printer: Gráfica/Impressor.
    7. price: Preço facial (ex: 5€).
    8. size: Medidas/Tamanho (ex: 10x15cm).
    9. releaseDate: Ano de lançamento (apenas o ano).
    10. state: "SC" (raspada) ou "MINT" (nova).
    
    Retorne APENAS JSON puro. Se não ler algum campo, deixe vazio.`;

    const parts: any[] = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } }
    ];

    if (backBase64) {
      parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    }
    
    parts.push({ text: prompt });

    /* Coding Guidelines: Use gemini-3-pro-preview for complex reasoning tasks like technical image analysis */
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
            region: { type: Type.STRING },
            state: { type: Type.STRING },
            values: { type: Type.STRING },
            emission: { type: Type.STRING },
            printer: { type: Type.STRING },
            size: { type: Type.STRING },
            releaseDate: { type: Type.STRING }
          }
        }
      }
    });

    /* Coding Guidelines: Access generated text via the .text property directly */
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
      continent: "Europa",
      region: data.region || "",
      emission: data.emission || "",
      printer: data.printer || ""
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
      printer: ""
    };
  }
};

export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => {
  /* Initialize GoogleGenAI inside the function to ensure the current environment API key is captured */
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
  /* Initialize GoogleGenAI inside the function as per SDK best practices */
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
