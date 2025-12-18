
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('italia') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('europa') || c.includes('germany') || c.includes('france') || c.includes('uk') || c.includes('austria') || c.includes('belgium')) return 'Europa';
  if (c.includes('argentina') || c.includes('brasil') || c.includes('eua') || c.includes('usa') || c.includes('canadá') || c.includes('américa') || c.includes('mexico') || c.includes('chile')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia') || c.includes('ásia') || c.includes('japan') || c.includes('korea')) return 'Ásia';
  if (c.includes('áfrica') || c.includes('africa') || c.includes('egito') || c.includes('marrocos')) return 'África';
  if (c.includes('oceania') || c.includes('austrália') || c.includes('australia')) return 'Oceania';
  return 'Europa'; // Default
};

// Fix: Added missing export for generateDocumentMetadata to resolve compilation error in HistoryModal.tsx
export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Como Chloe, a guardiã do arquivo, escreva uma breve descrição histórica ou técnica (máximo 2 parágrafos) para este documento intitulado "${title}". 
    O documento faz parte de um arquivo mundial de raspadinhas e lotarias. 
    Seja profissional e informativa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erro ao gerar metadados do documento:", error);
    return "";
  }
};

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const validMimeType = mimeType || "image/jpeg";

    const prompt = `Aja como Chloe, a guardiã do arquivo de Jorge Mesquita.
    Analise esta raspadinha/lotaria e extraia os dados técnicos exatos.
    
    CAMPOS OBRIGATÓRIOS:
    1. gameName: Nome do jogo.
    2. country: País de origem (ex: Argentina, Portugal, Brasil).
    3. continent: Continente correto (Europa, América, Ásia, África, Oceania).
    4. operator: Casa do Jogo / Entidade emissora (ex: SCML, SWISSLOS, Lotería de la Ciudad, ONCE, Jogos Santa Casa).
    5. region: Estado/Cantão/Região (se aplicável).
    6. gameNumber: Número do jogo/modelo.
    7. emission: Tiragem ou série (ex: 1.000.000).
    8. printer: Gráfica/Impressor (quem imprimiu, ex: Scientific Games, CBN).
    9. price: Preço facial (ex: 5€).
    10. size: Medidas/Tamanho (ex: 10x15cm).
    11. releaseDate: Ano de lançamento (apenas o ano).
    12. state: "SC" (raspada) ou "MINT" (nova).
    13. lines: Identifique a cor das linhas de segurança ou série.
    
    Retorne APENAS JSON puro. Se não ler algum campo, deixe vazio.`;

    const parts: any[] = [
      { inlineData: { mimeType: validMimeType, data: frontBase64 } }
    ];

    if (backBase64) {
      parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    }
    
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
            region: { type: Type.STRING },
            operator: { type: Type.STRING },
            state: { type: Type.STRING },
            values: { type: Type.STRING },
            emission: { type: Type.STRING },
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
      gameNumber: data.gameNumber || "000",
      releaseDate: data.releaseDate || new Date().getFullYear().toString(),
      size: data.size || "10x15cm",
      values: data.values || "",
      price: data.price || "",
      state: (data.state === "MINT" || data.state === "SC") ? data.state : "SC",
      country: data.country || "Portugal",
      continent: data.continent || getContinentFromCountry(data.country || "Portugal"),
      region: data.region || "",
      operator: data.operator || "",
      emission: data.emission || "",
      printer: data.printer || "",
      lines: data.lines || ""
    } as AnalysisResult;

  } catch (error) {
    console.error("Chloe falhou a leitura profunda:", error);
    return {
      category: "raspadinha",
      gameName: "",
      gameNumber: "",
      releaseDate: new Date().getFullYear().toString(),
      size: "10x15cm",
      values: "",
      price: "",
      state: "SC",
      country: "Portugal",
      continent: "Europa",
      operator: "",
      region: "",
      emission: "",
      printer: "",
      lines: ""
    };
  }
};
