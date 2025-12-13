import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Efficient for vision tasks
    
    const parts = [
      {
        inlineData: {
          mimeType: mimeType,
          data: frontBase64
        }
      },
      {
        text: "Analise esta imagem de raspadinha. Extraia: Nome do Jogo, Número do Jogo, Data/Ano, Tamanho estimado, Valores de prêmios, Estado (MINT, VOID, etc), País e Continente. Tente identificar o 'Preço Facial' (custo do bilhete, ex: 5€, $10) geralmente em destaque. Identifique também a 'Emissão' (tiragem) e 'Gráfica' (printer) se visível."
      }
    ];

    if (backBase64) {
      parts.splice(1, 0, {
        inlineData: {
          mimeType: mimeType,
          data: backBase64
        }
      });
      // Update text prompt if back is included
      parts[parts.length - 1].text += " Use a imagem do verso para identificar regras, preço, país, gráfica e tiragem.";
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING, description: "Nome principal impresso no bilhete" },
            gameNumber: { type: Type.STRING, description: "Número de série ou código do jogo (ex: 005)" },
            releaseDate: { type: Type.STRING, description: "Data no formato YYYY-MM-DD ou apenas Ano" },
            size: { type: Type.STRING, description: "Estimativa de tamanho (ex: 10x5cm)" },
            values: { type: Type.STRING, description: "Lista de valores monetários impressos na frente" },
            price: { type: Type.STRING, description: "Preço de custo do bilhete (ex: 5€, 10$)" },
            state: { 
              type: Type.STRING, 
              enum: ["AMOSTRA", "VOID", "MUESTRA", "CAMPIONE", "MINT", "CS", "SC"],
              description: "O estado de conservação ou tipo do bilhete"
            },
            country: { type: Type.STRING, description: "País de origem da raspadinha" },
            continent: { 
              type: Type.STRING, 
              enum: ["Europa", "América", "Ásia", "África", "Oceania"],
              description: "Continente do país"
            },
            emission: { type: Type.STRING, description: "Emissão ou tiragem total (ex: 500.000 un)" },
            printer: { type: Type.STRING, description: "Empresa que imprimiu (ex: Scientific Games, Pollard)" }
          },
          required: ["gameName", "gameNumber", "size", "values", "state", "country", "continent"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("Resposta vazia da IA");
  } catch (error) {
    console.error("Erro ao analisar raspadinha com Gemini:", error);
    // Fallback in case of error
    return {
      gameName: "Desconhecido",
      gameNumber: "???",
      releaseDate: new Date().toISOString().split('T')[0],
      size: "Padrão",
      values: "Vários",
      state: "SC",
      country: "Desconhecido",
      continent: "Europa"
    };
  }
};