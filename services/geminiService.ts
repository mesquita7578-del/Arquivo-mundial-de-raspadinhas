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
        text: `És um especialista em arquivar Raspadinhas e Lotarias.
        Analise a imagem e extraia os dados técnicos com precisão.
        
        INSTRUÇÕES CRÍTICAS DE DEDUÇÃO (NUNCA DEIXE CAMPOS VAZIOS SE PUDER DEDUZIR):
        1. PAÍS: Se não estiver explícito, DEDUZA pelo idioma ou moeda.
           - Português + "SCML" ou "Jogos Santa Casa" -> "Portugal"
           - Português + "Reais" -> "Brasil"
           - Italiano -> "Itália"
           - Espanhol -> "Espanha"
           - Inglês + £ -> "Reino Unido"
           - Inglês + $ -> "EUA" (ou verifique estado)
        2. ESTADO:
           - Se vir marcas de raspagem prateadas removidas -> "SC" (Raspada).
           - Se estiver limpa -> "MINT" (Nova).
           - Se tiver carimbos "NULO", "VOID", "SPECIMEN", "00000" -> "AMOSTRA".
        3. DATA/ANO: Procure copyrights pequenos (ex: ©2023). Se não houver, estime pelo estilo.
        4. NOME: O texto maior e mais destacado no topo.
        
        Retorne um JSON válido.`
      }
    ];

    if (backBase64) {
      parts.splice(1, 0, {
        inlineData: {
          mimeType: validMimeType,
          data: backBase64
        }
      });
      parts[parts.length - 1].text += " Use o verso para ler códigos de barras, regras e confirmar a Gráfica (Printer) no rodapé.";
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
            gameName: { type: Type.STRING, description: "Nome principal do jogo" },
            gameNumber: { type: Type.STRING, description: "Número do jogo/série (ex: 502)" },
            releaseDate: { type: Type.STRING, description: "Ano aproximado (YYYY)" },
            size: { type: Type.STRING, description: "Dimensões estimadas (ex: 10x5cm)" },
            values: { type: Type.STRING, description: "Lista de prémios ou texto de destaque" },
            price: { type: Type.STRING, description: "Preço facial (ex: 5€)" },
            state: { 
              type: Type.STRING, 
              description: "Estado calculado: MINT, SC, AMOSTRA, VOID"
            },
            country: { type: Type.STRING, description: "País de origem" },
            region: { type: Type.STRING, description: "Região se aplicável (ex: Açores, Baviera)" },
            continent: { 
              type: Type.STRING, 
              description: "Europa, América, Ásia, África, Oceania"
            },
            emission: { type: Type.STRING, description: "Tiragem total se visível" },
            printer: { type: Type.STRING, description: "Gráfica (Scientific Games, Pollard, Lottomatica)" }
          },
          // Removi o "required" para evitar que a IA falhe se não tiver a certeza absoluta.
          // Ela agora vai tentar preencher tudo o que conseguir.
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

      // Normalização de Segurança
      return {
        category: data.category || "raspadinha",
        gameName: data.gameName || "Sem Nome Identificado",
        gameNumber: data.gameNumber || "",
        releaseDate: data.releaseDate || new Date().getFullYear().toString(),
        size: data.size || "",
        values: data.values || "",
        price: data.price || "",
        state: data.state ? data.state.toUpperCase() : "SC",
        country: data.country || "Desconhecido",
        region: data.region || "",
        continent: data.continent || "Europa",
        emission: data.emission || "",
        printer: data.printer || ""
      } as AnalysisResult;
    }
    
    throw new Error("Resposta vazia da IA");
  } catch (error) {
    console.error("Erro ao analisar raspadinha com Gemini:", error);
    // Fallback gracefully: Preenche com "Desconhecido" em vez de vazio para o utilizador ver que tentámos
    return {
      category: "raspadinha",
      gameName: "Falha na Leitura",
      gameNumber: "",
      releaseDate: new Date().toISOString().split('T')[0],
      size: "",
      values: "Tente tirar uma foto mais clara ou com melhor luz.",
      state: "SC",
      country: "Desconhecido",
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