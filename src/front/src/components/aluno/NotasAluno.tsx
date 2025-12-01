import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buscarNotaFinalAvaliacao,
  buscarQuestaoCompleta,
  listarAvaliacoesPorAluno,
  listarQuestoesAvaliacao,
  listarRespostasAluno,
  listarTutoriasDoAluno,
  type Avaliacao,
  type ProvaComTutor,
  type QuestaoCompleta,
  type RespostaAluno,
} from "@/lib/apiprof";
import { AlertCircle, CheckCircle2, Clock3, FileQuestion, GraduationCap, Loader2 } from "lucide-react";

type NotasAlunoProps = {
  alunoId: string;
  selectedAvaliacaoId: string | null;
  onSelectAvaliacao: (id: string | null) => void;
};

type AvaliacaoComNotas = Avaliacao & {
  notaFinal?: number;
  respostas?: RespostaAluno[];
  questoes?: QuestaoCompleta[];
};

type TutorInfo = {
  nomes: string;
  emails: string;
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

  const resposta: Record<string, TutorInfo> = {};
  Object.entries(acumulado).forEach(([avaliacaoId, info]) => {
    resposta[avaliacaoId] = {
      nomes: info.nomes.size ? Array.from(info.nomes).join(", ") : "Tutores não informados",
      emails: Array.from(info.emails).join(", "),
    };
  });

  return resposta;
}

