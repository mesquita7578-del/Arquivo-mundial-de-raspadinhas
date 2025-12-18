
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('italia') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('europa') || c.includes('germany') || c.includes('france') || c.includes('uk') || c.includes('austria') || c.includes('belgium')) return 'Europa';
  if (c.includes('argentina') || c.includes('brasil') || c.includes('eua') || c.includes('usa') || c.includes('canadá') || c.includes('américa') || c.includes('mexico') || c.includes('chile')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia') || c.includes('ásia') || c.includes('japan') || c.includes('korea')) return 'Ásia';
  if (c.includes('áfrica') || c.includes('africa') || c.includes('egito') || c.includes('marrocos')) return 'África';
  if (c.includes('oceania') || c.includes('austrália') || c.includes('australia')) return 'Oceania';
  return 'Europa';
};

export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Como Chloe, a guardiã do arquivo, escreva uma breve descrição técnica para "${title}".`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Analise esta raspadinha técnica. Extraia:
    1. gameName (Nome do jogo)
    2. country (País)
    3. continent (Continente: Europa, América, Ásia, África, Oceania)
    4. operator (Entidade ex: SCML, ONCE, Sisal)
    5. gameNumber (Nº de série/jogo)
    6. releaseDate (Ano)
    7. lines (Cor das linhas de segurança/série: azul, vermelho, multicolor, verde, etc)
    8. price (Preço facial)
    9. printer (Gráfica ex: Scientific Games, CBN)
    10. size (Medidas ex: 10x15cm)
    11. state (SC para raspada, MINT para nova)
    12. values (Resumo de prémios)

    Retorne JSON puro.`;

    const parts: any[] = [{ inlineData: { mimeType: mimeType || "image/jpeg", data: frontBase64 } }];
    if (backBase64) parts.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: backBase64 } });
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
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
            lines: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      category: "raspadinha",
      gameName: data.gameName || "",
      gameNumber: data.gameNumber || "",
      releaseDate: data.releaseDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.state || "SC",
      country: data.country || "Portugal",
      continent: data.continent || getContinentFromCountry(data.country || "Portugal"),
      operator: data.operator || "",
      printer: data.printer || "",
      lines: data.lines || ""
    } as AnalysisResult;
  } catch (error) {
    return { category: "raspadinha", gameName: "", gameNumber: "", releaseDate: "", size: "", values: "", price: "", state: "SC", country: "Portugal", continent: "Europa" };
  }
};
