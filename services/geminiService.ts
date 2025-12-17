import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-3-flash-preview"; 
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
    7. state: "SC" (raspada) ou "MINT" (nova).
    
    Retorne APENAS JSON puro. Se não ler algum campo, deixe vazio.`;

    const parts = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } },
      { text: prompt }
    ];

    if (backBase64) {
      parts.splice(1, 0, { inlineData: { mimeType: validMimeType, data: backBase64 } });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts }],
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
            printer: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      category: "raspadinha",
      gameName: data.gameName || "",
      gameNumber: data.gameNumber || "000",
      releaseDate: new Date().getFullYear().toString(),
      size: "10x15cm",
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

export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => { return {}; };
export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => { return "Documento arquivado."; };