export function NotasAluno({ alunoId, selectedAvaliacaoId, onSelectAvaliacao }: NotasAlunoProps) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComNotas[]>([]);
  const [avaliacaoSelecionadaId, setAvaliacaoSelecionadaId] = useState<string | null>(selectedAvaliacaoId);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [carregandoDetalheId, setCarregandoDetalheId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tutoresPorAvaliacao, setTutoresPorAvaliacao] = useState<Record<string, TutorInfo>>({});

  const avaliacaoSelecionada = useMemo(
    () => avaliacoes.find((a) => a.id === avaliacaoSelecionadaId) ?? null,
    [avaliacaoSelecionadaId, avaliacoes]
  );

  const aguardandoCorrecao = useMemo(() => {
    return avaliacoes.reduce((total, avaliacao) => {
      const respostas = avaliacao.respostas ?? [];
      const pendentes = respostas.filter((r) => !r.corrigido).length;
      return total + pendentes;
    }, 0);
  }, [avaliacoes]);

  useEffect(() => {
    carregarNotas();
  }, [alunoId]);

  useEffect(() => {
    if (selectedAvaliacaoId) {
      setAvaliacaoSelecionadaId(selectedAvaliacaoId);
      if (avaliacoes.some((a) => a.id === selectedAvaliacaoId)) {
        carregarDetalhes(selectedAvaliacaoId);
      }
    }
  }, [selectedAvaliacaoId]);

  useEffect(() => {
    listarTutoriasDoAluno(alunoId)
      .then((resposta) => setTutoresPorAvaliacao(mapearTutores(resposta)))
      .catch(() => setTutoresPorAvaliacao({}));
  }, [alunoId]);

  const carregarNotas = async () => {
    try {
      setCarregandoLista(true);
      setErro(null);

      const avaliacoesAluno = await listarAvaliacoesPorAluno(alunoId);
      const comNotas = await Promise.all(
        avaliacoesAluno.map(async (avaliacao) => {
          const [respostas, notaFinal] = await Promise.all([
            listarRespostasAluno(avaliacao.id, alunoId).catch(() => [] as RespostaAluno[]),
            buscarNotaFinalAvaliacao(avaliacao.id, alunoId).catch(() => 0),
          ]);
          return { ...avaliacao, respostas, notaFinal };
        })
      );

      setAvaliacoes(comNotas);

      const alvo = selectedAvaliacaoId && comNotas.some((a) => a.id === selectedAvaliacaoId)
        ? selectedAvaliacaoId
        : comNotas[0]?.id ?? null;

      setAvaliacaoSelecionadaId(alvo);
      onSelectAvaliacao(alvo);

      if (alvo) {
        carregarDetalhes(alvo, comNotas);
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar notas";
      setErro(mensagem);
    } finally {
      setCarregandoLista(false);
    }
  };

  const carregarDetalhes = async (avaliacaoId: string, listaBase?: AvaliacaoComNotas[]) => {
    const lista = listaBase ?? avaliacoes;
    const alvo = lista.find((a) => a.id === avaliacaoId);
    if (!alvo) return;

    try {
      setCarregandoDetalheId(avaliacaoId);
      setErro(null);

      const precisaQuestoes = !alvo.questoes || alvo.questoes.length === 0;

      const [questoesDetalhadas, respostas, notaFinal] = await Promise.all([
        precisaQuestoes
          ? listarQuestoesAvaliacao(avaliacaoId)
              .then((questoes) => Promise.all(questoes.map((q) => buscarQuestaoCompleta(q.id))))
              .catch(() => [] as QuestaoCompleta[])
          : Promise.resolve(alvo.questoes),
        listarRespostasAluno(avaliacaoId, alunoId).catch(() => alvo.respostas ?? []),
        buscarNotaFinalAvaliacao(avaliacaoId, alunoId).catch(() => alvo.notaFinal ?? 0),
      ]);

      setAvaliacoes((prev) =>
        prev.map((avaliacao) =>
          avaliacao.id === avaliacaoId
            ? {
                ...avaliacao,
                questoes: questoesDetalhadas,
                respostas,
                notaFinal: notaFinal,
              }
            : avaliacao
        )
      );
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar detalhes da avaliação";
      setErro(mensagem);
    } finally {
      setCarregandoDetalheId(null);
    }
  };

  const infoTutoresDaAvaliacao = (avaliacao?: AvaliacaoComNotas | null) => {
    if (!avaliacao) return { nomes: "Tutores não informados", emails: "" };
    return tutoresPorAvaliacao[avaliacao.id] ?? { nomes: "Tutores não informados", emails: "" };
  };

  const responderStatus = (avaliacao: AvaliacaoComNotas) => {
    const totalRespostas = avaliacao.respostas?.length ?? 0;
    const corrigidas = avaliacao.respostas?.filter((r) => r.corrigido).length ?? 0;

    if (totalRespostas === 0) {
      return { label: "Sem respostas", classe: "border-slate-200 bg-slate-50 text-slate-700" };
    }
    if (corrigidas === totalRespostas) {
      return { label: "Corrigida", classe: "border-emerald-200 bg-emerald-50 text-emerald-700" };
    }
    return { label: "Em correção", classe: "border-amber-200 bg-amber-50 text-amber-700" };
  };

  const totalQuestoes = avaliacaoSelecionada?.questoes?.length ?? 0;
  const totalRespondidas = avaliacaoSelecionada?.respostas?.length ?? 0;
  const totalCorrigidas = avaliacaoSelecionada?.respostas?.filter((r) => r.corrigido).length ?? 0;

  if (carregandoLista) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Preparando suas notas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Notas</CardTitle>
          <CardDescription>Aqui aparecerão as notas das suas avaliações.</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <FileQuestion className="h-10 w-10" />
            <p className="text-center text-sm max-w-sm">
              Assim que você responder avaliações e elas forem corrigidas, o histórico completo de notas aparecerá aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Notas e desempenho</CardTitle>
              <CardDescription>Acompanhe suas correções, médias e histórico de provas</CardDescription>
            </div>
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          {erro && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Provas corrigidas</p>
              <p className="text-2xl font-semibold">
                {avaliacoes.filter((a) => (a.respostas?.length ?? 0) > 0 && (a.respostas?.every((r) => r.corrigido) ?? false)).length}
              </p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Aguardando correção</p>
              <p className="text-2xl font-semibold">{aguardandoCorrecao}</p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avaliações respondidas</p>
              <p className="text-2xl font-semibold">
                {avaliacoes.filter((a) => (a.respostas?.length ?? 0) > 0).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Histórico de avaliações</CardTitle>
            <CardDescription>Selecione para ver detalhes da nota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {avaliacoes.map((avaliacao) => {
              const status = responderStatus(avaliacao);
              const tutores = infoTutoresDaAvaliacao(avaliacao);
              return (
                <button
                  key={avaliacao.id}
                  className={`w-full rounded-lg border p-4 text-left transition hover:border-primary hover:bg-primary/5 ${
                    avaliacaoSelecionadaId === avaliacao.id ? "border-primary bg-primary/5" : "border-border bg-card/90"
                  }`}
                  onClick={() => {
                    setErro(null);
                    setAvaliacaoSelecionadaId(avaliacao.id);
                    onSelectAvaliacao(avaliacao.id);
                    carregarDetalhes(avaliacao.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-semibold text-base leading-snug">{avaliacao.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatarData(avaliacao.data)} · {avaliacao.horario}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{tutores.nomes}</p>
                      {tutores.emails && <p className="text-[11px] text-muted-foreground">{tutores.emails}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold whitespace-nowrap leading-none ${status.classe}`}>
                        {status.label}
                      </span>
                      <span className="rounded-md bg-slate-900 text-white px-3 py-1 text-sm font-semibold shadow text-center">
                        {avaliacao.notaFinal !== undefined ? `${avaliacao.notaFinal.toFixed(1)}` : "--"}
                      </span>
                    </div>
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
                  {avaliacaoSelecionada?.descricao || "Selecione uma avaliação"}
                </CardTitle>
                <CardDescription>
                  {avaliacaoSelecionada
                    ? `Aplicada em ${formatarData(avaliacaoSelecionada.data)} às ${avaliacaoSelecionada.horario}`
                    : "Escolha uma avaliação para ver suas notas detalhadas."}
                </CardDescription>
                {avaliacaoSelecionada && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {infoTutoresDaAvaliacao(avaliacaoSelecionada).nomes}
                  </p>
                )}
              </div>
              {avaliacaoSelecionada && (
                <div className="rounded-lg border bg-primary/5 px-4 py-3 text-center min-w-[140px]">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Nota final</p>
                  <p className="text-3xl font-bold text-primary">
                    {avaliacaoSelecionada.notaFinal !== undefined ? avaliacaoSelecionada.notaFinal.toFixed(1) : "--"}
                  </p>
                </div>
              )}
            </div>
            {carregandoDetalheId === avaliacaoSelecionada?.id && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando detalhes da avaliação...
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!avaliacaoSelecionada && (
              <div className="panel text-sm text-muted-foreground">
                Selecione uma avaliação ao lado para ver notas e correções.
              </div>
            )}

            {avaliacaoSelecionada && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="panel">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Respondidas</p>
                    <p className="text-xl font-semibold">{totalRespondidas}</p>
                  </div>
                  <div className="panel">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Corrigidas</p>
                    <p className="text-xl font-semibold">{totalCorrigidas}</p>
                  </div>
                  <div className="panel">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
                    <p className="text-xl font-semibold">
                      {totalQuestoes > 0 ? Math.max(totalQuestoes - totalRespondidas, 0) : "—"}
                    </p>
                  </div>
                </div>

                {avaliacaoSelecionada.questoes && avaliacaoSelecionada.questoes.length === 0 && (
                  <div className="panel text-sm text-muted-foreground">
                    Esta avaliação ainda não possui questões registradas.
                  </div>
                )}

                {avaliacaoSelecionada.questoes && avaliacaoSelecionada.questoes.length > 0 && (
                  <div className="rounded-lg border bg-card/90 shadow-sm">
                    <div className="flex items-center gap-2 border-b px-4 py-3 text-sm text-muted-foreground">
                      <FileQuestion className="h-4 w-4" />
                      Questões e correções
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Questão</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Nota</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {avaliacaoSelecionada.questoes.map((questao, index) => {
                          const resposta = avaliacaoSelecionada.respostas?.find((r) => r.questaoId === questao.id);
                          const notaQuestao =
                            resposta?.nota !== undefined && resposta?.nota !== null
                              ? (Number(resposta.nota) * 10).toFixed(1)
                              : "--";
                          const status =
                            resposta && resposta.corrigido
                              ? { label: "Corrigida", classe: "text-emerald-700 bg-emerald-50 border border-emerald-200" }
                              : resposta
                                ? { label: "Aguardando correção", classe: "text-amber-700 bg-amber-50 border border-amber-200" }
                                : { label: "Não respondida", classe: "text-slate-700 bg-slate-100 border border-slate-200" };

                          return (
                            <TableRow key={questao.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium leading-snug">
                                    {index + 1}. {questao.enunciado}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Tema: {questao.tema}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{formatarTipo(questao.tipo)}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap leading-none ${status.classe}`}>
                                  {status.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {resposta && resposta.corrigido ? notaQuestao : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {!avaliacaoSelecionada.questoes && (
                  <div className="panel flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Detalhes não carregados. Selecione a avaliação novamente para buscar as questões.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
