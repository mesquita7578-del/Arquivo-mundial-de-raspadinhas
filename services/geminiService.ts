
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
    // Garantir que temos um mimeType válido para o Gemini
    const validMimeType = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    
    const parts: any[] = [{ inlineData: { mimeType: validMimeType, data: frontBase64 } }];
    if (backBase64) parts.push({ inlineData: { mimeType: validMimeType, data: backBase64 } });
    
    // Prompt de sistema focado em extração técnica
    const systemInstruction = `Você é Chloe, uma assistente perita em colecionismo de raspadinhas e lotarias mundiais.
Sua tarefa é extrair dados técnicos precisos das imagens fornecidas.
- Procure pelo nome do jogo, país, operador (ex: SCML, ONCE), preço facial e número do jogo.
- Identifique a data de emissão se visível.
- Se a informação não estiver clara, deixe o campo vazio ou use sua base de conhecimento para sugerir (especialmente para Operador e Continente).
- Retorne SEMPRE em formato JSON válido de acordo com o esquema definido.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: "Extraia todos os detalhes técnicos desta raspadinha." }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: { type: Type.STRING, description: "Nome principal do jogo" },
            gameNumber: { type: Type.STRING, description: "Número de série ou número do jogo" },
            price: { type: Type.STRING, description: "Custo facial do bilhete" },
            country: { type: Type.STRING, description: "País de origem" },
            continent: { type: Type.STRING, description: "Continente de origem" },
            operator: { type: Type.STRING, description: "Entidade emissora (ex: SCML, Lottomatica)" },
            state: { type: Type.STRING, description: "MINT se nova, SC se raspada" },
            values: { type: Type.STRING, description: "Resumo dos prêmios ou observações" },
            printer: { type: Type.STRING, description: "Empresa que imprimiu (ex: Scientific Games)" },
            size: { type: Type.STRING, description: "Dimensões aproximadas" },
            releaseDate: { type: Type.STRING, description: "Ano ou data de lançamento" },
            closeDate: { type: Type.STRING, description: "Data de validade ou encerramento" },
            emission: { type: Type.STRING, description: "Quantidade total emitida" },
            winProbability: { type: Type.STRING, description: "Probabilidade de ganho" },
            lines: { type: Type.STRING, description: "Cores das linhas de segurança" }
          },
          required: ["gameName", "country"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("A Chloe não recebeu resposta do servidor.");
    
    const data = JSON.parse(text);
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
    console.error("Erro na análise da Chloe:", error);
    // Retornamos um objeto básico para não travar a UI, mas lançamos o erro para o log
    return { 
      category: "raspadinha", 
      gameName: "Não identificado", 
      gameNumber: "", 
      releaseDate: "", 
      size: "", 
      values: "A Chloe teve dificuldade em ler esta imagem. Por favor, preencha manualmente.", 
      price: "", 
      state: "SC", 
      country: "Portugal", 
      continent: "Europa" 
    };
  }
};
