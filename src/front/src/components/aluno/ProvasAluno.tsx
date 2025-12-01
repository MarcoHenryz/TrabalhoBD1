import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  listarAvaliacoesPorAluno,
  listarQuestoesAvaliacao,
  buscarQuestaoCompleta,
  listarRespostasAluno,
  responderQuestao,
  listarTutoriasDoAluno,
  type Avaliacao,
  type QuestaoCompleta,
  type RespostaAluno,
  type ResponderQuestaoRequest,
  type ProvaComTutor,
} from "@/lib/apiprof";
import { Loader2, Send, ClipboardList } from "lucide-react";

type ProvasAlunoProps = {
  alunoId: string;
  selectedAvaliacaoId: string | null;
  onSelectAvaliacao: (id: string | null) => void;
};

type AvaliacaoAluno = Avaliacao & {
  questoes?: QuestaoCompleta[];
  respostas?: RespostaAluno[];
};

type RespostaEmEdicao = {
  alternativaId?: string;
  voufItemId?: string;
  voufResposta?: boolean;
  respostaTexto?: string;
};

function formatarData(dataIso: string) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarTipo(tipo: QuestaoCompleta["tipo"]) {
  switch (tipo) {
    case "MULTIPLA_ESCOLHA":
      return "Múltipla escolha";
    case "VOUF":
      return "Verdadeiro ou falso";
    case "DISSERTATIVA":
      return "Dissertativa";
    default:
      return tipo;
  }
}

function formatarDificuldade(dificuldade: QuestaoCompleta["dificuldade"]) {
  switch (dificuldade) {
    case "FACIL":
      return "Fácil";
    case "MEDIO":
      return "Médio";
    case "DIFICIL":
      return "Difícil";
    default:
      return dificuldade;
  }
}

function mapearTutores(resumo: ProvaComTutor[]) {
  const acumulado: Record<string, { nomes: Set<string>; emails: Set<string> }> = {};

  resumo.forEach((tutor) => {
    const atual = acumulado[tutor.avaliacaoId] ?? { nomes: new Set<string>(), emails: new Set<string>() };

    if (tutor.professorNome) {
      atual.nomes.add(tutor.professorNome);
    }
    if (tutor.professorEmail) {
      atual.emails.add(tutor.professorEmail);
    }

    acumulado[tutor.avaliacaoId] = atual;
  });

  const resposta: Record<string, { nomes: string; emails: string }> = {};
  Object.entries(acumulado).forEach(([avaliacaoId, info]) => {
    resposta[avaliacaoId] = {
      nomes: info.nomes.size ? Array.from(info.nomes).join(", ") : "Tutores não informados",
      emails: Array.from(info.emails).join(", "),
    };
  });

  return resposta;
}

