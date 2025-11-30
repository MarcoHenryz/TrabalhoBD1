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
import { listarAvaliacoes, deletarAvaliacao, type Avaliacao } from "@/lib/apiprof";
import { Loader2, Trash2, Users, Edit } from "lucide-react";
import { EditarAvaliacaoModal } from "./EditarAvaliacaoModal";
import { DistribuirAvaliacaoModal } from "./DistribuirAvaliacaoModal";

type GerenciarAvaliacoesProps = {
  onAvaliacaoDeletada?: () => void;
  onError?: (error: string) => void;
  refreshTrigger?: number;
};

export function GerenciarAvaliacoes({ onAvaliacaoDeletada, onError, refreshTrigger }: GerenciarAvaliacoesProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [distribuindoId, setDistribuindoId] = useState<string | null>(null);
  const [modalDistribuirAberto, setModalDistribuirAberto] = useState(false);

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true);
      const avaliacoesData = await listarAvaliacoes();
      setAvaliacoes(avaliacoesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar avaliações";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, [refreshTrigger]);

  const handleDeletar = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) {
      return;
    }

    try {
      setDeletandoId(id);
      await deletarAvaliacao(id);
      setAvaliacoes(avaliacoes.filter(a => a.id !== id));
      onAvaliacaoDeletada?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar avaliação";
      onError?.(errorMessage);
    } finally {
      setDeletandoId(null);
    }
  };

  const handleVincularAlunos = (id: string) => {
    setDistribuindoId(id);
    setModalDistribuirAberto(true);
  };

  const handleModalDistribuirFechar = (open: boolean) => {
    setModalDistribuirAberto(open);
    if (!open) {
      setDistribuindoId(null);
    }
  };

  const handleEditar = (id: string) => {
    setEditandoId(id);
    setModalAberto(true);
  };

  const handleModalFechar = (open: boolean) => {
    setModalAberto(open);
    if (!open) {
      setEditandoId(null);
    }
  };

  const handleAvaliacaoAtualizada = () => {
    carregarAvaliacoes();
    onAvaliacaoDeletada?.(); // Reutiliza o callback para atualizar a lista
  };

  const formatarData = (data: string): string => {
    // Converte de "YYYY-MM-DD" para "DD/MM/YYYY"
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Gerenciar Avaliações</CardTitle>
          <CardDescription>Lista de todas as avaliações cadastradas</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhuma avaliação encontrada.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie uma nova avaliação na seção "Criar provas".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Gerenciar Avaliações</CardTitle>
        <CardDescription>
          {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação cadastrada" : "avaliações cadastradas"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avaliacoes.map((avaliacao) => (
                <TableRow key={avaliacao.id}>
                  <TableCell className="font-medium">{avaliacao.descricao}</TableCell>
                  <TableCell>{formatarData(avaliacao.data)}</TableCell>
                  <TableCell>{avaliacao.horario}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditar(avaliacao.id)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVincularAlunos(avaliacao.id)}
                        className="gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Vincular Alunos
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletar(avaliacao.id)}
                        disabled={deletandoId === avaliacao.id}
                        className="gap-2"
                      >
                        {deletandoId === avaliacao.id ? (
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
        <EditarAvaliacaoModal
          avaliacaoId={editandoId}
          open={modalAberto}
          onOpenChange={handleModalFechar}
          onSuccess={handleAvaliacaoAtualizada}
          onError={onError}
        />
      )}
      {distribuindoId && (
        <DistribuirAvaliacaoModal
          avaliacaoId={distribuindoId}
          avaliacaoDescricao={avaliacoes.find((a) => a.id === distribuindoId)?.descricao || ""}
          open={modalDistribuirAberto}
          onOpenChange={handleModalDistribuirFechar}
          onError={onError}
        />
      )}
    </Card>
  );
}

