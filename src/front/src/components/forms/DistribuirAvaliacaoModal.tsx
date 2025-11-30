import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2, Circle } from "lucide-react";
import { listarAlunos, associarAlunoAvaliacao, desassociarAlunoAvaliacao, buscarAvaliacaoPorId, type Aluno } from "@/lib/apiprof";
import { cn } from "@/lib/utils";

type DistribuirAvaliacaoModalProps = {
  avaliacaoId: string;
  avaliacaoDescricao: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError?: (error: string) => void;
};

export function DistribuirAvaliacaoModal({
  avaliacaoId,
  avaliacaoDescricao,
  open,
  onOpenChange,
  onError,
}: DistribuirAvaliacaoModalProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosVinculados, setAlunosVinculados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [processandoIds, setProcessandoIds] = useState<Set<string>>(new Set());

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const [alunosData, avaliacaoData] = await Promise.all([
        listarAlunos(),
        buscarAvaliacaoPorId(avaliacaoId),
      ]);
      setAlunos(alunosData);
      
      // Carregar alunos já vinculados da avaliação
      const alunosVinculadosSet = new Set<string>();
      if (avaliacaoData.participacoes) {
        avaliacaoData.participacoes.forEach((participacao) => {
          alunosVinculadosSet.add(participacao.alunoId);
        });
      }
      setAlunosVinculados(alunosVinculadosSet);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar alunos";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      carregarAlunos();
      setBusca("");
    }
  }, [open]);

  const alunosFiltrados = useMemo(() => {
    if (!busca.trim()) {
      return alunos;
    }
    const buscaLower = busca.toLowerCase();
    return alunos.filter(
      (aluno) =>
        aluno.matricula.toLowerCase().includes(buscaLower) ||
        aluno.usuario?.email.toLowerCase().includes(buscaLower)
    );
  }, [alunos, busca]);

  const handleToggleAluno = async (alunoId: string, isChecked: boolean) => {
    try {
      setProcessandoIds((prev) => new Set(prev).add(alunoId));

      if (isChecked) {
        await associarAlunoAvaliacao(avaliacaoId, alunoId);
        setAlunosVinculados((prev) => new Set(prev).add(alunoId));
      } else {
        await desassociarAlunoAvaliacao(avaliacaoId, alunoId);
        setAlunosVinculados((prev) => {
          const novo = new Set(prev);
          novo.delete(alunoId);
          return novo;
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar vínculo";
      onError?.(errorMessage);
    } finally {
      setProcessandoIds((prev) => {
        const novo = new Set(prev);
        novo.delete(alunoId);
        return novo;
      });
    }
  };

  const getNomeAluno = (aluno: Aluno): string => {
    if (aluno.usuario?.email) {
      return aluno.usuario.email;
    }
    return aluno.matricula;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Distribuir Avaliação</DialogTitle>
          <DialogDescription>
            Vincular alunos à avaliação: <strong>{avaliacaoDescricao}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por matrícula ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista de alunos */}
          <div className="flex-1 overflow-y-auto border rounded-md p-4 space-y-2 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando alunos...</p>
                </div>
              </div>
            ) : alunosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {busca ? "Nenhum aluno encontrado com essa busca." : "Nenhum aluno cadastrado."}
                </p>
              </div>
            ) : (
              alunosFiltrados.map((aluno) => {
                const isChecked = alunosVinculados.has(aluno.id);
                const isProcessing = processandoIds.has(aluno.id);

                return (
                  <div
                    key={aluno.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      isProcessing && "opacity-50",
                      isChecked && "bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleAluno(aluno.id, !isChecked)}
                      disabled={isProcessing}
                      className="flex items-center gap-3 flex-1 text-left hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : isChecked ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{getNomeAluno(aluno)}</p>
                        <p className="text-sm text-muted-foreground">Matrícula: {aluno.matricula}</p>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Estatísticas */}
          {!loading && alunosFiltrados.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {alunosVinculados.size} de {alunosFiltrados.length} aluno{alunosFiltrados.length !== 1 ? "s" : ""} vinculado{alunosVinculados.size !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

