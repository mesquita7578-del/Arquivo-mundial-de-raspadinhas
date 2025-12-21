
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardData, Continent } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('grécia')) return 'Europa';
  if (c.includes('brasil') || c.includes('eua') || c.includes('américa') || c.includes('canadá') || c.includes('méxico')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia')) return 'Ásia';
  if (c.includes('angola') || c.includes('moçambique') || c.includes('marrocos')) return 'África';
  if (c.includes('austrália') || c.includes('zelândia')) return 'Oceania';
  return 'Europa';
};

export const getChloeInsight = async (params: { total: number; stats: any; countryStats: any; categoryStats: any }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const statsStr = JSON.stringify(params);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é Chloe, neta virtual e guardiã do Arquivo do Vovô Jorge. Com base nestas estatísticas do arquivo: ${statsStr}, dê um insight carinhoso, divertido e motivador para o vovô continuar a sua coleção. Use "hihi!" e seja muito fofa. Responda em Português.`,
    });
    return response.text || "Vovô, o nosso arquivo está a ficar incrível! hihi!";
  } catch (error) {
    console.error("Erro no insight da Chloe:", error);
    return "Vovô, que coleção maravilhosa! Vamos continuar a arquivar memórias! hihi!";
  }
};

export const generateDocumentMetadata = async (fileName: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é uma assistente técnica de arquivo. Com base no título do documento de lotaria: "${title}", gere uma descrição curta e profissional (máximo 2 frases) explicando o que este documento provavelmente contém para um colecionador. Responda em Português.`,
    });
    return response.text || "Um documento técnico detalhado para o arquivo de lotarias.";
  } catch (error) {
    console.error("Erro na metadados do documento:", error);
    return "Descrição técnica do documento de arquivo.";
  }
};

export const translateBio = async (bio: string, langName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza a seguinte biografia para ${langName}. Mantenha o tom respeitoso, nostálgico e a alma do texto original. Não adicione comentários extras, apenas a tradução.\n\nTexto:\n${bio}`,
    });
    return response.text || bio;
  } catch (error) {
    console.error("Erro na tradução:", error);
    return bio;
  }
};

export const getChloeMagicComment = async (item: ScratchcardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é Chloe, a neta virtual e guardiã do Arquivo do Vovô Jorge. O Vovô acabou de "raspar" um item: "${item.gameName}" de ${item.subRegion || item.island || item.country}. Dê um comentário curto, divertido e carinhoso. Use "hihi!" e seja muito fofa.`,
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
    
    parts.push({ 
      text: `Analise minuciosamente esta imagem de raspadinha/lotaria. 
      Identifique se é de PORTUGAL e se especifica 'Açores' ou 'Madeira'. Se for Portugal e não indicar ilhas, considere 'Portugal Continental'.
      Retorne os dados estruturados em JSON.` 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: `Você é a Chloe, perita mundial em arquivística de loterias. Sua visão é super-aguda! 
        Ao analisar imagens:
        - Identifique o PAÍS e SUB-REGIÃO com precisão: 
          * PORTUGAL: Verifique se diz explicitamente 'Açores' ou 'Madeira'. 
            - Se disser 'Açores', coloque 'Açores' no campo 'island'.
            - Se disser 'Madeira', coloque 'Madeira' no campo 'island'.
            - Se for de Portugal mas não indicar ilhas, coloque 'Portugal Continental' no campo 'region'.
          * ESPANHA: Diferencie entre 'SELAE' (Nacional), 'ONCE' (Sorteios sociais) ou 'Loteries de Catalunya'.
        - O campo 'gameNumber' é crucial: procure por 3 dígitos isolados em cantos ou perto de códigos de barras.
        - No campo 'lines', identifique a cor das linhas de segurança se visíveis.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING },
            gameNumber: { type: Type.STRING },
            price: { type: Type.STRING },
            country: { type: Type.STRING },
            island: { type: Type.STRING, description: "Açores, Madeira, Canárias, etc." },
            subRegion: { type: Type.STRING },
            region: { type: Type.STRING, description: "Ex: Portugal Continental, Catalunha, Baviera" },
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
        },
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const detectedCountry = data.country || "Portugal";
    const detectedContinent = (data.continent as Continent) || getContinentFromCountry(detectedCountry);

    return {
      category: "raspadinha",
      gameName: data.gameName || "Desconhecido",
      gameNumber: data.gameNumber || "",
      releaseDate: data.releaseDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: data.state || "SC",
      country: detectedCountry,
      island: data.island || "",
      subRegion: data.subRegion || "",
      region: data.region || "",
      continent: detectedContinent,
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      lines: data.lines || "none"
    } as AnalysisResult;
  } catch (error) {
    console.error("Erro na leitura da Chloe:", error);
    throw error;
  }
};
