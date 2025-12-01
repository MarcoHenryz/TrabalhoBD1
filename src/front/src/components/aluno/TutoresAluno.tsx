import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listarTutoriasDoAluno, type ProvaComTutor } from "@/lib/apiprof";
import { UserRound, Loader2, NotebookPen, ArrowRight } from "lucide-react";

type TutoresAlunoProps = {
  alunoId: string;
  onOpenAvaliacao: (avaliacaoId: string) => void;
};

type TutorAgrupado = {
  professorId: string;
  professorNome: string;
  professorEmail: string;
  professorArea: string;
  avaliacoes: ProvaComTutor[];
};

function formatarData(dataIso: string) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function extrairNome(email?: string) {
  if (!email) return "Nome não informado";
  const base = email.split("@")[0] || email;
  return base
    .split(/[._-]/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export function TutoresAluno({ alunoId, onOpenAvaliacao }: TutoresAlunoProps) {
  const [tutores, setTutores] = useState<TutorAgrupado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarTutores();
  }, [alunoId]);

  const carregarTutores = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await listarTutoriasDoAluno(alunoId);
      const agrupado = new Map<string, TutorAgrupado>();

      resposta.forEach((prova) => {
        const chave = prova.professorId;
        const atual = agrupado.get(chave) ?? {
          professorId: prova.professorId,
          professorNome: prova.professorNome || extrairNome(prova.professorEmail),
          professorEmail: prova.professorEmail,
          professorArea: prova.professorArea,
          avaliacoes: [],
        };
        atual.avaliacoes.push(prova);
        agrupado.set(chave, atual);
      });

      setTutores(Array.from(agrupado.values()).sort((a, b) => a.professorArea.localeCompare(b.professorArea)));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar tutores";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando tutores...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Tutores</CardTitle>
            <CardDescription>Veja as provas associadas por tutor</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
        {erro && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {tutores.length === 0 && (
          <div className="panel flex items-center gap-3 text-muted-foreground">
            <NotebookPen className="h-5 w-5" />
            <p className="text-sm">
              Nenhum tutor encontrado. Assim que um professor vincular você a uma avaliação, ele aparecerá aqui.
            </p>
          </div>
        )}

        {tutores.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {tutores.map((tutor) => (
              <div key={tutor.professorId} className="rounded-lg border bg-white/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tutor</p>
                  <p className="text-lg font-semibold leading-tight">{tutor.professorNome || extrairNome(tutor.professorEmail)}</p>
                  <p className="text-sm text-muted-foreground">{tutor.professorEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">Área: {tutor.professorArea}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {tutor.avaliacoes.length} {tutor.avaliacoes.length === 1 ? "prova" : "provas"}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {tutor.avaliacoes.map((avaliacao) => {
                    const progresso =
                      avaliacao.totalQuestoes > 0
                        ? Math.min(100, Math.round((avaliacao.respondidas / avaliacao.totalQuestoes) * 100))
                        : 0;

                    return (
                      <button
                        key={avaliacao.avaliacaoId}
                        className="w-full rounded-md border border-slate-200 bg-white/80 p-3 text-left transition hover:border-primary hover:bg-primary/5"
                        onClick={() => onOpenAvaliacao(avaliacao.avaliacaoId)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{avaliacao.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatarData(avaliacao.data)} · {avaliacao.horario} · {avaliacao.totalQuestoes}{" "}
                              {avaliacao.totalQuestoes === 1 ? "questão" : "questões"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                              {avaliacao.respondidas}/{avaliacao.totalQuestoes || "?"} resp.
                            </span>
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${progresso}%` }}
                            aria-label="Progresso de respostas"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
