import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  listarAvaliacoesPorAluno,
  listarDistribuicaoDificuldade,
  listarQuestoesAvaliacao,
  listarRespostasAluno,
  listarTutoriasDoAluno,
  buscarNotaFinalAvaliacao,
  type Avaliacao,
  type Questao,
  type RespostaAluno,
  type ProvaComTutor,
  type DistribuicaoDificuldade,
} from "@/lib/apiprof";
import { Loader2, TrendingUp, Trophy, CalendarClock, Target, AlertCircle } from "lucide-react";

type RelatoriosAlunoProps = {
  alunoId: string;
};

type AvaliacaoComDados = Avaliacao & {
  respostas: RespostaAluno[];
  questoes: Questao[];
  notaFinal?: number;
  tutores: ProvaComTutor[];
};

type FiltroPeriodo = "tudo" | "6m" | "12m";

type SeriePonto = {
  label: string;
  valor: number;
};

const formatarData = (dataIso: string) => {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
};

const labelMes = (dataIso: string) => {
  const [ano, mes] = dataIso.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const idx = Number(mes) - 1;
  return `${nomes[idx] ?? mes}/${ano.slice(2)}`;
};

const serieParaLinha = (serie: SeriePonto[]) => {
  if (serie.length === 0) return { pontos: "", fillPath: "", circles: [] as { cx: number; cy: number; valor: number; label: string }[] };

  const maxValor = Math.max(...serie.map((p) => p.valor), 10);
  const largura = 100;
  const altura = 40;
  const passoX = serie.length === 1 ? 0 : largura / (serie.length - 1);

  const pontos: string[] = [];
  const circles: { cx: number; cy: number; valor: number; label: string }[] = [];

  serie.forEach((p, idx) => {
    const x = idx * passoX;
    const y = altura - (p.valor / maxValor) * altura;
    pontos.push(`${x},${y}`);
    circles.push({ cx: x, cy: y, valor: p.valor, label: p.label });
  });

  const fillPath = `0,${altura} ${pontos.join(" ")} ${largura},${altura}`;

  return { pontos: pontos.join(" "), fillPath, circles };
};

const corPorDificuldade: Record<string, string> = {
  FACIL: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MEDIO: "bg-amber-100 text-amber-800 border-amber-200",
  DIFICIL: "bg-red-100 text-red-800 border-red-200",
};