export function ProvasAluno({ alunoId, selectedAvaliacaoId, onSelectAvaliacao }: ProvasAlunoProps) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAluno[]>([]);
  const [avaliacaoSelecionadaId, setAvaliacaoSelecionadaId] = useState<string | null>(selectedAvaliacaoId);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [carregandoAvaliacaoId, setCarregandoAvaliacaoId] = useState<string | null>(null);
  const [respondendoQuestaoId, setRespondendoQuestaoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [respostasEmEdicao, setRespostasEmEdicao] = useState<Record<string, RespostaEmEdicao>>({});
  const [tutoresPorAvaliacao, setTutoresPorAvaliacao] = useState<Record<string, { nomes: string; emails: string }>>({});

  const avaliacaoSelecionada = useMemo(
    () => avaliacoes.find((a) => a.id === avaliacaoSelecionadaId),
    [avaliacaoSelecionadaId, avaliacoes]
  );

  useEffect(() => {
    carregarAvaliacoesDoAluno();
  }, [alunoId]);

  useEffect(() => {
    listarTutoriasDoAluno(alunoId)
      .then((resposta) => setTutoresPorAvaliacao(mapearTutores(resposta)))
      .catch(() => setTutoresPorAvaliacao({}));
  }, [alunoId]);

  useEffect(() => {
    if (selectedAvaliacaoId) {
      setAvaliacaoSelecionadaId(selectedAvaliacaoId);
      carregarDetalhes(selectedAvaliacaoId);
    }
  }, [selectedAvaliacaoId]);

  const carregarAvaliacoesDoAluno = async () => {
    try {
      setCarregandoLista(true);
      setErro(null);
      const apenasDoAluno = await listarAvaliacoesPorAluno(alunoId);
      setAvaliacoes(apenasDoAluno);

      const alvo = selectedAvaliacaoId && apenasDoAluno.some((a) => a.id === selectedAvaliacaoId)
        ? selectedAvaliacaoId
        : apenasDoAluno[0]?.id ?? null;

      setAvaliacaoSelecionadaId(alvo);
      onSelectAvaliacao(alvo);

      if (alvo) {
        await carregarDetalhes(alvo, apenasDoAluno);
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar provas do aluno";
      setErro(mensagem);
    } finally {
      setCarregandoLista(false);
    }
  };

  const carregarDetalhes = async (avaliacaoId: string, listaBase?: AvaliacaoAluno[]) => {
    const lista = listaBase ?? avaliacoes;
    const alvo = lista.find((a) => a.id === avaliacaoId);
    if (alvo?.questoes) {
      return;
    }

    try {
      setCarregandoAvaliacaoId(avaliacaoId);
      const questoesDaAvaliacao = await listarQuestoesAvaliacao(avaliacaoId);
      const questoesCompletas = await Promise.all(
        questoesDaAvaliacao.map((q) => buscarQuestaoCompleta(q.id))
      );
      const respostasAluno = await listarRespostasAluno(avaliacaoId, alunoId);

      setAvaliacoes((prev) =>
        prev.map((a) =>
          a.id === avaliacaoId ? { ...a, questoes: questoesCompletas, respostas: respostasAluno } : a
        )
      );
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar detalhes da prova";
      setErro(mensagem);
    } finally {
      setCarregandoAvaliacaoId(null);
    }
  };

  const atualizarResposta = (questaoId: string, dados: Partial<RespostaEmEdicao>) => {
    setRespostasEmEdicao((prev) => ({
      ...prev,
      [questaoId]: { ...prev[questaoId], ...dados },
    }));
  };

  const handleResponder = async (questaoId: string, event?: FormEvent) => {
    event?.preventDefault();
    if (!avaliacaoSelecionadaId || !avaliacaoSelecionada) return;

    const questao = avaliacaoSelecionada.questoes?.find((q) => q.id === questaoId);
    if (!questao) {
      setErro("Questão não encontrada nesta prova.");
      return;
    }

    const jaRespondida = avaliacaoSelecionada.respostas?.some((r) => r.questaoId === questaoId);
    if (jaRespondida) {
      setErro("Você já respondeu esta questão.");
      return;
    }

    const respostaDraft = respostasEmEdicao[questaoId] || {};
    const payload: ResponderQuestaoRequest = {
      avaliacaoId: avaliacaoSelecionadaId,
      alunoId,
      questaoId,
      alternativaEscolhidaId: null,
      voufItemId: null,
      voufResposta: null,
      respostaTexto: null,
    };

    try {
      setRespondendoQuestaoId(questaoId);
      setErro(null);
      setSucesso(null);

      if (questao.tipo === "MULTIPLA_ESCOLHA") {
        if (!respostaDraft.alternativaId) {
          throw new Error("Escolha uma alternativa para enviar a resposta.");
        }
        payload.alternativaEscolhidaId = respostaDraft.alternativaId;
      } else if (questao.tipo === "VOUF") {
        if (!respostaDraft.voufItemId || respostaDraft.voufResposta === undefined) {
          throw new Error("Selecione verdadeiro ou falso para enviar a resposta.");
        }
        payload.voufItemId = respostaDraft.voufItemId;
        payload.voufResposta = respostaDraft.voufResposta;
      } else if (questao.tipo === "DISSERTATIVA") {
        const texto = respostaDraft.respostaTexto?.trim();
        if (!texto) {
          throw new Error("Digite sua resposta antes de enviar.");
        }
        payload.respostaTexto = texto;
      }

      const novaResposta = await responderQuestao(payload);

      setAvaliacoes((prev) =>
        prev.map((a) =>
          a.id === avaliacaoSelecionadaId
            ? { ...a, respostas: [...(a.respostas ?? []), novaResposta] }
            : a
        )
      );
      onSelectAvaliacao(avaliacaoSelecionadaId);
      setRespostasEmEdicao((prev) => ({ ...prev, [questaoId]: {} }));
      setSucesso("Resposta enviada com sucesso!");
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao enviar resposta";
      setErro(mensagem);
    } finally {
      setRespondendoQuestaoId(null);
    }
  };

  const respostaParaQuestao = (questaoId: string) =>
    avaliacaoSelecionada?.respostas?.find((r) => r.questaoId === questaoId);

  const totalQuestoes = avaliacaoSelecionada?.questoes?.length ?? 0;
  const totalRespondidas = avaliacaoSelecionada?.respostas?.length ?? 0;

  const infoTutoresDaAvaliacao = (avaliacao?: AvaliacaoAluno) => {
    if (!avaliacao) return { nomes: "Tutores não informados", emails: "" };
    const daApi = tutoresPorAvaliacao[avaliacao.id];
    if (daApi) return daApi;
    return { nomes: "Tutores não informados", emails: "" };
  };

  if (carregandoLista) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Buscando provas disponíveis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Provas pendentes</CardTitle>
          <CardDescription>Você ainda não tem provas vinculadas.</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
            <p className="text-center text-sm max-w-sm">
              Quando um professor vincular você a uma avaliação, ela aparecerá aqui para você responder.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-xl">Suas provas</CardTitle>
          <CardDescription>Selecione uma avaliação para responder</CardDescription>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Alterar Tema
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              Configurações
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {avaliacoes.map((avaliacao) => {
            const carregando = carregandoAvaliacaoId === avaliacao.id;
            const respondidas = avaliacao.respostas?.length ?? 0;
            const questoes = avaliacao.questoes?.length ?? 0;
            const tutoresInfo = infoTutoresDaAvaliacao(avaliacao);
            return (
              <button
                key={avaliacao.id}
                className={`w-full rounded-lg border p-4 text-left transition hover:border-primary hover:bg-primary/5 ${
                  avaliacaoSelecionadaId === avaliacao.id ? "border-primary bg-primary/5" : "border-muted-foreground/20 bg-white/80"
                }`}
                onClick={() => {
                  setErro(null);
                  setSucesso(null);
                  setAvaliacaoSelecionadaId(avaliacao.id);
                  onSelectAvaliacao(avaliacao.id);
                  carregarDetalhes(avaliacao.id);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-base">{avaliacao.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatarData(avaliacao.data)} · {avaliacao.horario}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{tutoresInfo.nomes}</p>
                    {tutoresInfo.emails && <p className="text-[11px] text-muted-foreground">{tutoresInfo.emails}</p>}
                  </div>
                  {carregando ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {questoes > 0 ? `${respondidas}/${questoes} respondidas` : "carregando..."}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {avaliacaoSelecionada?.descricao || "Selecione uma prova"}
              </CardTitle>
              <CardDescription>
                {avaliacaoSelecionada
                  ? `Prazo: ${formatarData(avaliacaoSelecionada.data)} às ${avaliacaoSelecionada.horario}`
                  : "Escolha uma prova para ver as questões."}
              </CardDescription>
            </div>
            {avaliacaoSelecionada && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                {totalRespondidas}/{totalQuestoes || "?"} respondidas
              </span>
            )}
          </div>
          {erro && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {sucesso}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!avaliacaoSelecionada && (
            <div className="panel text-sm text-muted-foreground">
              Selecione uma prova na coluna ao lado para começar a responder.
            </div>
          )}

          {avaliacaoSelecionada && carregandoAvaliacaoId === avaliacaoSelecionada.id && (
            <div className="panel flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando questões...
            </div>
          )}

          {avaliacaoSelecionada?.questoes?.map((questao, index) => {
            const respostaAnterior = respostaParaQuestao(questao.id);
            const emEdicao = respostasEmEdicao[questao.id] || {};
            const disableSubmit =
              respondendoQuestaoId === questao.id ||
              (questao.tipo === "MULTIPLA_ESCOLHA" && !emEdicao.alternativaId) ||
              (questao.tipo === "VOUF" && (!emEdicao.voufItemId || emEdicao.voufResposta === undefined)) ||
              (questao.tipo === "DISSERTATIVA" && !emEdicao.respostaTexto?.trim());

            const alternativaSelecionada = questao.alternativas?.find(
              (a) => a.id === respostaAnterior?.alternativaEscolhidaId
            );
            const itemVoufSelecionado = questao.itensVouf?.find(
              (item) => item.id === respostaAnterior?.voufItemId
            );

            return (
              <div key={questao.id} className="rounded-lg border bg-white/70 p-4 space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Questão {index + 1} · {formatarTipo(questao.tipo)}
                    </p>
                    <p className="font-semibold text-lg leading-snug">{questao.enunciado}</p>
                    <p className="text-sm text-muted-foreground">
                      Tema: {questao.tema} · Dificuldade: {formatarDificuldade(questao.dificuldade)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${
                      respostaAnterior
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {respostaAnterior ? "Respondida" : "Pendente"}
                  </span>
                </div>

                {respostaAnterior ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <p className="font-semibold">Sua resposta:</p>
                    {questao.tipo === "MULTIPLA_ESCOLHA" && (
                      <p>{alternativaSelecionada?.alternativa || "Alternativa enviada"}</p>
                    )}
                    {questao.tipo === "VOUF" && (
                      <p>
                        {itemVoufSelecionado?.item ?? "Item"} — {respostaAnterior.voufResposta ? "Verdadeiro" : "Falso"}
                      </p>
                    )}
                    {questao.tipo === "DISSERTATIVA" && <p>{respostaAnterior.respostaTexto}</p>}
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={(event) => handleResponder(questao.id, event)}>
                    {questao.tipo === "MULTIPLA_ESCOLHA" && (
                      <div className="grid gap-2">
                        {questao.alternativas && questao.alternativas.length > 0 ? (
                          questao.alternativas.map((alternativa) => (
                            <label
                              key={alternativa.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 ${
                                emEdicao.alternativaId === alternativa.id ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`alternativa-${questao.id}`}
                                value={alternativa.id}
                                checked={emEdicao.alternativaId === alternativa.id}
                                onChange={() => atualizarResposta(questao.id, { alternativaId: alternativa.id })}
                              />
                              <span className="text-sm">{alternativa.alternativa}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma alternativa cadastrada.</p>
                        )}
                      </div>
                    )}

                    {questao.tipo === "VOUF" && (
                      <div className="space-y-2">
                        {questao.itensVouf && questao.itensVouf.length > 0 ? (
                          questao.itensVouf.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                            >
                              <p className="text-sm font-medium">{item.item}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <label className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    name={`vouf-${questao.id}-${item.id}`}
                                    checked={emEdicao.voufItemId === item.id && emEdicao.voufResposta === true}
                                    onChange={() => atualizarResposta(questao.id, { voufItemId: item.id, voufResposta: true })}
                                  />
                                  Verdadeiro
                                </label>
                                <label className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    name={`vouf-${questao.id}-${item.id}`}
                                    checked={emEdicao.voufItemId === item.id && emEdicao.voufResposta === false}
                                    onChange={() => atualizarResposta(questao.id, { voufItemId: item.id, voufResposta: false })}
                                  />
                                  Falso
                                </label>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum item disponível.</p>
                        )}
                      </div>
                    )}

                    {questao.tipo === "DISSERTATIVA" && (
                      <Textarea
                        placeholder="Digite sua resposta aqui"
                        value={emEdicao.respostaTexto ?? ""}
                        onChange={(e) => atualizarResposta(questao.id, { respostaTexto: e.target.value })}
                        className="min-h-[120px]"
                      />
                    )}

                    <Button type="submit" disabled={disableSubmit}>
                      {respondendoQuestaoId === questao.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Enviar resposta
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            );
          })}

          {avaliacaoSelecionada && avaliacaoSelecionada.questoes?.length === 0 && (
            <div className="panel text-sm text-muted-foreground">
              Esta avaliação ainda não possui questões vinculadas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
