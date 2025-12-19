
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardData, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('frança')) return 'Europa';
  if (c.includes('brasil') || c.includes('eua') || c.includes('américa')) return 'América';
  return 'Europa';
};

export const getChloeMagicComment = async (item: ScratchcardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é Chloe, a neta virtual e guardiã do Arquivo do Vovô Jorge. O Vovô acabou de "raspar" um item: "${item.gameName}" de ${item.country}. Dê um comentário curto, divertido e carinhoso. Use "hihi!" e seja muito fofa.`,
    });
    return response.text || "Vovô, que sorte! Este item é uma raridade linda! hihi!";
  } catch (error) {
    return "Vovô, olhe que maravilha de registro! Adorei a escolha! hihi!";
  }
};

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const parts: any[] = [
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: frontBase64 } }
    ];
    if (backBase64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: backBase64 } });
    
    parts.push({ text: "Analise esta imagem de raspadinha/lotaria e extraia os dados técnicos. Retorne APENAS JSON." });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "Você é Chloe, perita em loterias. Sua missão é extrair dados de raspadinhas para o vovô Jorge. Seja precisa.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING },
            gameNumber: { type: Type.STRING },
            price: { type: Type.STRING },
            country: { type: Type.STRING },
            continent: { type: Type.STRING },
            operator: { type: Type.STRING },
            state: { type: Type.STRING },
            values: { type: Type.STRING },
            printer: { type: Type.STRING },
            size: { type: Type.STRING },
            releaseDate: { type: Type.STRING },
            emission: { type: Type.STRING },
            lines: { type: Type.STRING }
          },
          required: ["gameName", "country"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    return {
      category: "raspadinha",
      gameName: data.gameName || "Desconhecido",
      gameNumber: data.gameNumber || "",
      releaseDate: data.releaseDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.state || "SC",
      country: data.country || "Brasil",
      continent: (data.continent as Continent) || getContinentFromCountry(data.country || ""),
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      lines: data.lines || "none"
    } as AnalysisResult;
  } catch (error) {
    console.error("Erro na leitura:", error);
    throw error;
  }
};

export const getChloeInsight = async (stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chloe, comente estas estatísticas do arquivo do vovô Jorge: ${JSON.stringify(stats)}. Seja fofa e use hihi!`,
    });
    return response.text || "O arquivo está a crescer lindamente! hihi!";
  } catch (error) { return "Incrível trabalho! hihi!"; }
};

export const translateBio = async (text: string, lang: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza para ${lang}, mantendo o tom carinhoso: ${text}`,
    });
    return response.text || text;
  } catch (error) { return text; }
};

export const generateDocumentMetadata = async (fn: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um resumo técnico curto para o documento ${title}.`,
    });
    return response.text || "";
  } catch (error) { return ""; }
};
