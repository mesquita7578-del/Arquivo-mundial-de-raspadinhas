
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
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
    7. state: "SC" (raspada) ou "MINT" (nova).
    
    Retorne APENAS JSON puro. Se não ler algum campo, deixe vazio.`;

    const parts: any[] = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } }
    ];

    if (backBase64) {
      parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

// Implementação da busca externa com Google Search
export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise informações oficiais sobre esta raspadinha/lotaria: "${query}". Tente encontrar o país, ano de lançamento, gráfica e preço original. Retorne os dados em formato JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao pesquisar informações:", error);
    return {};
  }
};

// Implementação da geração de metadados para documentos
export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Como arquivista especialista, gere um resumo técnico e breve (até 150 caracteres) para um documento PDF intitulado: "${title}". O resumo deve ser formal e em português.`,
    });
    return response.text?.trim() || "Documento catalogado no arquivo mundial.";
  } catch (error) {
    console.error("Erro ao gerar resumo do documento:", error);
    return "Documento arquivado.";
  }
};
