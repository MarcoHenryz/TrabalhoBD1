const API_URL =
  (typeof process !== "undefined" && process.env.API_URL) ||
  // @ts-expect-error bun/esbuild may expose import.meta.env
  (typeof import.meta !== "undefined" && (import.meta as any).env?.API_URL) ||
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  "http://localhost:8082";

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
  id: string;
  alternativa: string;
  verdadeiro: boolean;
}

export interface VoufResponse {
  id: string;
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
export interface AvaliacaoParticipacao {
  avaliacaoId: string;
  alunoId: string;
  nota?: number | null;
  aluno?: Aluno | null;
}

export interface Avaliacao {
  id: string;
  descricao: string;
  data: string; // LocalDate format: "YYYY-MM-DD"
  horario: string; // LocalTime format: "HH:mm"
  participacoes?: AvaliacaoParticipacao[];
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

export async function listarAvaliacoesPorAluno(alunoId: string): Promise<Avaliacao[]> {
  return fetchFromBackend(`/avaliacoes/aluno/${alunoId}`);
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

export async function buscarAvaliacaoPorId(id: string): Promise<Avaliacao> {
  return fetchFromBackend(`/avaliacoes/${id}`);
}

export async function atualizarAvaliacao(id: string, request: AvaliacaoRequest): Promise<Avaliacao> {
  const res = await fetch(`${API_URL}/avaliacoes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao atualizar avaliação: ${res.statusText} - ${errorText}`);
  }

  return res.json();
}

export async function listarQuestoesAvaliacao(avaliacaoId: string): Promise<Questao[]> {
  return fetchFromBackend(`/avaliacoes/${avaliacaoId}/questoes`);
}

export async function removerQuestaoAvaliacao(avaliacaoId: string, questaoId: string): Promise<void> {
  const res = await fetch(`${API_URL}/avaliacoes/${avaliacaoId}/questoes/${questaoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao remover questão da avaliação: ${res.statusText} - ${errorText}`);
  }
}

// Interfaces para Aluno
export interface Aluno {
  id: string;
  matricula: string;
  media: number;
  dataInicio: string; // LocalDate format: "YYYY-MM-DD"
  dataConclusao?: string | null; // LocalDate format: "YYYY-MM-DD"
  usuario?: {
    id: string;
    email: string;
  } | null;
}

export interface Professor {
  id: string;
  area: string;
  usuario?: {
    id: string;
    email: string;
  } | null;
}

export interface ProvaComTutor {
  avaliacaoId: string;
  descricao: string;
  data: string;
  horario: string;
  totalQuestoes: number;
  respondidas: number;
  professorId: string;
  professorEmail: string;
  professorNome: string;
  professorArea: string;
}

// Funções para Aluno
export async function listarAlunos(): Promise<Aluno[]> {
  return fetchFromBackend("/alunos");
}

// Funções para Professor
export async function listarProfessores(): Promise<Professor[]> {
  return fetchFromBackend("/professores");
}

export async function listarProfessoresPorAluno(alunoId: string): Promise<Professor[]> {
  return fetchFromBackend(`/professores/aluno/${alunoId}`);
}

export async function listarTutoriasDoAluno(alunoId: string): Promise<ProvaComTutor[]> {
  return fetchFromBackend(`/professores/aluno/${alunoId}/provas`);
}

// Funções para Relatórios de Aluno
export interface DistribuicaoDificuldade {
  dificuldade: Dificuldade;
  totalQuestoes: number;
  respondidas: number;
  percentualRespondidas: number;
  mediaNota?: number | null;
}

export async function listarDistribuicaoDificuldade(
  alunoId: string,
  params?: { meses?: number; professorId?: string }
): Promise<DistribuicaoDificuldade[]> {
  const search = new URLSearchParams();
  if (params?.meses) {
    search.set("meses", String(params.meses));
  }
  if (params?.professorId) {
    search.set("professorId", params.professorId);
  }
  const query = search.toString();
  return fetchFromBackend(`/relatorios/alunos/${alunoId}/dificuldades${query ? `?${query}` : ""}`);
}

// Funções para associar/desassociar alunos de avaliações
export async function associarAlunoAvaliacao(avaliacaoId: string, alunoId: string): Promise<void> {
  const res = await fetch(`${API_URL}/avaliacoes/${avaliacaoId}/alunos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alunoId }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao associar aluno: ${res.statusText} - ${errorText}`);
  }
}

