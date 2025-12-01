import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buscarRelatorioProfessor,
  type RelatorioProfessorPayload,
  type AvaliacaoDesempenho,
  type AlunoComparativo,
  type QuestaoDesafio,
  type RankingProfessor,
} from "@/lib/apiprof";
import {
  Loader2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  AlertCircle,
  Star,
  Flame,
  Award,
} from "lucide-react";

type RelatoriosProfessorProps = {
  professorId: string;
};

type FiltroPeriodo = "tudo" | "6m" | "12m";

type SeriePonto = { label: string; valor: number };

const formatarDataCurta = (dataIso: string) => {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
};

const mesCurto = (dataIso: string) => {
  const [ano, mes] = dataIso.split("-");
  const nomes = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const idx = Number(mes) - 1;
  return `${nomes[idx] ?? mes}/${ano.slice(2)}`;
};

const serieParaLinha = (serie: SeriePonto[]) => {
  if (serie.length === 0)
    return {
      pontos: "",
      fillPath: "",
      circles: [] as { cx: number; cy: number; valor: number; label: string }[],
    };

  const maxValor = Math.max(...serie.map((p) => p.valor), 10);
  const largura = 100;
  const altura = 40;
  const passoX = serie.length === 1 ? 0 : largura / (serie.length - 1);

  const pontos: string[] = [];
  const circles: { cx: number; cy: number; valor: number; label: string }[] =
    [];

  serie.forEach((p, idx) => {
    const x = idx * passoX;
    const y = altura - (p.valor / maxValor) * altura;
    pontos.push(`${x},${y}`);
    circles.push({ cx: x, cy: y, valor: p.valor, label: p.label });
  });

  const fillPath = `0,${altura} ${pontos.join(" ")} ${largura},${altura}`;

  return { pontos: pontos.join(" "), fillPath, circles };
};

