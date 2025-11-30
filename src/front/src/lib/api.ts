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

export async function fetchFromBackend<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

export async function listarQuestoes(): Promise<Questao[]> {
  return fetchFromBackend("/questoes");
}

export async function deletarQuestao(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/questoes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao deletar questão: ${res.statusText} - ${errorText}`);
  }
}

export async function buscarQuestaoPorId(id: string): Promise<Questao> {
  return fetchFromBackend(`/questoes/${id}`);
}

export interface AlternativaResponse {
  alternativa: string;
  verdadeiro: boolean;
}

export interface VoufResponse {
  item: string;
  verdadeiro: boolean;
}

export interface QuestaoCompleta extends Questao {
  alternativas?: AlternativaResponse[];
  itensVouf?: VoufResponse[];
}

export async function buscarQuestaoCompleta(id: string): Promise<QuestaoCompleta> {
  const [questao, alternativas, itensVouf] = await Promise.all([
    buscarQuestaoPorId(id),
    fetchFromBackend<AlternativaResponse[]>(`/questoes/${id}/alternativas`).catch(() => [] as AlternativaResponse[]),
    fetchFromBackend<VoufResponse[]>(`/questoes/${id}/itens-vouf`).catch(() => [] as VoufResponse[]),
  ]);

  return {
    ...questao,
    alternativas: alternativas.length > 0 ? alternativas : undefined,
    itensVouf: itensVouf.length > 0 ? itensVouf : undefined,
  };
}

export async function atualizarQuestao(id: string, request: QuestaoRequest): Promise<Questao> {
  const res = await fetch(`${API_URL}/questoes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao atualizar questão: ${res.statusText} - ${errorText}`);
  }

  return res.json();
}

// Interfaces para Avaliação
export interface Avaliacao {
  id: string;
  descricao: string;
  data: string; // LocalDate format: "YYYY-MM-DD"
  horario: string; // LocalTime format: "HH:mm"
}

export interface AvaliacaoRequest {
  descricao: string;
  data: string; // "YYYY-MM-DD"
  horario: string; // "HH:mm"
  participantes?: null; // Opcional, não usado na criação inicial
}

export interface AdicionarQuestaoAvaliacaoRequest {
  questaoId: string;
  peso?: number; // Opcional, default 1.0
  ordem?: number; // Opcional
}

// Funções para Avaliação
export async function criarAvaliacao(request: AvaliacaoRequest): Promise<Avaliacao> {
  const res = await fetch(`${API_URL}/avaliacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao criar avaliação: ${res.statusText} - ${errorText}`);
  }

  return res.json();
}

export async function adicionarQuestaoAvaliacao(
  avaliacaoId: string,
  request: AdicionarQuestaoAvaliacaoRequest
): Promise<void> {
  const res = await fetch(`${API_URL}/avaliacoes/${avaliacaoId}/questoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao adicionar questão à avaliação: ${res.statusText} - ${errorText}`);
  }
}

export async function listarAvaliacoes(): Promise<Avaliacao[]> {
  return fetchFromBackend("/avaliacoes");
}

export async function deletarAvaliacao(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/avaliacoes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao deletar avaliação: ${res.statusText} - ${errorText}`);
  }
}