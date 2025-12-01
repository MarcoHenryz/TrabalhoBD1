import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CorrecaoDissertativa,
  StatusCorrecao,
  corrigirRespostaProfessor,
  listarCorrecoes,
} from "@/lib/apiprof";
import { Loader2, CheckCircle2, ClipboardList, AlertCircle } from "lucide-react";

type CorrecaoQuestoesProps = {
  professorId: string;
};

export function CorrecaoQuestoes({ professorId }: CorrecaoQuestoesProps) {
  const [status, setStatus] = useState<StatusCorrecao>("pendentes");
  const [items, setItems] = useState<CorrecaoDissertativa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [notaEdicao, setNotaEdicao] = useState<Record<string, string>>({});

  useEffect(() => {
    carregar();
  }, [professorId, status]);

  const carregar = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const resposta = await listarCorrecoes(professorId, status);
      setItems(resposta);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar correções";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const pendentes = useMemo(() => items.filter((i) => !i.corrigido), [items]);
  const corrigidas = useMemo(() => items.filter((i) => i.corrigido), [items]);

  const handleSalvar = async (item: CorrecaoDissertativa) => {
    const valorTexto = notaEdicao[item.respostaId];
    const valor = valorTexto ? Number(valorTexto) : undefined;
    if (valor === undefined || Number.isNaN(valor)) {
      setErro("Informe uma nota entre 0 e 10.");
      return;
    }
    if (valor < 0 || valor > 10) {
      setErro("A nota deve estar entre 0 e 10.");
      return;
    }

    try {
      setErro(null);
      setSalvandoId(item.respostaId);
      await corrigirRespostaProfessor(professorId, item.respostaId, valor);
      await carregar();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao salvar nota";
      setErro(mensagem);
    } finally {
      setSalvandoId(null);
    }
  };

  const listaExibida = status === "pendentes" ? pendentes : status === "corrigidas" ? corrigidas : items;

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Corrigir questões</CardTitle>
            <CardDescription>Somente questões dissertativas das suas provas</CardDescription>
            {erro && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Filtrar</span>
            <select
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusCorrecao)}
            >
              <option value="pendentes">Pendentes</option>
              <option value="corrigidas">Corrigidas</option>
              <option value="todas">Todas</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando respostas...</span>
            </div>
          ) : listaExibida.length === 0 ? (
            <div className="panel text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Nenhuma resposta encontrada para este filtro.</span>
            </div>
          ) : (
            <div className="rounded-lg border bg-card/80 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Prova</TableHead>
                    <TableHead>Questão</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead className="text-right">Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listaExibida.map((item) => (
                    <TableRow key={item.respostaId}>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-2">
                          {item.corrigido ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-1" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-muted-foreground mt-1" />
                          )}
                          <div>
                            <p className="font-semibold leading-tight">{item.alunoEmail}</p>
                            <p className="text-[11px] text-muted-foreground">{item.alunoMatricula}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm">
                        <p className="font-medium leading-tight">{item.avaliacaoDescricao}</p>
                        <p className="text-[11px] text-muted-foreground">{item.avaliacaoData}</p>
                      </TableCell>
                      <TableCell className="align-top text-sm">
                        <p className="font-medium leading-tight line-clamp-2">{item.enunciado}</p>
                        <p className="text-[11px] text-muted-foreground">{item.tema}</p>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground max-w-[240px]">
                        <div className="whitespace-pre-wrap line-clamp-4">{item.respostaTexto}</div>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        {item.corrigido ? (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold">
                            {(item.nota ?? 0).toFixed(1)} / 10
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.5}
                              className="w-24 rounded-md border px-2 py-1 text-right text-sm"
                              value={notaEdicao[item.respostaId] ?? ""}
                              onChange={(e) =>
                                setNotaEdicao((prev) => ({ ...prev, [item.respostaId]: e.target.value }))
                              }
                              placeholder="0-10"
                            />
                            <button
                              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                              onClick={() => handleSalvar(item)}
                              disabled={salvandoId === item.respostaId}
                            >
                              {salvandoId === item.respostaId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </button>
                          </div>
                        )}
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