export function RelatoriosProfessor({ professorId }: RelatoriosProfessorProps) {
  const [painel, setPainel] = useState<RelatorioProfessorPayload | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<FiltroPeriodo>("tudo");

  useEffect(() => {
    carregarDados();
  }, [professorId, periodo]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const meses = periodo === "6m" ? 6 : periodo === "12m" ? 12 : undefined;
      const resposta = await buscarRelatorioProfessor(professorId, { meses });
      setPainel(resposta);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao carregar relatórios do professor";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const serieMedias = useMemo<SeriePonto[]>(() => {
    if (!painel) return [];
    const ordenadas = [...painel.avaliacoes].sort((a, b) =>
      a.data.localeCompare(b.data),
    );
    return ordenadas.map((avaliacao) => ({
      label: mesCurto(avaliacao.data),
      valor: avaliacao.mediaNota ?? 0,
    }));
  }, [painel]);

  const melhoresAlunos = useMemo<AlunoComparativo[]>(() => {
    if (!painel) return [];
    return [...painel.alunos]
      .sort((a, b) => (b.media ?? 0) - (a.media ?? 0))
      .slice(0, 5);
  }, [painel]);

  const avaliacoesExtremos = useMemo(() => {
    if (!painel)
      return {
        melhores: [] as AvaliacaoDesempenho[],
        piores: [] as AvaliacaoDesempenho[],
      };
    const ordenadas = [...painel.avaliacoes].sort(
      (a, b) => (b.mediaNota ?? 0) - (a.mediaNota ?? 0),
    );
    return {
      melhores: ordenadas.slice(0, 3),
      piores: ordenadas.slice(-3).reverse(),
    };
  }, [painel]);

  if (carregando) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Calculando comparativos das suas turmas...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!painel) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Relatórios do professor</CardTitle>
          <CardDescription>Não foi possível carregar os dados.</CardDescription>
        </CardHeader>
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p className="text-center text-sm max-w-sm">
              {erro || "Verifique sua conexão e tente novamente."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { pontos, fillPath, circles } = serieParaLinha(serieMedias);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Relatórios e painéis</CardTitle>
            <CardDescription>
              Comparativos entre alunos, provas e questões mais críticas
            </CardDescription>
            {erro && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}
          </div>
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
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Média geral
              </p>
              <p className="text-2xl font-semibold">
                {painel.resumo.mediaGeral.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Melhor nota
              </p>
              <p className="text-2xl font-semibold">
                {painel.resumo.melhorNota.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Alunos totais
              </p>
              <p className="text-2xl font-semibold">
                {painel.resumo.totalAlunosImpactados}
              </p>
            </div>
          </div>
          <div className="panel flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Correções realizadas
              </p>
              <p className="text-2xl font-semibold">
                {painel.resumo.respostasCorrigidas}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                Evolução das médias por prova
              </CardTitle>
              <CardDescription>
                Tendência das turmas nas avaliações aplicadas
              </CardDescription>
            </div>
            <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
              {painel.avaliacoes.length} provas
            </span>
          </CardHeader>
          <CardContent>
            {serieMedias.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">
                Ainda não há provas com notas lançadas.
              </div>
            ) : (
              <div className="panel bg-gradient-to-br from-card to-primary/5">
                <svg viewBox="0 0 100 40" className="h-48 w-full">
                  <polygon points={fillPath} className="fill-primary/10" />
                  <polyline
                    points={pontos}
                    className="fill-none stroke-primary"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {circles.map((c, idx) => (
                    <circle
                      key={idx}
                      cx={c.cx}
                      cy={c.cy}
                      r={1.6}
                      className="fill-primary"
                    />
                  ))}
                </svg>
                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2 text-xs text-muted-foreground">
                  {serieMedias.map((ponto, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground">
                        {ponto.valor.toFixed(1)}
                      </span>
                      <span>{ponto.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Alunos em destaque</CardTitle>
              <CardDescription>
                Comparativo por média e volume de provas
              </CardDescription>
            </div>
            <span className="text-xs rounded-full border bg-card px-3 py-1 text-muted-foreground">
              Top {melhoresAlunos.length}
            </span>
          </CardHeader>
          <CardContent>
            {melhoresAlunos.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">
                Nenhum aluno com notas lançadas no período.
              </div>
            ) : (
              <div className="rounded-lg border bg-card/80 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Provas</TableHead>
                      <TableHead>Média</TableHead>
                      <TableHead>Melhor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {melhoresAlunos.map((aluno, idx) => (
                      <TableRow key={aluno.alunoId}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="font-medium leading-tight">
                                {aluno.email}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {aluno.matricula}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {aluno.avaliacoesRespondidas}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {aluno.media.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {aluno.melhorNota.toFixed(1)}
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

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                Provas com maior e menor nota
              </CardTitle>
              <CardDescription>
                Ranking das avaliações aplicadas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Star className="h-4 w-4" />
                Melhores médias
              </div>
              {avaliacoesExtremos.melhores.length === 0 ? (
                <div className="panel text-sm text-muted-foreground mt-2">
                  Sem provas com notas registradas.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {avaliacoesExtremos.melhores.map((avaliacao) => (
                    <LinhaAvaliacao
                      key={avaliacao.avaliacaoId}
                      avaliacao={avaliacao}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                <Flame className="h-4 w-4" />
                Menores médias
              </div>
              {avaliacoesExtremos.piores.length === 0 ? (
                <div className="panel text-sm text-muted-foreground mt-2">
                  Sem médias calculadas.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {avaliacoesExtremos.piores.map((avaliacao) => (
                    <LinhaAvaliacao
                      key={avaliacao.avaliacaoId}
                      avaliacao={avaliacao}
                      invertida
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Questões mais difíceis</CardTitle>
              <CardDescription>
                Quais itens mais derrubam a média
              </CardDescription>
            </div>
            <span className="text-xs rounded-full border bg-card px-3 py-1 text-muted-foreground">
              Top {painel.questoesCriticas.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {painel.questoesCriticas.length === 0 ? (
              <div className="panel text-sm text-muted-foreground">
                Ainda não há respostas para suas questões.
              </div>
            ) : (
              painel.questoesCriticas.map((questao) => (
                <LinhaQuestao key={questao.questaoId} questao={questao} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              Professores com mais acertos
            </CardTitle>
            <CardDescription>
              Comparativo geral das questões corrigidas
            </CardDescription>
          </div>
          <span className="text-xs rounded-full border bg-card px-3 py-1 text-muted-foreground">
            {painel.rankingProfessores.length} docentes
          </span>
        </CardHeader>
        <CardContent>
          {painel.rankingProfessores.length === 0 ? (
            <div className="panel text-sm text-muted-foreground">
              Nenhum professor com respostas corrigidas.
            </div>
          ) : (
            <div className="rounded-lg border bg-card/80 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professor</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead className="text-center">Respostas</TableHead>
                    <TableHead className="text-right">Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {painel.rankingProfessores.map((prof, idx) => (
                    <TableRow key={prof.professorId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-medium leading-tight">
                              {prof.nome}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {prof.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prof.area}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {prof.respostasCorrigidas}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {prof.mediaAcertos.toFixed(1)}
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
  );
}

function LinhaAvaliacao({
  avaliacao,
  invertida,
}: {
  avaliacao: AvaliacaoDesempenho;
  invertida?: boolean;
}) {
  const cor = invertida
    ? "bg-gradient-to-br from-red-500/10 via-orange-500/10 to-orange-500/5 border border-red-500/30"
    : "bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-teal-500/5 border border-emerald-500/30";
  const icone = invertida ? (
    <Flame className="h-4 w-4 text-red-500" />
  ) : (
    <Star className="h-4 w-4 text-emerald-500" />
  );

  return (
    <div className={`rounded-lg ${cor} p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icone}
          <div>
            <p className="font-semibold leading-tight">{avaliacao.descricao}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatarDataCurta(avaliacao.data)}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${invertida
              ? "bg-red-500/20 text-red-900 dark:text-red-50"
              : "bg-emerald-500/20 text-emerald-900 dark:text-emerald-50"
            }`}
        >
          {avaliacao.mediaNota?.toFixed(1)} pts
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>Respondentes: {avaliacao.respondentes}</span>
        <span>Maior: {avaliacao.maiorNota?.toFixed(1)}</span>
        <span>Menor: {avaliacao.menorNota?.toFixed(1)}</span>
      </div>
    </div>
  );
}

function LinhaQuestao({ questao }: { questao: QuestaoDesafio }) {
  const dificuldadeCor: Record<string, string> = {
    FACIL: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MEDIO: "bg-amber-100 text-amber-700 border-amber-200",
    DIFICIL: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="rounded-lg border bg-card/80 p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <p className="font-semibold leading-tight line-clamp-2">
              {questao.enunciado}
            </p>
            <p className="text-[11px] text-muted-foreground">{questao.tema}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${dificuldadeCor[questao.dificuldade] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
        >
          {questao.dificuldade}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{questao.totalRespostas} respostas</span>
        <span>
          Média:{" "}
          {Number.isFinite(questao.mediaNota)
            ? questao.mediaNota.toFixed(1)
            : "—"}
        </span>
        <span>
          Acerto:{" "}
          {questao.percentualAcerto !== null &&
            questao.percentualAcerto !== undefined
            ? `${questao.percentualAcerto.toFixed(1)}%`
            : "—"}
        </span>
      </div>
    </div>
  );
}
