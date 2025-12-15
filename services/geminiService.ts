import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Efficient for vision tasks
    
    const parts: any[] = [
      {
        inlineData: {
          mimeType: mimeType,
          data: frontBase64
        }
      },
      {
        text: "Analise esta imagem de colecionismo. Determine a CATEGORIA (raspadinha ou lotaria). Extraia: Nome do Jogo, Número do Jogo, Data, Tamanho, Valores, Estado, País e Continente. IMPORTANTE: Se o país tiver regiões específicas (ex: Alemanha tem 'Baviera', 'Saxónia'; Portugal tem 'Açores'; Espanha tem 'Catalunha'), identifique a 'Região/Cantão' através de brasões ou texto. Identifique Emissão e Gráfica."
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
      parts[parts.length - 1].text += " Use o verso para confirmar a região/cantão, gráfica e tiragem.";
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
              description: "Tipo de item"
            },
            gameName: { type: Type.STRING, description: "Nome principal" },
            gameNumber: { type: Type.STRING, description: "Número de série" },
            releaseDate: { type: Type.STRING, description: "Data/Ano" },
            size: { type: Type.STRING, description: "Tamanho estimado" },
            values: { type: Type.STRING, description: "Valores de prêmios" },
            price: { type: Type.STRING, description: "Preço" },
            state: { 
              type: Type.STRING, 
              enum: ["AMOSTRA", "VOID", "MUESTRA", "CAMPIONE", "MINT", "CS", "SC"],
              description: "Estado"
            },
            country: { type: Type.STRING, description: "País" },
            region: { type: Type.STRING, description: "Região, Cantão, Estado ou Ilha (ex: Baviera, Açores)" },
            continent: { 
              type: Type.STRING, 
              enum: ["Europa", "América", "Ásia", "África", "Oceania"],
              description: "Continente"
            },
            emission: { type: Type.STRING, description: "Emissão total" },
            printer: { type: Type.STRING, description: "Gráfica" }
          },
          required: ["category", "gameName", "gameNumber", "state", "country", "continent"]
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

export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for technical details about the scratchcard or lottery: "${query}".
      Find: Game Name, Price, Game Number, Release Date, Emission, Printer, Region/State (if applicable).
      
      Output ONLY a JSON block like this:
      \`\`\`json
      {
        "gameName": "Name",
        "price": "5€",
        "gameNumber": "000",
        "releaseDate": "YYYY-MM-DD",
        "emission": "100.000",
        "printer": "Scientific Games",
        "values": "Max Prize...",
        "country": "Portugal",
        "region": "Açores",
        "category": "raspadinha"
      }
      \`\`\`
      If you can't find specific info, leave it empty string.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        ...parsed,
        state: 'MINT',
        continent: 'Europa', 
        size: '10x5cm' 
      };
    }
    
    throw new Error("Não foi possível encontrar dados estruturados.");

  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};