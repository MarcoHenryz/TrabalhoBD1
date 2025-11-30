import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listarQuestoes, deletarQuestao, type Questao, type TipoQuestao, type Dificuldade } from "@/lib/apiprof";
import { Trash2, Loader2 } from "lucide-react";

type ListarQuestoesProps = {
  onQuestaoDeletada?: () => void;
  onError?: (error: string) => void;
  refreshTrigger?: number;
};

export function ListarQuestoes({ onQuestaoDeletada, onError, refreshTrigger }: ListarQuestoesProps) {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

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
          <CardTitle className="text-2xl">Lista de Questões</CardTitle>
          <CardDescription>Questões cadastradas no sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhuma questão cadastrada ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">Crie sua primeira questão usando o formulário acima.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Lista de Questões</CardTitle>
        <CardDescription>{questoes.length} {questoes.length === 1 ? "questão cadastrada" : "questões cadastradas"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questoes.map((questao) => (
            <Card key={questao.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Enunciado</p>
                      <p className="text-base">{questao.enunciado}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Tema</p>
                        <p className="text-sm">{questao.tema}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Tipo</p>
                        <p className="text-sm">{formatarTipo(questao.tipo)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Dificuldade</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDificuldadeColor(questao.dificuldade)}`}
                        >
                          {formatarDificuldade(questao.dificuldade)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletar(questao.id)}
                    disabled={deletandoId === questao.id}
                    className="shrink-0"
                  >
                    {deletandoId === questao.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

