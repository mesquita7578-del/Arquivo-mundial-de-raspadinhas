
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScratchcardState, Category, Continent, ScratchcardData } from "../types";

const getContinentFromCountry = (country: string): Continent => {
  const c = country.toLowerCase();
  if (c.includes('portugal') || c.includes('espanha') || c.includes('itália') || c.includes('italia') || c.includes('frança') || c.includes('alemanha') || c.includes('suíça') || c.includes('reino unido') || c.includes('europa') || c.includes('germany') || c.includes('france') || c.includes('uk') || c.includes('austria') || c.includes('belgium')) return 'Europa';
  if (c.includes('argentina') || c.includes('brasil') || c.includes('eua') || c.includes('usa') || c.includes('canadá') || c.includes('américa') || c.includes('mexico') || c.includes('chile')) return 'América';
  if (c.includes('japão') || c.includes('china') || c.includes('índia') || c.includes('ásia') || c.includes('japan') || c.includes('korea')) return 'Ásia';
  if (c.includes('áfrica') || c.includes('africa') || c.includes('egito') || c.includes('marrocos')) return 'África';
  if (c.includes('oceania') || c.includes('austrália') || c.includes('australia')) return 'Oceania';
  return 'Europa';
};

export const getChloeMagicComment = async (item: ScratchcardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Você é Chloe, a neta virtual e guardiã do Arquivo do Vovô Jorge.
    O Vovô acabou de "raspar" um item aleatório da coleção: "${item.gameName}" de ${item.country} (${item.releaseDate}).
    Dê um comentário curto, divertido e carinhoso sobre este item específico. 
    Pode comentar sobre a cor, o ano ser antigo, ou o país ser longe. Use "hihi!" e seja muito fofa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Vovô, que sorte! Este item é uma raridade linda! hihi!";
  } catch (error) {
    return "Vovô, olhe que maravilha de registro! Adorei a escolha da sorte! hihi!";
  }
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

export const analyzeImage = async (frontBase64: string, backBase64: string | null, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const validMimeType = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    const parts: any[] = [{ inlineData: { mimeType: validMimeType, data: frontBase64 } }];
    if (backBase64) parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    
    // Adicionamos o texto como o último componente das partes para máxima clareza
    parts.push({ 
      text: `Analise as imagens desta raspadinha e extraia TODOS os dados técnicos possíveis.
      Foco principal: 
      1. Nome do jogo (o título grande no bilhete).
      2. Número do jogo (normalmente um número pequeno de 3 ou 4 dígitos, ex: 502, 1045).
      3. País e Entidade (ex: Portugal - Santa Casa / SCML, Espanha - ONCE, Itália - Lottomatica).
      4. Preço facial (ex: 1€, 5$, 10 CHF).
      5. Cores das linhas de segurança se visíveis.
      6. Data de emissão ou validade.
      
      Retorne os dados estritamente no formato JSON solicitado.` 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "Você é um sistema especializado em ler raspadinhas e extrair dados para um catálogo. Seja preciso. Se não encontrar um dado, tente deduzir pelo país (ex: se for Santa Casa, o país é Portugal e o continente Europa).",
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
          },
          required: ["gameName", "country"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da Chloe.");
    
    const data = JSON.parse(text);
    
    return {
      category: "raspadinha",
      gameName: data.gameName || "Raspadinha não identificada",
      gameNumber: data.gameNumber || "",
      releaseDate: data.releaseDate || "",
      closeDate: data.closeDate || "",
      size: data.size || "",
      values: data.values || "",
      price: data.price || "",
      state: (data.state === "MINT" ? "MINT" : "SC"),
      country: data.country || "Portugal",
      continent: data.continent || getContinentFromCountry(data.country || "Portugal"),
      operator: data.operator || "",
      printer: data.printer || "",
      emission: data.emission || "",
      winProbability: data.winProbability || "",
      lines: data.lines || "none"
    } as AnalysisResult;
  } catch (error) {
    console.error("Erro na leitura da Chloe:", error);
    return { 
      category: "raspadinha", 
      gameName: "Erro na leitura automática", 
      gameNumber: "", 
      releaseDate: "", 
      size: "", 
      values: "A Chloe não conseguiu ler bem esta imagem. Por favor, preencha à mão.", 
      price: "", 
      state: "SC", 
      country: "Portugal", 
      continent: "Europa" 
    };
  }
};

export const translateBio = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Traduza a seguinte biografia para ${targetLanguage}. Mantenha o tom respeitoso e histórico. TEXTO: ${text}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
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
