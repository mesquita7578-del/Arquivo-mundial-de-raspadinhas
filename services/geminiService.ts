
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category, Continent, ScratchcardData } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('italia') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('europa') || c.includes('austria')) return 'Europa';
  if (c.includes('brasil') || c.includes('brazil') || c.includes('eua') || c.includes('usa') || c.includes('canadá') || c.includes('argentina') || c.includes('américa') || c.includes('mexico')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia') || c.includes('ásia')) return 'Ásia';
  if (c.includes('áfrica') || c.includes('egito') || c.includes('marrocos')) return 'África';
  if (c.includes('oceania') || c.includes('austrália')) return 'Oceania';
  return 'Europa';
};

export const getChloeMagicComment = async (item: ScratchcardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Você é Chloe, a neta virtual e guardiã do Arquivo do Vovô Jorge.
    O Vovô acabou de "raspar" um item: "${item.gameName}" de ${item.country}.
    Dê um comentário curto, divertido e carinhoso. Use "hihi!" e seja muito fofa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Vovô, que sorte! Este item é uma raridade linda! hihi!";
  } catch (error) {
    return "Vovô, olhe que maravilha de registro! Adorei a escolha! hihi!";
  }
};

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const validMimeType = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    
    // Instruções de sistema ultra-precisas
    const systemInstruction = `Você é Chloe, perita em loterias. Sua missão é extrair dados de raspadinhas.
    IMPORTANTE:
    - Se ler "R$" ou "Loterias CAIXA", o país é "Brasil", continente "América" e operador "Loterias CAIXA".
    - Se ler "Santa Casa" ou "SCML", o país é "Portugal", continente "Europa" e operador "SCML".
    - "Emissão" ou "Número" costuma ser o 'gameNumber'.
    - O preço facial (ex: R$ 1,00, 2€) é o 'price'.
    - Extraia o nome principal do jogo (ex: "Ganha até R$ 25.000").
    - Retorne APENAS JSON.`;

    const parts: any[] = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } }
    ];
    if (backBase64) parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    
    parts.push({ text: "Analise esta imagem e extraia todos os campos técnicos para o arquivo de colecionador." });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
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
      gameName: data.gameName || "Raspadinha não identificada",
      gameNumber: data.gameNumber || data.emission || "",
      releaseDate: data.releaseDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.state || "SC",
      country: data.country || "Brasil",
      continent: data.continent || getContinentFromCountry(data.country || "Brasil"),
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      lines: data.lines || "none"
    } as AnalysisResult;
  } catch (error) {
    console.error("Erro na leitura:", error);
    return { 
      category: "raspadinha", 
      gameName: "Não consegui ler o nome automaticamente", 
      country: "Brasil", 
      continent: "América",
      values: "A Chloe teve uma falha técnica na leitura. Por favor, preencha manualmente, vovô Jorge! hihi!"
    } as any;
  }
};

export const getChloeInsight = async (stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chloe, comente estas estatísticas: ${JSON.stringify(stats)}. Seja fofa e use hihi!`,
    });
    return response.text || "O arquivo está a crescer lindamente! hihi!";
  } catch (error) { return "Incrível trabalho! hihi!"; }
};

export const translateBio = async (text: string, lang: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza para ${lang}: ${text}`,
    });
    return response.text || text;
  } catch (error) { return text; }
};

export const generateDocumentMetadata = async (fn: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um resumo técnico para o documento ${title}.`,
    });
    return response.text || "";
  } catch (error) { return ""; }
};