export async function desassociarAlunoAvaliacao(avaliacaoId: string, alunoId: string): Promise<void> {
  const res = await fetch(`${API_URL}/avaliacoes/${avaliacaoId}/alunos/${alunoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao desassociar aluno: ${res.statusText} - ${errorText}`);
  }
}

// Interfaces e funções para Respostas de Alunos
export interface RespostaAluno {
  id: string;
  avaliacaoId: string;
  alunoId: string;
  questaoId: string;
  alternativaEscolhidaId?: string | null;
  voufItemId?: string | null;
  voufResposta?: boolean | null;
  respostaTexto?: string | null;
  nota?: number | null;
  corrigido?: boolean;
  respondidoEm?: string | null;
}

export interface ResponderQuestaoRequest {
  avaliacaoId: string;
  alunoId: string;
  questaoId: string;
  alternativaEscolhidaId?: string | null;
  voufItemId?: string | null;
  voufResposta?: boolean | null;
  respostaTexto?: string | null;
}

export async function listarRespostasAluno(avaliacaoId: string, alunoId: string): Promise<RespostaAluno[]> {
  return fetchFromBackend(`/respostas/avaliacao/${avaliacaoId}/aluno/${alunoId}`);
}

export async function responderQuestao(request: ResponderQuestaoRequest): Promise<RespostaAluno> {
  const res = await fetch(`${API_URL}/respostas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao enviar resposta: ${res.statusText} - ${errorText}`);
  }

  return res.json();
}

export async function buscarNotaFinalAvaliacao(avaliacaoId: string, alunoId: string): Promise<number> {
  const nota = await fetchFromBackend<number | string>(`/respostas/avaliacao/${avaliacaoId}/aluno/${alunoId}/nota-final`);
  const valor = typeof nota === "string" ? Number(nota) : nota;
  return Number.isFinite(valor) ? Number(valor) : 0;
}

// Relatórios do Professor
export interface ResumoProfessor {
  totalAvaliacoes: number;
  totalAlunosImpactados: number;
  mediaGeral: number;
  melhorNota: number;
  piorNota: number;
  respostasCorrigidas: number;
}

export interface AvaliacaoDesempenho {
  avaliacaoId: string;
  descricao: string;
  data: string;
  mediaNota: number;
  maiorNota: number;
  menorNota: number;
  respondentes: number;
}

export interface AlunoComparativo {
  alunoId: string;
  matricula: string;
  email: string;
  media: number;
  melhorNota: number;
  piorNota: number;
  avaliacoesRespondidas: number;
}

export interface QuestaoDesafio {
  questaoId: string;
  enunciado: string;
  tema: string;
  dificuldade: Dificuldade;
  mediaNota: number;
  totalRespostas: number;
  percentualAcerto?: number | null;
}

export interface RankingProfessor {
  professorId: string;
  nome: string;
  email: string;
  area: string;
  mediaAcertos: number;
  respostasCorrigidas: number;
}

export interface RelatorioProfessorPayload {
  resumo: ResumoProfessor;
  avaliacoes: AvaliacaoDesempenho[];
  alunos: AlunoComparativo[];
  questoesCriticas: QuestaoDesafio[];
  rankingProfessores: RankingProfessor[];
}

export async function buscarRelatorioProfessor(
  professorId: string,
  params?: { meses?: number }
): Promise<RelatorioProfessorPayload> {
  const search = new URLSearchParams();
  if (params?.meses) {
    search.set("meses", String(params.meses));
  }
  const query = search.toString();
  return fetchFromBackend(`/relatorios/professores/${professorId}/painel${query ? `?${query}` : ""}`);
}

// Correção de dissertativas
export type StatusCorrecao = "pendentes" | "corrigidas" | "todas";

export interface CorrecaoDissertativa {
  respostaId: string;
  avaliacaoId: string;
  avaliacaoDescricao: string;
  avaliacaoData: string;
  alunoId: string;
  alunoMatricula: string;
  alunoEmail: string;
  questaoId: string;
  tema: string;
  enunciado: string;
  respostaTexto: string;
  nota?: number | null;
  corrigido: boolean;
}

export async function listarCorrecoes(
  professorId: string,
  status: StatusCorrecao = "pendentes"
): Promise<CorrecaoDissertativa[]> {
  return fetchFromBackend(`/professores/${professorId}/correcoes?status=${status}`);
}

export async function corrigirRespostaProfessor(
  professorId: string,
  respostaId: string,
  nota: number
): Promise<void> {
  const res = await fetch(`${API_URL}/professores/${professorId}/correcoes/${respostaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nota }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao salvar nota: ${res.statusText} - ${errorText}`);
  }
}
