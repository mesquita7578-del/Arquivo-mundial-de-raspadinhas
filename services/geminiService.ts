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
        text: "Analise esta imagem de colecionismo. Primeiro, determine a CATEGORIA: É uma 'raspadinha' (tem área de látex para raspar, prémio instantâneo) ou uma 'lotaria' (bilhete de sorteio, totoloto, rifa nacional, sem área de raspar, com data de extração/draw date)? Extraia: Nome do Jogo/Lotaria, Número do Jogo/Sorteio, Data/Ano (Draw Date), Tamanho estimado, Valores de prêmios (se visível), Estado (MINT, VOID, etc), País e Continente. Identifique o 'Preço Facial'. Identifique 'Emissão' e 'Gráfica' se visível."
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
            category: {
              type: Type.STRING,
              enum: ["raspadinha", "lotaria"],
              description: "Tipo de item: raspadinha (instantâneo) ou lotaria (sorteio)"
            },
            gameName: { type: Type.STRING, description: "Nome principal impresso no bilhete" },
            gameNumber: { type: Type.STRING, description: "Número de série, código do jogo ou número do sorteio (Draw No)" },
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
          required: ["category", "gameName", "gameNumber", "size", "values", "state", "country", "continent"]
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
      category: "raspadinha",
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