package com.uel.service;

import com.uel.entity.Questao;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;
import com.uel.repository.AlternativaRepository;
import com.uel.repository.QuestaoRepository;
import com.uel.repository.VoufRepository;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.uel.controller.QuestaoController.AlternativaRequest;
import com.uel.controller.QuestaoController.VoufRequest;

@Service
public class QuestaoService {
    private final QuestaoRepository questaoRepository;
    private final AlternativaRepository alternativaRepository;
    private final VoufRepository voufRepository;

    public QuestaoService(
            QuestaoRepository questaoRepository,
            AlternativaRepository alternativaRepository,
            VoufRepository voufRepository) {
        this.questaoRepository = questaoRepository;
        this.alternativaRepository = alternativaRepository;
        this.voufRepository = voufRepository;
    }

    @Transactional
    public Questao criar(
            String enunciado,
            String tema,
            TipoQuestao tipo,
            Dificuldade dificuldade,
            String respostaEsperada,
            UUID professorId,
            List<AlternativaRequest> alternativasRequest,
            List<VoufRequest> itensVoufRequest) throws SQLException {
        // Validar questão baseado no tipo
        validarQuestao(tipo, alternativasRequest, itensVoufRequest);

        // Criar questão
        Questao questao = new Questao();
        questao.setId(UUID.randomUUID());
        questao.setEnunciado(enunciado);
        questao.setTema(tema);
        questao.setTipo(tipo);
        questao.setDificuldade(dificuldade);
        questao.setRespostaEsperada(respostaEsperada);
        questao.setProfessorId(professorId);

        questaoRepository.criar(questao);

        switch (tipo) {
            case MULTIPLA_ESCOLHA:
                criarAlternativas(questao.getId(), alternativasRequest);
                break;

            case VOUF:
                criarItensVouf(questao.getId(), itensVoufRequest);
                break;

            case DISSERTATIVA:
                break;
        }

        return questao;
    }

    public List<Questao> listarTodas() throws SQLException {
        return questaoRepository.listarTodas();
    }

    public Questao buscarPorId(UUID id) throws SQLException {
        return questaoRepository.buscarPorId(id);
    }

    public List<com.uel.controller.QuestaoController.AlternativaResponse> buscarAlternativasPorQuestaoId(UUID questaoId) throws SQLException {
        List<com.uel.entity.Alternativa> alternativas = alternativaRepository.buscarPorQuestaoId(questaoId);
        return alternativas.stream()
                .map(alt -> new com.uel.controller.QuestaoController.AlternativaResponse(
                        alt.getId(),
                        alt.getAlternativa(),
                        alt.getVerdadeiro()))
                .toList();
    }

    public List<com.uel.controller.QuestaoController.VoufResponse> buscarItensVoufPorQuestaoId(UUID questaoId) throws SQLException {
        List<com.uel.entity.Vouf> itens = voufRepository.buscarPorQuestaoId(questaoId);
        return itens.stream()
                .map(item -> new com.uel.controller.QuestaoController.VoufResponse(
                        item.getId(),
                        item.getItem(),
                        item.getVerdadeiro()))
                .toList();
    }

    @Transactional
    public Questao atualizar(
            UUID id,
            String enunciado,
            String tema,
            TipoQuestao tipo,
            Dificuldade dificuldade,
            String respostaEsperada,
            List<AlternativaRequest> alternativasRequest,
            List<VoufRequest> itensVoufRequest) throws SQLException {
        Questao existente = questaoRepository.buscarPorId(id);
        if (existente == null) {
            throw new IllegalArgumentException("Questão não encontrada");
        }

        // Atualizar campos da questão
        if (enunciado != null && !enunciado.isBlank()) {
            existente.setEnunciado(enunciado);
        }
        if (tema != null && !tema.isBlank()) {
            existente.setTema(tema);
        }
        if (tipo != null) {
            existente.setTipo(tipo);
        }
        if (dificuldade != null) {
            existente.setDificuldade(dificuldade);
        }
        if (respostaEsperada != null) {
            existente.setRespostaEsperada(respostaEsperada);
        }

        // Validar nova estrutura se tipo mudou
        TipoQuestao tipoFinal = tipo != null ? tipo : existente.getTipo();
        if (alternativasRequest != null || itensVoufRequest != null) {
            validarQuestao(tipoFinal, alternativasRequest, itensVoufRequest);
        }

        questaoRepository.atualizar(existente);

        // Se alterou itens, recriar
        if (alternativasRequest != null || itensVoufRequest != null) {
            // Deletar itens antigos
            alternativaRepository.deletarPorQuestaoId(id);
            voufRepository.deletarPorQuestaoId(id);

            // Criar novos itens conforme o tipo
            switch (tipoFinal) {
                case MULTIPLA_ESCOLHA:
                    if (alternativasRequest != null) {
                        criarAlternativas(id, alternativasRequest);
                    }
                    break;

                case VOUF:
                    if (itensVoufRequest != null) {
                        criarItensVouf(id, itensVoufRequest);
                    }
                    break;

                case DISSERTATIVA:

                    break;
            }
        }

        return existente;
    }

