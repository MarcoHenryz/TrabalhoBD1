import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listarQuestoes, deletarQuestao, type Questao, type TipoQuestao, type Dificuldade } from "@/lib/apiprof";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { EditarQuestaoForm } from "./EditarQuestaoForm";

type GerenciarQuestoesProps = {
  professorId: string;
  onQuestaoDeletada?: () => void;
  onQuestaoEditada?: () => void;
  onError?: (error: string) => void;
  refreshTrigger?: number;
};

export function GerenciarQuestoes({ professorId, onQuestaoDeletada, onQuestaoEditada, onError, refreshTrigger }: GerenciarQuestoesProps) {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const carregarQuestoes = async () => {
    try {
      setLoading(true);
      const questoesData = await listarQuestoes();
      setQuestoes(questoesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar questões";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarQuestoes();
  }, [refreshTrigger]);

  const handleDeletar = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) {
      return;
    }

    try {
      setDeletandoId(id);
      await deletarQuestao(id);
      setQuestoes(questoes.filter(q => q.id !== id));
      onQuestaoDeletada?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar questão";
      onError?.(errorMessage);
    } finally {
      setDeletandoId(null);
    }
  };

  const formatarTipo = (tipo: TipoQuestao): string => {
    switch (tipo) {
      case "MULTIPLA_ESCOLHA":
        return "Múltipla Escolha";
      case "VOUF":
        return "Verdadeiro ou Falso";
      case "DISSERTATIVA":
        return "Dissertativa";
      default:
        return tipo;
    }
  };

  const formatarDificuldade = (dificuldade: Dificuldade): string => {
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
  };

  const getDificuldadeColor = (dificuldade: Dificuldade): string => {
    switch (dificuldade) {
      case "FACIL":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DIFICIL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando questões...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questoes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Gerenciar Questões</CardTitle>
          <CardDescription>Lista de todas as questões cadastradas</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhuma questão encontrada.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie uma nova questão na seção "Criar questões".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Gerenciar Questões</CardTitle>
        <CardDescription>
          {questoes.length} {questoes.length === 1 ? "questão cadastrada" : "questões cadastradas"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enunciado</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questoes.map((questao) => (
                <TableRow key={questao.id}>
                  <TableCell className="font-medium max-w-md">
                    <div className="line-clamp-2">{questao.enunciado}</div>
                  </TableCell>
                  <TableCell>{questao.tema}</TableCell>
                  <TableCell>{formatarTipo(questao.tipo)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDificuldadeColor(questao.dificuldade)}`}
                    >
                      {formatarDificuldade(questao.dificuldade)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditandoId(questao.id)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletar(questao.id)}
                        disabled={deletandoId === questao.id}
                        className="gap-2"
                      >
                        {deletandoId === questao.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {editandoId && (
        <EditarQuestaoForm
          questaoId={editandoId}
          professorId={professorId}
          open={!!editandoId}
          onOpenChange={(open) => {
            if (!open) {
              setEditandoId(null);
            }
          }}
          onSuccess={() => {
            carregarQuestoes();
            onQuestaoEditada?.();
            setEditandoId(null);
          }}
          onError={onError}
        />
      )}
    </Card>
  );
}

