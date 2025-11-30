import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { criarQuestao, type TipoQuestao, type Dificuldade, type AlternativaRequest, type VoufRequest } from "@/lib/apiprof";
import { Plus, Trash2 } from "lucide-react";

type CriarQuestaoFormProps = {
  professorId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function CriarQuestaoForm({ professorId, onSuccess, onError }: CriarQuestaoFormProps) {
  const [enunciado, setEnunciado] = useState("");
  const [tema, setTema] = useState("");
  const [tipo, setTipo] = useState<TipoQuestao | "">("");
  const [dificuldade, setDificuldade] = useState<Dificuldade | "">("");
  const [respostaEsperada, setRespostaEsperada] = useState("");
  
  // Para múltipla escolha
  const [alternativas, setAlternativas] = useState<Array<{ id: number; texto: string; correta: boolean }>>([
    { id: 1, texto: "", correta: false },
    { id: 2, texto: "", correta: false },
  ]);
  
  // Para VouF
  const [itensVouf, setItensVouf] = useState<Array<{ id: number; item: string; verdadeiro: boolean }>>([
    { id: 1, item: "", verdadeiro: true },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!enunciado.trim()) {
        throw new Error("Enunciado é obrigatório");
      }
      if (!tema.trim()) {
        throw new Error("Tema é obrigatório");
      }
      if (!tipo) {
        throw new Error("Tipo de questão é obrigatório");
      }
      if (!dificuldade) {
        throw new Error("Dificuldade é obrigatória");
      }

      // Validações específicas por tipo
      if (tipo === "MULTIPLA_ESCOLHA") {
        const alternativasValidas = alternativas.filter(a => a.texto.trim());
        if (alternativasValidas.length < 2) {
          throw new Error("É necessário pelo menos 2 alternativas");
        }
        const temCorreta = alternativasValidas.some(a => a.correta);
        if (!temCorreta) {
          throw new Error("É necessário marcar pelo menos uma alternativa como correta");
        }
      } else if (tipo === "VOUF") {
        const itensValidos = itensVouf.filter(i => i.item.trim());
        if (itensValidos.length === 0) {
          throw new Error("É necessário adicionar pelo menos um item");
        }
      } else if (tipo === "DISSERTATIVA") {
        if (!respostaEsperada.trim()) {
          throw new Error("Resposta esperada é obrigatória para questões dissertativas");
        }
      }

      // Montar o objeto da requisição
      const request: any = {
        enunciado: enunciado.trim(),
        tema: tema.trim(),
        tipo,
        dificuldade,
        professorId,
      };

      if (tipo === "MULTIPLA_ESCOLHA") {
        const alternativasRequest: AlternativaRequest[] = alternativas
          .filter(a => a.texto.trim())
          .map(a => ({
            alternativa: a.texto.trim(),
            verdadeiro: a.correta,
          }));
        request.alternativas = alternativasRequest;
        request.itensVouf = null;
        request.respostaEsperada = null;
      } else if (tipo === "VOUF") {
        const voufRequest: VoufRequest[] = itensVouf
          .filter(i => i.item.trim())
          .map(i => ({
            item: i.item.trim(),
            verdadeiro: i.verdadeiro,
          }));
        request.itensVouf = voufRequest;
        request.alternativas = null;
        request.respostaEsperada = null;
      } else if (tipo === "DISSERTATIVA") {
        request.respostaEsperada = respostaEsperada.trim();
        request.alternativas = null;
        request.itensVouf = null;
      }

      await criarQuestao(request);

      // Limpar formulário
      setEnunciado("");
      setTema("");
      setTipo("");
      setDificuldade("");
      setRespostaEsperada("");
      setAlternativas([{ id: 1, texto: "", correta: false }, { id: 2, texto: "", correta: false }]);
      setItensVouf([{ id: 1, item: "", verdadeiro: true }]);

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar questão";
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adicionarAlternativa = () => {
    const novoId = Math.max(...alternativas.map(a => a.id), 0) + 1;
    setAlternativas([...alternativas, { id: novoId, texto: "", correta: false }]);
  };

  const removerAlternativa = (id: number) => {
    if (alternativas.length > 2) {
      setAlternativas(alternativas.filter(a => a.id !== id));
    }
  };

  const atualizarAlternativa = (id: number, campo: "texto" | "correta", valor: string | boolean) => {
    setAlternativas(
      alternativas.map(a => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  };

  const adicionarItemVouf = () => {
    const novoId = Math.max(...itensVouf.map(i => i.id), 0) + 1;
    setItensVouf([...itensVouf, { id: novoId, item: "", verdadeiro: true }]);
  };

  const removerItemVouf = (id: number) => {
    if (itensVouf.length > 1) {
      setItensVouf(itensVouf.filter(i => i.id !== id));
    }
  };

  const atualizarItemVouf = (id: number, campo: "item" | "verdadeiro", valor: string | boolean) => {
    setItensVouf(
      itensVouf.map(i => (i.id === id ? { ...i, [campo]: valor } : i))
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Nova Questão</CardTitle>
        <CardDescription>Preencha os dados da questão abaixo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enunciado */}
          <div className="space-y-2">
            <Label htmlFor="enunciado">Enunciado *</Label>
            <Textarea
              id="enunciado"
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Digite o enunciado da questão..."
              required
              rows={4}
            />
          </div>

          {/* Tema */}
          <div className="space-y-2">
            <Label htmlFor="tema">Tema *</Label>
            <Input
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Álgebra, História do Brasil, etc."
              required
            />
          </div>

          {/* Tipo de Questão */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Questão *</Label>
            <Select value={tipo} onValueChange={(value) => setTipo(value as TipoQuestao)} required>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue placeholder="Selecione o tipo de questão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLA_ESCOLHA">Múltipla Escolha</SelectItem>
                <SelectItem value="VOUF">Verdadeiro ou Falso</SelectItem>
                <SelectItem value="DISSERTATIVA">Dissertativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dificuldade */}
          <div className="space-y-2">
            <Label htmlFor="dificuldade">Dificuldade *</Label>
            <Select value={dificuldade} onValueChange={(value) => setDificuldade(value as Dificuldade)} required>
              <SelectTrigger id="dificuldade" className="w-full">
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FACIL">Fácil</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="DIFICIL">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conteúdo dinâmico baseado no tipo */}
          {tipo === "MULTIPLA_ESCOLHA" && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Alternativas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarAlternativa}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Alternativa
                </Button>
              </div>
              <div className="space-y-3">
                {alternativas.map((alt, index) => (
                  <div key={alt.id} className="flex items-start gap-3 p-3 bg-background rounded-md border">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={alt.texto}
                        onChange={(e) => atualizarAlternativa(alt.id, "texto", e.target.value)}
                        placeholder={`Alternativa ${index + 1}`}
                        required={alt.texto.trim() !== "" || alternativas.filter(a => a.texto.trim()).length < 2}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`correta-${alt.id}`}
                          checked={alt.correta}
                          onChange={(e) => atualizarAlternativa(alt.id, "correta", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`correta-${alt.id}`} className="text-sm font-normal cursor-pointer">
                          Marcar como correta
                        </Label>
                      </div>
                    </div>
                    {alternativas.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerAlternativa(alt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                * Adicione pelo menos 2 alternativas e marque pelo menos uma como correta
              </p>
            </div>
          )}

          {tipo === "VOUF" && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Itens (Afirmações)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarItemVouf}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
              <div className="space-y-3">
                {itensVouf.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-background rounded-md border">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.item}
                        onChange={(e) => atualizarItemVouf(item.id, "item", e.target.value)}
                        placeholder={`Afirmação ${index + 1}`}
                        required={item.item.trim() !== "" || itensVouf.filter(i => i.item.trim()).length === 0}
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`vouf-verdadeiro-${item.id}`}
                            name={`vouf-${item.id}`}
                            checked={item.verdadeiro === true}
                            onChange={() => atualizarItemVouf(item.id, "verdadeiro", true)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`vouf-verdadeiro-${item.id}`} className="text-sm font-normal cursor-pointer">
                            Verdadeiro
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`vouf-falso-${item.id}`}
                            name={`vouf-${item.id}`}
                            checked={item.verdadeiro === false}
                            onChange={() => atualizarItemVouf(item.id, "verdadeiro", false)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`vouf-falso-${item.id}`} className="text-sm font-normal cursor-pointer">
                            Falso
                          </Label>
                        </div>
                      </div>
                    </div>
                    {itensVouf.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItemVouf(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                * Adicione pelo menos um item e indique se cada um é Verdadeiro ou Falso
              </p>
            </div>
          )}

          {tipo === "DISSERTATIVA" && (
            <div className="space-y-2">
              <Label htmlFor="respostaEsperada">Resposta Esperada *</Label>
              <Textarea
                id="respostaEsperada"
                value={respostaEsperada}
                onChange={(e) => setRespostaEsperada(e.target.value)}
                placeholder="Digite a resposta esperada para esta questão dissertativa..."
                required
                rows={6}
              />
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Salvar Questão"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

