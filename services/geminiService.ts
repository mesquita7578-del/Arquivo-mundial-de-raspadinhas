import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Efficient for vision tasks
    
    // Ensure mimeType is valid, fallback if empty
    const validMimeType = mimeType || "image/jpeg";

    const parts: any[] = [
      {
        inlineData: {
          mimeType: validMimeType,
          data: frontBase64
        }
      },
      {
        text: `Analise esta imagem de colecionismo (Raspadinha ou Lotaria).
        
        TAREFA: Extraia os dados visuais para preencher a ficha técnica.
        
        REGRAS DE EXTRAÇÃO:
        1. Categoria: Se tiver "Raspe aqui" ou superfície de raspar, é "raspadinha". Se for bilhete inteiro/fracção com números, é "lotaria".
        2. Estado:
           - "MINT" se estiver intacta (nova).
           - "SC" (Scratched) se estiver raspada.
           - "AMOSTRA" se tiver carimbos como "VOID", "SPECIMEN", "MUESTRA", "CAMPIONE", "00000".
        3. Gráfica (Printer): Procure códigos FSC ou logótipos pequenos (ex: SG, IGT, POLLARD, SCIENTIFIC GAMES).
        4. Região: Se for de Espanha, veja se é "Catalunya", "ONCE" (Nacional) ou "SELAE". Se for Alemanha, veja o estado (ex: Bayern).
        
        Retorne JSON puro.`
      }
    ];

    if (backBase64) {
      parts.splice(1, 0, {
        inlineData: {
          mimeType: validMimeType,
          data: backBase64
        }
      });
      parts[parts.length - 1].text += " Use o verso para confirmar a região, códigos de barras e a Gráfica (Printer).";
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
              description: "raspadinha, lotaria, boletim, ou objeto"
            },
            gameName: { type: Type.STRING, description: "Nome do jogo em destaque" },
            gameNumber: { type: Type.STRING, description: "Número do jogo (ex: 502, 105)" },
            releaseDate: { type: Type.STRING, description: "Ano ou Data estimada (YYYY-MM-DD)" },
            size: { type: Type.STRING, description: "Dimensões aproximadas" },
            values: { type: Type.STRING, description: "Resumo dos prémios ou notas históricas" },
            price: { type: Type.STRING, description: "Preço facial (ex: 5€, $10)" },
            state: { 
              type: Type.STRING, 
              description: "Estado da raspadinha (MINT, SC, AMOSTRA, VOID, SPECIMEN)"
            },
            country: { type: Type.STRING, description: "País de origem" },
            region: { type: Type.STRING, description: "Região, Estado ou Cantão" },
            continent: { 
              type: Type.STRING, 
              description: "Europa, América, Ásia, África, Oceania"
            },
            emission: { type: Type.STRING, description: "Tiragem / Emissão total" },
            printer: { type: Type.STRING, description: "Gráfica (Scientific Games, Pollard, etc)" }
          },
          required: ["category", "gameName", "country"]
        }
      }
    });

    if (response.text) {
      // Cleaning Logic: Remove markdown code blocks if the model adds them despite config
      let cleanJson = response.text.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
      }
      
      const data = JSON.parse(cleanJson);

      // Post-processing normalization
      return {
        ...data,
        continent: data.continent || "Europa", // Default safety
        state: data.state ? data.state.toUpperCase() : "MINT" // Normalize casing
      } as AnalysisResult;
    }
    
    throw new Error("Resposta vazia da IA");
  } catch (error) {
    console.error("Erro ao analisar raspadinha com Gemini:", error);
    // Fallback gracefully so the user can at least fill manually
    return {
      category: "raspadinha",
      gameName: "Não identificado",
      gameNumber: "",
      releaseDate: new Date().toISOString().split('T')[0],
      size: "",
      values: "",
      state: "SC",
      country: "",
      continent: "Europa",
      printer: "",
      emission: "",
      region: ""
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

    let text = response.text || "";
    // Robust cleanup for search result
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
       text = jsonMatch[1];
    } else {
       text = text.replace(/^```json/, '').replace(/```$/, '');
    }
    
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      state: 'MINT',
      continent: 'Europa', 
      size: '10x5cm' 
    };

  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

// New function to generate a rich description for PDF documents
export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as an expert archivist for a Lottery and Scratchcard museum. 
      The user is uploading a document (PDF) with the following details:
      File Name: "${fileName}"
      User Title: "${title}"
      
      Please generate a professional, short description (in Portuguese) for this document record. 
      Hypothesize what is likely inside based on the title (e.g. if it says "Natal 2004", mention it likely contains holiday themes, prize lists, etc).
      Start with "Este documento contém..." or similar. Keep it under 3 sentences.`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating doc metadata", error);
    return "Documento arquivado digitalmente. Contém registos históricos.";
  }
};