import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buscarAvaliacaoPorId,
  atualizarAvaliacao,
  listarQuestoesAvaliacao,
  adicionarQuestaoAvaliacao,
  removerQuestaoAvaliacao,
  listarQuestoes,
  type Questao,
  type TipoQuestao,
  type Dificuldade,
  type AvaliacaoRequest,
  type AdicionarQuestaoAvaliacaoRequest,
} from "@/lib/apiprof";
import { Loader2 } from "lucide-react";

type QuestaoSelecionada = {
  questao: Questao;
  selecionada: boolean;
  peso: number;
};

type EditarAvaliacaoModalProps = {
  avaliacaoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function EditarAvaliacaoModal({
  avaliacaoId,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: EditarAvaliacaoModalProps) {
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [questoes, setQuestoes] = useState<QuestaoSelecionada[]>([]);
  const [questoesOriginaisIds, setQuestoesOriginaisIds] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (open && avaliacaoId) {
      carregarDados();
    } else {
      // Limpar dados quando fechar
      setDescricao("");
      setData("");
      setHorario("");
      setQuestoes([]);
      setQuestoesOriginaisIds(new Set());
    }
  }, [open, avaliacaoId]);

  const carregarDados = async () => {
    setIsLoadingData(true);
    try {
      // Carregar avaliação, questões da avaliação e todas as questões em paralelo
      const [avaliacao, questoesAvaliacao, todasQuestoes] = await Promise.all([
        buscarAvaliacaoPorId(avaliacaoId),
        listarQuestoesAvaliacao(avaliacaoId),
        listarQuestoes(),
      ]);

      // Preencher dados básicos
      setDescricao(avaliacao.descricao);
      setData(avaliacao.data);
      setHorario(avaliacao.horario);

      // Guardar IDs das questões originais para fazer diff depois
      const idsOriginais = new Set(questoesAvaliacao.map((q) => q.id));
      setQuestoesOriginaisIds(idsOriginais);

      // Preparar lista de questões com as que já estão na avaliação marcadas
      setQuestoes(
        todasQuestoes.map((q) => ({
          questao: q,
          selecionada: idsOriginais.has(q.id),
          peso: 1.0, // Peso padrão, pode ser melhorado no futuro
        }))
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados da avaliação";
      onError?.(errorMessage);
      onOpenChange(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleQuestao = (index: number) => {
    setQuestoes(
      questoes.map((q, i) => (i === index ? { ...q, selecionada: !q.selecionada } : q))
    );
  };

  const atualizarPeso = (index: number, peso: number) => {
    setQuestoes(
      questoes.map((q, i) => (i === index ? { ...q, peso: Math.max(0.1, peso) } : q))
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!descricao.trim()) {
        throw new Error("Descrição é obrigatória");
      }
      if (!data) {
        throw new Error("Data é obrigatória");
      }
      if (!horario) {
        throw new Error("Horário é obrigatório");
      }

      const questoesSelecionadas = questoes.filter((q) => q.selecionada);
      if (questoesSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma questão");
      }

      // Passo 1: Atualizar dados básicos
      const avaliacaoRequest: AvaliacaoRequest = {
        descricao: descricao.trim(),
        data,
        horario,
        participantes: null,
      };

      await atualizarAvaliacao(avaliacaoId, avaliacaoRequest);

      // Passo 2: Sincronizar questões (diff)
      const questoesSelecionadasIds = new Set(questoesSelecionadas.map((q) => q.questao.id));

      // Identificar questões para adicionar (estão selecionadas mas não estavam antes)
      const questoesParaAdicionar = questoesSelecionadas.filter(
        (q) => !questoesOriginaisIds.has(q.questao.id)
      );

      // Identificar questões para remover (estavam antes mas não estão mais selecionadas)
      const questoesParaRemover = Array.from(questoesOriginaisIds).filter(
        (id) => !questoesSelecionadasIds.has(id)
      );

      // Processar remoções e adições em paralelo usando Promise.all
      const operacoes: Promise<void>[] = [];

      // Adicionar operações de remoção
      questoesParaRemover.forEach((questaoId) => {
        operacoes.push(removerQuestaoAvaliacao(avaliacaoId, questaoId));
      });

      // Adicionar operações de adição
      questoesParaAdicionar.forEach((questaoSel, index) => {
        const request: AdicionarQuestaoAvaliacaoRequest = {
          questaoId: questaoSel.questao.id,
          peso: questaoSel.peso,
          ordem: undefined, // Deixa o backend decidir a ordem
        };
        operacoes.push(adicionarQuestaoAvaliacao(avaliacaoId, request));
      });

      // Executar todas as operações em paralelo
      await Promise.all(operacoes);

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar avaliação";
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questoesSelecionadas = questoes.filter((q) => q.selecionada).length;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Avaliação</DialogTitle>
          <DialogDescription>
            Altere os dados da avaliação e modifique as questões associadas
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando dados da avaliação...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formulário básico */}
            <div className="space-y-4">
              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Prova de Matemática - 1º Bimestre"
                  required
                  rows={3}
                />
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Horário *</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Lista de Questões */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Questões Disponíveis</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {questoesSelecionadas} questão(ões) selecionada(s)
                  </p>
                </div>
              </div>

              {questoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma questão disponível no banco de dados.</p>
                  <p className="text-sm mt-2">Crie questões primeiro na seção "Criar questões".</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {questoes.map((questaoSel, index) => (
                    <div
                      key={questaoSel.questao.id}
                      className={`p-4 border rounded-md transition-colors ${
                        questaoSel.selecionada
                          ? "bg-primary/5 border-primary"
                          : "bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`questao-${questaoSel.questao.id}`}
                          checked={questaoSel.selecionada}
                          onChange={() => toggleQuestao(index)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <Label
                              htmlFor={`questao-${questaoSel.questao.id}`}
                              className="text-base font-medium cursor-pointer"
                            >
                              {questaoSel.questao.enunciado}
                            </Label>
                            <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                              <span className="px-2 py-0.5 bg-muted rounded">
                                {formatarTipo(questaoSel.questao.tipo)}
                              </span>
                              <span className="px-2 py-0.5 bg-muted rounded">
                                {formatarDificuldade(questaoSel.questao.dificuldade)}
                              </span>
                              <span className="px-2 py-0.5 bg-muted rounded">
                                {questaoSel.questao.tema}
                              </span>
                            </div>
                          </div>
                          {questaoSel.selecionada && (
                            <div className="flex items-center gap-2 pt-2">
                              <Label htmlFor={`peso-${questaoSel.questao.id}`} className="text-sm">
                                Peso:
                              </Label>
                              <Input
                                id={`peso-${questaoSel.questao.id}`}
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={questaoSel.peso}
                                onChange={(e) =>
                                  atualizarPeso(index, parseFloat(e.target.value) || 1.0)
                                }
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || questoesSelecionadas === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

