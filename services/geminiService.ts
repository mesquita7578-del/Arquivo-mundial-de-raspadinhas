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
        text: `Analise esta imagem de colecionismo. Determine a CATEGORIA (raspadinha ou lotaria). 
        Extraia: Nome do Jogo, Número do Jogo, Data, Tamanho, Valores, Estado, País e Continente.
        
        IMPORTANTE - ESTADO (STATE):
        Identifique se é uma amostra. Procure por textos como:
        - "AMOSTRA" (PT)
        - "MUESTRA" (ES)
        - "CAMPIONE" (IT)
        - "VOID" ou "SPECIMEN" (EN)
        - "MUSTER" (DE)
        - "ÉCHANTILLON" (FR)
        - "견본" (KR)
        - "STEEKPROEF" (NL)
        - "PRØVE" (DK/NO)
        - "PROV" (SE)
        - "样本" (CN)
        
        IMPORTANTE - DETEÇÃO DE GRÁFICA (PRINTER) VIA FSC:
        Procure atentamente por logotipos FSC (Forest Stewardship Council) e o respetivo código de licença (ex: FSC® C108706).
        Use este código para identificar a "Gráfica" (Printer) se o nome não estiver explícito.
        - FSC C108706, C016391, C105807 -> Scientific Games (SG)
        - FSC C014168 -> Pollard Banknote
        - FSC C005483 -> IGT
        - FSC C112248 -> Eagle Press
        
        IMPORTANTE - REGIÃO:
        Se o país tiver regiões específicas (ex: Alemanha tem 'Baviera', 'Saxónia'; Portugal tem 'Açores'; Espanha tem 'Catalunha'), identifique a 'Região/Cantão' através de brasões ou texto.`
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
      parts[parts.length - 1].text += " Use o verso para confirmar a região/cantão, e procure códigos FSC no verso para identificar a Gráfica.";
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
              enum: ["AMOSTRA", "VOID", "MUESTRA", "CAMPIONE", "SPECIMEN", "MUSTER", "ÉCHANTILLON", "견본", "STEEKPROEF", "PRØVE", "PROV", "样本", "MINT", "CS", "SC"],
              description: "Estado (International Variants)"
            },
            country: { type: Type.STRING, description: "País" },
            region: { type: Type.STRING, description: "Região, Cantão, Estado ou Ilha (ex: Baviera, Açores)" },
            continent: { 
              type: Type.STRING, 
              enum: ["Europa", "América", "Ásia", "África", "Oceania"],
              description: "Continente"
            },
            emission: { type: Type.STRING, description: "Emissão total" },
            printer: { type: Type.STRING, description: "Gráfica (Identificada via nome ou código FSC)" }
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