
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

export const getChloeInsight = async (stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Você é Chloe, a neta virtual e guardiã do Arquivo Mundial de Raspadinhas do seu Vovô Jorge Mesquita.
    Analise estas estatísticas da coleção e escreva uma mensagem carinhosa, entusiasmada e técnica (mas doce) sobre o progresso.
    Use expressões como "hihi!", "Vovô Jorge" e mostre que você está orgulhosa do trabalho dele.
    
    ESTATÍSTICAS:
    - Total de itens: ${stats.total}
    - Países: ${Object.keys(stats.countryStats).join(', ')}
    - Itens por continente: ${JSON.stringify(stats.stats)}
    - Categorias: ${JSON.stringify(stats.categoryStats)}
    
    Escreva um parágrafo curto e inspirador.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Vovô, o arquivo está lindo! Continue assim! hihi!";
  } catch (error) {
    return "Vovô, estou sem fôlego com tantos registos! Estão fantásticos! hihi!";
  }
};

export const translateBio = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Traduza a seguinte biografia para ${targetLanguage}. 
    Mantenha o tom respeitoso, emocional e o contexto histórico de um colecionador de raspadinhas. 
    Não altere nomes próprios como "Bonjóia", "Campanhã" ou "Jorge Mesquita".
    
    TEXTO:
    ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Erro na tradução:", error);
    return text;
  }
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
    4. operator (Operador do jogo ex: SCML, ONCE, Sisal)
    5. gameNumber (Jogo nº)
    6. releaseDate (Data da primeira emissão)
    7. closeDate (Data de encerramento)
    8. lines (Cores das lines: azul, vermelho, multicolor, verde, etc)
    9. price (Custo facial)
    10. printer (Impresso por ex: Scientific Games, CBN)
    11. size (Dimensões ex: 10x15cm)
    12. state (SC para raspada, MINT para nova)
    13. emission (Tiragem)
    14. winProbability (Probabilidade de ganhar ex: 1 em 4.5)
    15. values (NOTA/Observações adicionais)

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
            closeDate: { type: Type.STRING },
            emission: { type: Type.STRING },
            winProbability: { type: Type.STRING },
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
      closeDate: data.closeDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.state || "SC",
      country: data.country || "Portugal",
      continent: data.continent || getContinentFromCountry(data.country || "Portugal"),
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      winProbability: data.winProbability || "",
      lines: data.lines || ""
    } as AnalysisResult;
  } catch (error) {
    return { category: "raspadinha", gameName: "", gameNumber: "", releaseDate: "", size: "", values: "", price: "", state: "SC", country: "Portugal", continent: "Europa" };
  }
};