    @Transactional
    public void deletar(UUID id) throws SQLException {
        Questao existente = questaoRepository.buscarPorId(id);
        if (existente == null) {
            throw new IllegalArgumentException("Questão não encontrada");
        }

        // Alternativas e itens VOUF são deletados automaticamente pelo CASCADE
        boolean removido = questaoRepository.deletar(id);
        if (!removido) {
            throw new IllegalArgumentException("Questão não encontrada");
        }
    }

    private void criarAlternativas(UUID questaoId, List<AlternativaRequest> alternativas) throws SQLException {
        for (AlternativaRequest altReq : alternativas) {
            alternativaRepository.criar(questaoId, altReq.alternativa(), altReq.verdadeiro());
        }
    }

    private void criarItensVouf(UUID questaoId, List<VoufRequest> itens) throws SQLException {
        for (VoufRequest itemReq : itens) {
            voufRepository.criar(questaoId, itemReq.item(), itemReq.verdadeiro());
        }
    }

    private void validarQuestao(
            TipoQuestao tipo,
            List<AlternativaRequest> alternativas,
            List<VoufRequest> itensVouf) {
        switch (tipo) {
            case MULTIPLA_ESCOLHA:
                validarMultiplaEscolha(alternativas);
                break;

            case VOUF:
                validarVouf(itensVouf);
                break;

            case DISSERTATIVA:
                validarDissertativa(alternativas, itensVouf);
                break;
        }
    }

    private void validarMultiplaEscolha(List<AlternativaRequest> alternativas) {
        if (alternativas == null || alternativas.isEmpty()) {
            throw new IllegalArgumentException("Questão de múltipla escolha deve ter alternativas");
        }

        if (alternativas.size() < 2) {
            throw new IllegalArgumentException("Questão de múltipla escolha deve ter pelo menos 2 alternativas");
        }

        long corretas = alternativas.stream()
                .filter(alt -> alt.verdadeiro() != null && alt.verdadeiro())
                .count();

        if (corretas != 1) {
            throw new IllegalArgumentException("Questão de múltipla escolha deve ter exatamente 1 alternativa correta");
        }
    }

    private void validarVouf(List<VoufRequest> itensVouf) {
        if (itensVouf == null || itensVouf.isEmpty()) {
            throw new IllegalArgumentException("Questão V ou F deve ter pelo menos 1 item");
        }

        // Validar que todos os itens têm afirmação e valor V/F
        for (VoufRequest item : itensVouf) {
            if (item.item() == null || item.item().isBlank()) {
                throw new IllegalArgumentException("Todos os itens devem ter uma afirmação");
            }
            if (item.verdadeiro() == null) {
                throw new IllegalArgumentException("Todos os itens devem ter o valor verdadeiro/falso definido");
            }
        }
    }

    private void validarDissertativa(List<AlternativaRequest> alternativas, List<VoufRequest> itensVouf) {
        if ((alternativas != null && !alternativas.isEmpty()) ||
                (itensVouf != null && !itensVouf.isEmpty())) {
            throw new IllegalArgumentException("Questão dissertativa não deve ter alternativas ou itens");
        }
    }

}