export function RelatoriosAluno({ alunoId }: RelatoriosAlunoProps) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComDados[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<FiltroPeriodo>("tudo");
  const [professorId, setProfessorId] = useState<string>("todos");
  const [distribuicaoDificuldade, setDistribuicaoDificuldade] = useState<DistribuicaoDificuldade[]>([]);
  const [carregandoDificuldades, setCarregandoDificuldades] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  useEffect(() => {
    carregarDistribuicaoDificuldade();
  }, [alunoId, periodo, professorId]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [avaliacoesAluno, tutores] = await Promise.all([
        listarAvaliacoesPorAluno(alunoId),
        listarTutoriasDoAluno(alunoId).catch(() => [] as ProvaComTutor[]),
      ]);

      const agrupadoTutores = tutores.reduce<Record<string, ProvaComTutor[]>>((acc, atual) => {
        acc[atual.avaliacaoId] = acc[atual.avaliacaoId] ? [...acc[atual.avaliacaoId], atual] : [atual];
        return acc;
      }, {});

      const enriquecidas = await Promise.all(
        avaliacoesAluno.map(async (avaliacao) => {
          const [respostas, notaFinal, questoes] = await Promise.all([
            listarRespostasAluno(avaliacao.id, alunoId).catch(() => [] as RespostaAluno[]),
            buscarNotaFinalAvaliacao(avaliacao.id, alunoId).catch(() => undefined),
            listarQuestoesAvaliacao(avaliacao.id).catch(() => [] as Questao[]),
          ]);

          return {
            ...avaliacao,
            respostas,
            notaFinal,
            questoes,
            tutores: agrupadoTutores[avaliacao.id] ?? [],
          };
        })
      );

      setAvaliacoes(enriquecidas);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar relatórios do aluno";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const carregarDistribuicaoDificuldade = async () => {
    try {
      setCarregandoDificuldades(true);
      const meses = periodo === "6m" ? 6 : periodo === "12m" ? 12 : undefined;
      const prof = professorId === "todos" ? undefined : professorId;
      const resposta = await listarDistribuicaoDificuldade(alunoId, { meses, professorId: prof });
      setDistribuicaoDificuldade(resposta);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao carregar distribuição por dificuldade";
      setErro(mensagem);
    } finally {
      setCarregandoDificuldades(false);
    }
  };

  const professores = useMemo(() => {
    const mapa = new Map<string, { nome: string; email: string; area: string }>();
    avaliacoes.forEach((avaliacao) => {
      avaliacao.tutores.forEach((tutor) => {
        if (!mapa.has(tutor.professorId)) {
          mapa.set(tutor.professorId, {
            nome: tutor.professorNome || "Professor sem nome",
            email: tutor.professorEmail,
            area: tutor.professorArea,
          });
        }
      });
    });
    return Array.from(mapa.entries()).map(([id, dados]) => ({ id, ...dados }));
  }, [avaliacoes]);

  const avaliacoesFiltradas = useMemo(() => {
    const agora = new Date();

    return avaliacoes.filter((avaliacao) => {
      const data = new Date(avaliacao.data);
      const diffMeses = (agora.getFullYear() - data.getFullYear()) * 12 + (agora.getMonth() - data.getMonth());
      const respeitaPeriodo =
        periodo === "tudo" || (periodo === "6m" && diffMeses <= 6) || (periodo === "12m" && diffMeses <= 12);
      const respeitaProfessor = professorId === "todos" || avaliacao.tutores.some((t) => t.professorId === professorId);
      return respeitaPeriodo && respeitaProfessor;
    });
  }, [avaliacoes, periodo, professorId]);

  const estatisticas = useMemo(() => {
    const notasValidas = avaliacoesFiltradas.filter((a) => typeof a.notaFinal === "number");
    const media =
      notasValidas.reduce((acc, avaliacao) => acc + (avaliacao.notaFinal ?? 0), 0) / (notasValidas.length || 1);
    const melhor = notasValidas.reduce(
      (max, avaliacao) => (avaliacao.notaFinal !== undefined ? Math.max(max, avaliacao.notaFinal) : max),
      0
    );
    const concluidas = avaliacoesFiltradas.filter(
      (a) => a.questoes.length > 0 && (a.respostas?.length ?? 0) >= a.questoes.length
    ).length;
    const progressoMedio =
      avaliacoesFiltradas.reduce((acc, avaliacao) => {
        const total = avaliacao.questoes.length || 1;
        return acc + ((avaliacao.respostas?.length ?? 0) / total) * 100;
      }, 0) / (avaliacoesFiltradas.length || 1);

    return {
      media,
      melhor,
      concluidas,
      progressoMedio,
    };
  }, [avaliacoesFiltradas]);

  const serieNotas = useMemo<SeriePonto[]>(() => {
    const ordenadas = [...avaliacoesFiltradas]
      .filter((a) => typeof a.notaFinal === "number")
      .sort((a, b) => a.data.localeCompare(b.data));
    return ordenadas.map((avaliacao) => ({
      label: labelMes(avaliacao.data),
      valor: avaliacao.notaFinal ?? 0,
    }));
  }, [avaliacoesFiltradas]);

  const serieNotasPorMes = useMemo<SeriePonto[]>(() => {
    const agrupado = new Map<string, { soma: number; quantidade: number; label: string }>();

    avaliacoesFiltradas.forEach((avaliacao) => {
      if (avaliacao.notaFinal === undefined) return;
      const chave = avaliacao.data.slice(0, 7); // YYYY-MM
      const atual = agrupado.get(chave) ?? { soma: 0, quantidade: 0, label: labelMes(avaliacao.data) };
      agrupado.set(chave, {
        soma: atual.soma + (avaliacao.notaFinal ?? 0),
        quantidade: atual.quantidade + 1,
        label: atual.label,
      });
    });

    return Array.from(agrupado.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, dados]) => ({ label: dados.label, valor: Number((dados.soma / dados.quantidade).toFixed(1)) }));
  }, [avaliacoesFiltradas]);

  const progressoPorProfessor = useMemo(() => {
    const agrupado = new Map<
      string,
      { nome: string; area: string; avaliacoes: number; media: number; soma: number; concluidas: number }
    >();

    avaliacoesFiltradas.forEach((avaliacao) => {
      const nota = avaliacao.notaFinal ?? 0;
      const concluida = avaliacao.questoes.length > 0 && (avaliacao.respostas?.length ?? 0) >= avaliacao.questoes.length;

      avaliacao.tutores.forEach((tutor) => {
        const atual = agrupado.get(tutor.professorId) ?? {
          nome: tutor.professorNome || "Professor",
          area: tutor.professorArea || "Área não informada",
          avaliacoes: 0,
          media: 0,
          soma: 0,
          concluidas: 0,
        };

        agrupado.set(tutor.professorId, {
          ...atual,
          avaliacoes: atual.avaliacoes + 1,
          soma: atual.soma + nota,
          concluidas: atual.concluidas + (concluida ? 1 : 0),
          media: 0, // recalculado depois
        });
      });
    });

    return Array.from(agrupado.entries()).map(([id, dados]) => ({
      id,
      nome: dados.nome,
      area: dados.area,
      avaliacoes: dados.avaliacoes,
      concluidas: dados.concluidas,
      media: dados.avaliacoes > 0 ? Number((dados.soma / dados.avaliacoes).toFixed(1)) : 0,
    }));
  }, [avaliacoesFiltradas]);

  const distribuicaoTemas = useMemo(() => {
    const mapa = new Map<string, { questoes: number; respondidas: number; notas: number; respondidasComNota: number }>();

    avaliacoesFiltradas.forEach((avaliacao) => {
      avaliacao.questoes.forEach((questao) => {
        const resposta = avaliacao.respostas?.find((r) => r.questaoId === questao.id);
        const atual = mapa.get(questao.tema) ?? { questoes: 0, respondidas: 0, notas: 0, respondidasComNota: 0 };
        mapa.set(questao.tema, {
          questoes: atual.questoes + 1,
          respondidas: atual.respondidas + (resposta ? 1 : 0),
          notas:
            atual.notas +
            (resposta?.nota !== undefined && resposta?.nota !== null ? Number(resposta.nota) * 10 : 0),
          respondidasComNota:
            atual.respondidasComNota + (resposta?.nota !== undefined && resposta?.nota !== null ? 1 : 0),
        });
      });
    });

    return Array.from(mapa.entries())
      .map(([tema, dados]) => ({
        tema,
        questoes: dados.questoes,
        respondidas: dados.respondidas,
        media: dados.respondidasComNota ? Number((dados.notas / dados.respondidasComNota).toFixed(1)) : null,
      }))
      .sort((a, b) => b.questoes - a.questoes)
      .slice(0, 6);
  }, [avaliacoesFiltradas]);

  const rankingAvaliacoes = useMemo(() => {
    return [...avaliacoesFiltradas]
      .filter((a) => typeof a.notaFinal === "number")
      .sort((a, b) => (b.notaFinal ?? 0) - (a.notaFinal ?? 0))
      .slice(0, 6);
  }, [avaliacoesFiltradas]);

  if (carregando) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Montando seus relatórios personalizados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Relatórios</CardTitle>
          <CardDescription>Você ainda não possui dados suficientes para relatórios.</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p className="text-center text-sm max-w-sm">
              Responda algumas avaliações e volte aqui para ver gráficos de evolução, comparativos por professor e temas mais fortes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Relatórios de desempenho</CardTitle>
            <CardDescription>Comparativos de notas, temas e professores em tempo real</CardDescription>
            {erro && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Período</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as FiltroPeriodo)}
              >
                <option value="tudo">Todo o histórico</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="12m">Últimos 12 meses</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Professor</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
              >
                <option value="todos">Todos</option>
                {professores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Média geral</p>
              <p className="text-2xl font-semibold">{estatisticas.media.toFixed(1)}</p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Progresso médio</p>
              <p className="text-2xl font-semibold">{estatisticas.progressoMedio.toFixed(0)}%</p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Melhor nota</p>
              <p className="text-2xl font-semibold">{estatisticas.melhor.toFixed(1)}</p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Provas concluídas</p>
              <p className="text-2xl font-semibold">{estatisticas.concluidas}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Evolução de notas</CardTitle>
              <CardDescription>Tendência por data da avaliação</CardDescription>
            </div>
            <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
              {serieNotas.length} pontos
            </span>
          </CardHeader>
          <CardContent>
            {serieNotas.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">
                Ainda não há notas lançadas no período filtrado.
              </div>
            ) : (
              <div className="panel bg-gradient-to-br from-card to-primary/5">
                {(() => {
                  const { pontos, fillPath, circles } = serieParaLinha(serieNotas);
                  const maxValor = Math.max(...serieNotas.map((p) => p.valor), 10);
                  return (
                    <div className="space-y-3">
                      <svg viewBox="0 0 100 40" className="h-48 w-full">
                        <polygon points={fillPath} className="fill-primary/10" />
                        <polyline points={pontos} className="fill-none stroke-primary" strokeWidth="1.8" strokeLinecap="round" />
                        {circles.map((c, idx) => (
                          <circle key={idx} cx={c.cx} cy={c.cy} r={1.5} className="fill-primary" />
                        ))}
                      </svg>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>MÁX {maxValor.toFixed(1)}</span>
                      </div>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] gap-2 text-xs text-muted-foreground">
                        {serieNotas.map((ponto, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-foreground">{ponto.valor.toFixed(1)}</span>
                            <span>{ponto.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Média por mês</CardTitle>
              <CardDescription>Variação de desempenho no tempo</CardDescription>
            </div>
            <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-3 py-1 font-semibold border border-blue-200">
              {serieNotasPorMes.length} meses
            </span>
          </CardHeader>
          <CardContent>
            {serieNotasPorMes.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">Sem médias registradas para o período.</div>
            ) : (
              <div className="panel space-y-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-3">
                  {serieNotasPorMes.map((mes) => (
                    <div key={mes.label} className="flex flex-col items-center gap-2">
                      <div className="flex h-28 w-full items-end justify-center rounded-md bg-primary/5 px-2">
                        <div
                          className="w-8 rounded-md bg-primary shadow-sm transition-all"
                          style={{ height: `${Math.max((mes.valor / 10) * 100, 8)}%` }}
                          title={`${mes.valor.toFixed(1)} pontos`}
                        />
                      </div>
                      <p className="text-xs font-medium text-foreground">{mes.valor.toFixed(1)}</p>
                      <p className="text-[11px] text-muted-foreground">{mes.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Comparativo por professor</CardTitle>
              <CardDescription>Média e volume de provas por tutor</CardDescription>
            </div>
            <span className="text-xs rounded-full border bg-card px-3 py-1 text-muted-foreground">
              {progressoPorProfessor.length} professores
            </span>
          </CardHeader>
          <CardContent>
            {progressoPorProfessor.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">Não há provas vinculadas a professores no filtro atual.</div>
            ) : (
              <div className="space-y-3">
                {progressoPorProfessor.map((prof) => (
                  <div key={prof.id} className="rounded-lg border bg-card/80 p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{prof.nome}</p>
                        <p className="text-xs text-muted-foreground">{prof.area}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                        {prof.media.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min((prof.media / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{prof.avaliacoes} provas</span>
                      <span className="text-xs text-muted-foreground">{prof.concluidas} concluídas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Distribuição por dificuldade</CardTitle>
              <CardDescription>Questões respondidas por nível</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {carregandoDificuldades ? (
              <div className="panel text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Atualizando distribuição...</span>
              </div>
            ) : distribuicaoDificuldade.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">Não há questões suficientes para esta análise.</div>
            ) : (
              distribuicaoDificuldade.map((item) => (
                <div key={item.dificuldade} className="rounded-lg border bg-card/80 p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${corPorDificuldade[item.dificuldade] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
                    >
                      {item.dificuldade}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.respondidas}/{item.totalQuestoes} respondidas
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                      style={{ width: `${Math.min(item.percentualRespondidas, 100)}%` }}
                    />
                  </div>
                  {item.mediaNota !== undefined && item.mediaNota !== null && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Nota média em questões corrigidas: {item.mediaNota.toFixed(1)} / 10
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Temas mais recorrentes</CardTitle>
              <CardDescription>Volume de questões e média de acerto</CardDescription>
            </div>
            <span className="text-xs rounded-full border bg-card px-3 py-1 text-muted-foreground">
              Top {distribuicaoTemas.length}
            </span>
          </CardHeader>
          <CardContent>
            {distribuicaoTemas.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">Ainda não há temas suficientes para comparar.</div>
            ) : (
              <div className="space-y-3">
                {distribuicaoTemas.map((tema) => (
                  <div key={tema.tema} className="rounded-lg border bg-card/80 p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{tema.tema}</p>
                      <span className="text-xs text-muted-foreground">{tema.questoes} questões</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-2 flex-1 rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min((tema.respondidas / tema.questoes) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="ml-3 text-xs font-semibold text-primary">
                        {tema.media !== null ? `${tema.media.toFixed(1)} pts` : "—"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {tema.respondidas} respostas registradas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Ranking de provas</CardTitle>
              <CardDescription>Melhores notas recentes</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {rankingAvaliacoes.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">Ainda não há notas publicadas.</div>
            ) : (
              <div className="rounded-lg border bg-card/90 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prova</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankingAvaliacoes.map((avaliacao, idx) => (
                      <TableRow key={avaliacao.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium leading-tight">{avaliacao.descricao}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {avaliacao.tutores[0]?.professorNome || "Professor não informado"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatarData(avaliacao.data)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {avaliacao.notaFinal?.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
