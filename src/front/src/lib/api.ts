const API_URL = "http://localhost:8080"; 

export interface Usuario {
  id: string;
  email: string;
  alunoId?: string | null;
  professorId?: string | null;
}

export type TipoQuestao = "MULTIPLA_ESCOLHA" | "VOUF" | "DISSERTATIVA";
export type Dificuldade = "FACIL" | "MEDIO" | "DIFICIL";

export interface AlternativaRequest {
  alternativa: string;
  verdadeiro: boolean;
}

export interface VoufRequest {
  item: string;
  verdadeiro: boolean;
}

export interface QuestaoRequest {
  enunciado: string;
  tema: string;
  tipo: TipoQuestao;
  dificuldade: Dificuldade;
  respostaEsperada?: string | null;
  professorId: string;
  alternativas?: AlternativaRequest[] | null;
  itensVouf?: VoufRequest[] | null;
}

export interface Questao {
  id: string;
  enunciado: string;
  tema: string;
  tipo: TipoQuestao;
  dificuldade: Dificuldade;
  respostaEsperada?: string | null;
  professorId: string;
}

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Erro na API: ${res.statusText}`);
  }

  return res.json();
}

export async function login(email: string, senha: string): Promise<Usuario> {
  const res = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("E-mail ou senha incorretos");
    }
    throw new Error(`Erro no login: ${res.statusText}`);
  }

  return res.json();
}

export async function criarQuestao(request: QuestaoRequest): Promise<Questao> {
  const res = await fetch(`${API_URL}/questoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao criar questão: ${res.statusText} - ${errorText}`);
  }

  return res.json();
}