import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; 
    
    // Ensure mimeType is valid
    const validMimeType = mimeType || "image/jpeg";

    const parts: any[] = [
      {
        inlineData: {
          mimeType: validMimeType,
          data: frontBase64
        }
      },
      {
        text: `You are an expert archivist for Scratchcards (Raspadinhas) and Lottery tickets.
        
        TASK: Extract technical data from this image.
        
        CRITICAL RULES:
        1. If you are unsure, GUESS based on context. Do not return empty strings.
        2. COUNTRY: Infer from language/currency. 
           - "Santa Casa", "Misericórdia", "Prémio" -> Portugal.
           - "Loterías y Apuestas", "Premio" -> Espanha.
           - "Gratta e Vinci" -> Itália.
           - "Lottery", "£" -> Reino Unido.
           - "$" -> EUA.
        3. STATE: 
           - If scratch area is silver/gray and intact -> "MINT".
           - If scratched/revealed -> "SC".
           - If it has "VOID", "SPECIMEN", "00000" -> "AMOSTRA".
        4. NAME: The largest text on the card.
        
        OUTPUT FORMAT:
        Return ONLY a raw JSON object (no markdown, no backticks) with these keys:
        {
          "gameName": "string",
          "gameNumber": "string (look for small numbers like Mod. 502 or No. 100)",
          "price": "string (e.g. 5€)",
          "country": "string",
          "printer": "string (look for small logos like SG, Pollard, IGT)",
          "emission": "string (if visible)",
          "state": "MINT" or "SC" or "AMOSTRA",
          "releaseDate": "YYYY",
          "values": "string (list max prizes)"
        }`
      }
    ];

    if (backBase64) {
      parts.splice(1, 0, {
        inlineData: {
          mimeType: validMimeType,
          data: backBase64
        }
      });
      parts[parts.length - 1].text += " Use the back image to read the Barcode numbers, Printer name and Regulations.";
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: parts
        }
      ]
      // REMOVED responseSchema and responseMimeType to allow the model to be more flexible/creative
      // and prevent "empty object" errors when validation fails.
    });

    if (response.text) {
      // Robust Cleaning Logic
      let cleanJson = response.text.trim();
      // Remove markdown code blocks if present
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let data: any = {};
      try {
        data = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error, attempting manual extraction", cleanJson);
        // Fallback: If JSON fails, returns basic defaults
        return {
           category: "raspadinha",
           gameName: "Nome Não Detetado",
           gameNumber: "",
           releaseDate: new Date().getFullYear().toString(),
           size: "",
           values: "",
           price: "",
           state: "SC",
           country: "Desconhecido",
           continent: "Europa",
           region: "",
           emission: "",
           printer: ""
        };
      }

      // Normalization
      return {
        category: "raspadinha", // Default
        gameName: data.gameName || "Sem Nome",
        gameNumber: data.gameNumber || "",
        releaseDate: data.releaseDate || new Date().getFullYear().toString(),
        size: "",
        values: data.values || "",
        price: data.price || "",
        state: (data.state && ["MINT", "SC", "AMOSTRA", "VOID"].includes(data.state.toUpperCase())) ? data.state.toUpperCase() : "SC",
        country: data.country || "Desconhecido",
        region: "",
        continent: "Europa", // We let the UI default this or user change it
        emission: data.emission || "",
        printer: data.printer || ""
      } as AnalysisResult;
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Return empty structure so UI doesn't crash
    return {
      category: "raspadinha",
      gameName: "Erro na Leitura",
      gameNumber: "",
      releaseDate: "",
      size: "",
      values: "",
      price: "",
      state: "SC",
      country: "Desconhecido",
      continent: "Europa",
      region: "",
      emission: "",
      printer: ""
    };
  }
};

export const searchScratchcardInfo = async (query: string): Promise<Partial<AnalysisResult>> => {
  // Keep existing search logic but add safety
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search technical info for scratchcard: "${query}". Return JSON with gameName, price, country, printer.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
  } catch (error) {
    return {};
  }
};

export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
    // Keep existing
    return "Documento arquivado.";
};