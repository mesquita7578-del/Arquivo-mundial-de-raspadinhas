
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
      Procure por: 
      1. Título do jogo (letras grandes). 
      2. Número do jogo (geralmente 3 dígitos, ex: 105, 542). 
      3. Preço (ex: 1€, 5€, 2$). 
      4. Operador (Logotipos como SCML, ONCE, SELAE, Sisal, FDJ). 
      5. Procure por carimbos de 'ESPECIME', 'AMOSTRA', 'VOID' ou 'SAMPLE' para determinar o estado.
      6. Identifique se pertence a uma região específica como Açores ou Catalunha.
      Retorne os dados estruturados em JSON.` 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: `Você é a Chloe, perita mundial em arquivística de loterias. Sua visão é super-aguda! 
        Ao analisar imagens:
        - Identifique o PAÍS e SUB-REGIÃO com precisão: 
          * PORTUGAL: Verifique se diz 'Açores' ou 'Madeira'. Se não, é 'SCML Continente'.
          * ESPANHA: Diferencie entre 'SELAE' (Nacional), 'ONCE' (Sorteios sociais) ou 'Loteries de Catalunya'.
          * ITÁLIA: Verifique se é 'Lottomatica' ou 'Sisal'.
        - O campo 'gameNumber' é crucial: procure por 3 dígitos isolados em cantos ou perto de códigos de barras.
        - Se vir carimbos de cancelamento ou amostra, defina 'state' como 'AMOSTRA'. Se estiver virgem/intacta, 'MINT'. Se raspada, 'SC'.
        - No campo 'lines', se vir linhas de segurança (geralmente no verso ou margens), identifique a cor (blue, red, green...).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING },
            gameNumber: { type: Type.STRING },
            price: { type: Type.STRING },
            country: { type: Type.STRING },
            island: { type: Type.STRING },
            subRegion: { type: Type.STRING },
            continent: { type: Type.STRING },
            operator: { type: Type.STRING },
            state: { 
              type: Type.STRING,
              description: "MINT, SC, CS, AMOSTRA, VOID, SAMPLE, MUESTRA, etc."
            },
            values: { 
              type: Type.STRING,
              description: "Notas sobre prémios ou curiosidades lidas na imagem"
            },
            printer: { type: Type.STRING },
            size: { type: Type.STRING },
            releaseDate: { type: Type.STRING },
            emission: { type: Type.STRING },
            lines: { 
              type: Type.STRING,
              description: "blue, red, multicolor, green, brown, pink, purple, yellow, gray, none"
            }
          },
          required: ["gameName", "country"]
        },
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Fallback de continente inteligente
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
