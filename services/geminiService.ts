import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

// Inicializa o cliente Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    // Usamos o modelo Flash Preview que é excelente a ler texto
    const modelId = "gemini-3-flash-preview"; 
    const validMimeType = mimeType || "image/jpeg";

    const prompt = `Aja como Chloe, a guardiã do arquivo de Jorge Mesquita.
    Analise esta raspadinha/lotaria e extraia os dados.
    
    CAMPOS OBRIGATÓRIOS (Tente o seu melhor):
    1. gameName: Nome do jogo em letras grandes.
    2. country: Se vir "Santa Casa" ou "SCML" é Portugal. Se vir "Gratta" é Itália.
    3. state: "SC" se estiver raspada, "MINT" se estiver nova.
    4. gameNumber: O número do jogo (ex: Mod. 502).
    
    Retorne APENAS um JSON limpo. Se não conseguir ler nada, invente o mais provável para Portugal.`;

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
            state: { type: Type.STRING },
            values: { type: Type.STRING }
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
      region: "",
      emission: "",
      printer: ""
    } as AnalysisResult;

  } catch (error) {
    console.error("Chloe falhou a leitura, mas o arquivo continua:", error);
    // Retorno de emergência para não travar o Jorge
    return {
      category: "raspadinha",
      gameName: "",
      gameNumber: "",
      releaseDate: new Date().getFullYear().toString(),
      size: "",
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
  return {};
};

export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  return "Documento arquivado no acervo digital.";
};