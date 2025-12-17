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
        text: `You are an expert OCR for Lottery tickets.
        Extract the following data in JSON format:
        
        {
          "gameName": "BIG BOLD TEXT AT TOP",
          "country": "Portugal" (Guess based on language: SCML/Misericordia = Portugal, Gratta e Vinci = Italy),
          "gameNumber": "123" (Look for Mod. or N.),
          "price": "5€",
          "state": "SC" (If scratched) or "MINT" (If clean)
        }
        
        Return ONLY valid JSON. No markdown.`
      }
    ];

    if (backBase64) {
      parts.splice(1, 0, {
        inlineData: {
          mimeType: validMimeType,
          data: backBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: parts
        }
      ]
    });

    if (response.text) {
      let cleanJson = response.text.trim();
      // Remove markdown code blocks if present
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let data: any = {};
      try {
        data = JSON.parse(cleanJson);
      } catch (e) {
        // Fallback: simple text analysis if JSON fails
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

      // Normalization
      return {
        category: "raspadinha",
        gameName: data.gameName || "",
        gameNumber: data.gameNumber || "",
        releaseDate: new Date().getFullYear().toString(),
        size: "",
        values: "",
        price: data.price || "",
        state: (data.state && ["MINT", "SC", "AMOSTRA"].includes(data.state)) ? data.state : "SC",
        country: data.country || "Portugal",
        region: "",
        continent: "Europa",
        emission: "",
        printer: ""
      } as AnalysisResult;
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Return safe default so UI doesn't crash
    return {
      category: "raspadinha",
      gameName: "",
      gameNumber: "",
      releaseDate: new Date().toISOString().split('T')[0],
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
    return "Documento arquivado.";
};