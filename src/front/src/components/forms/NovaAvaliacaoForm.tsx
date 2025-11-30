import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  criarAvaliacao, 
  adicionarQuestaoAvaliacao, 
  listarQuestoes, 
  type Questao,
  type TipoQuestao,
  type Dificuldade,
  type AvaliacaoRequest,
  type AdicionarQuestaoAvaliacaoRequest
} from "@/lib/api";
import { Loader2 } from "lucide-react";

type QuestaoSelecionada = {
  questao: Questao;
  selecionada: boolean;
  peso: number;
};

type NovaAvaliacaoFormProps = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function NovaAvaliacaoForm({ onSuccess, onError }: NovaAvaliacaoFormProps) {
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [questoes, setQuestoes] = useState<QuestaoSelecionada[]>([]);
  const [isLoadingQuestoes, setIsLoadingQuestoes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar questões ao montar o componente
  useEffect(() => {
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    setIsLoadingQuestoes(true);
    try {
      const questoesList = await listarQuestoes();
      setQuestoes(
        questoesList.map(q => ({
          questao: q,
          selecionada: false,
          peso: 1.0,
        }))
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar questões";
      onError?.(errorMessage);
    } finally {
      setIsLoadingQuestoes(false);
    }
  };

  const toggleQuestao = (index: number) => {
    setQuestoes(
      questoes.map((q, i) => 
        i === index ? { ...q, selecionada: !q.selecionada } : q
      )
    );
  };

  const atualizarPeso = (index: number, peso: number) => {
    setQuestoes(
      questoes.map((q, i) => 
        i === index ? { ...q, peso: Math.max(0.1, peso) } : q
      )
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

      const questoesSelecionadas = questoes.filter(q => q.selecionada);
      if (questoesSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma questão");
      }

      // Passo 1: Criar a avaliação
      const avaliacaoRequest: AvaliacaoRequest = {
        descricao: descricao.trim(),
        data,
        horario,
        participantes: null,
      };

      const avaliacao = await criarAvaliacao(avaliacaoRequest);

      // Passo 2: Adicionar questões selecionadas
      for (let i = 0; i < questoesSelecionadas.length; i++) {
        const questaoSel = questoesSelecionadas[i];
        const request: AdicionarQuestaoAvaliacaoRequest = {
          questaoId: questaoSel.questao.id,
          peso: questaoSel.peso,
          ordem: i + 1, // Ordem sequencial
        };

        await adicionarQuestaoAvaliacao(avaliacao.id, request);
      }

      // Limpar formulário
      setDescricao("");
      setData("");
      setHorario("");
      setQuestoes(
        questoes.map(q => ({
          ...q,
          selecionada: false,
          peso: 1.0,
        }))
      );

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar avaliação";
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questoesSelecionadas = questoes.filter(q => q.selecionada).length;

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Nova Avaliação</CardTitle>
        <CardDescription>Preencha os dados da avaliação e selecione as questões</CardDescription>
      </CardHeader>
      <CardContent>
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
              {isLoadingQuestoes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando questões...
                </div>
              )}
            </div>

            {isLoadingQuestoes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : questoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma questão disponível no banco de dados.</p>
                <p className="text-sm mt-2">Crie questões primeiro na seção "Criar questões".</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
                              onChange={(e) => atualizarPeso(index, parseFloat(e.target.value) || 1.0)}
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
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoadingQuestoes || questoesSelecionadas === 0} 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar Avaliação"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

