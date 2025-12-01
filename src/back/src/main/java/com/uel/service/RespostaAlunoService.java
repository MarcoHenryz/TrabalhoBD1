package com.uel.service;

import com.uel.entity.Alternativa;
import com.uel.entity.Questao;
import com.uel.entity.RespostaAluno;
import com.uel.entity.Vouf;
import com.uel.enums.TipoQuestao;
import com.uel.repository.AlternativaRepository;
import com.uel.repository.QuestaoRepository;
import com.uel.repository.RespostaAlunoRepository;
import com.uel.repository.VoufRepository;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RespostaAlunoService {
    private final RespostaAlunoRepository respostaAlunoRepository;
    private final QuestaoRepository questaoRepository;
    private final AlternativaRepository alternativaRepository;
    private final VoufRepository voufRepository;

    public RespostaAlunoService(
            RespostaAlunoRepository respostaAlunoRepository,
            QuestaoRepository questaoRepository,
            AlternativaRepository alternativaRepository,
            VoufRepository voufRepository) {
        this.respostaAlunoRepository = respostaAlunoRepository;
        this.questaoRepository = questaoRepository;
        this.alternativaRepository = alternativaRepository;
        this.voufRepository = voufRepository;
    }

    @Transactional
    public RespostaAluno responderQuestao(
            UUID avaliacaoId,
            UUID alunoId,
            UUID questaoId,
            UUID alternativaEscolhidaId,
            UUID voufItemId,
            Boolean voufResposta,
            String respostaTexto) throws SQLException {
        if (respostaAlunoRepository.jaRespondeu(avaliacaoId, alunoId, questaoId)) {
            throw new IllegalArgumentException("Questão já foi respondida");
        }

        Questao questao = questaoRepository.buscarPorId(questaoId);
        if (questao == null) {
            throw new IllegalArgumentException("Questão não encontrada");
        }

        RespostaAluno resposta = new RespostaAluno();
        resposta.setId(UUID.randomUUID());
        resposta.setAvaliacaoId(avaliacaoId);
        resposta.setAlunoId(alunoId);
        resposta.setQuestaoId(questaoId);
        resposta.setRespondidoEm(LocalDateTime.now());
        resposta.setCorrigido(false);

        switch (questao.getTipo()) {
            case MULTIPLA_ESCOLHA:
                if (alternativaEscolhidaId == null) {
                    throw new IllegalArgumentException("Alternativa deve ser informada para múltipla escolha");
                }
                resposta.setAlternativaEscolhidaId(alternativaEscolhidaId);
                break;

            case VOUF:
                if (voufItemId == null || voufResposta == null) {
                    throw new IllegalArgumentException("Item e resposta devem ser informados para V/F");
                }
                resposta.setVoufItemId(voufItemId);
                resposta.setVoufResposta(voufResposta);
                break;

            case DISSERTATIVA:
                if (respostaTexto == null || respostaTexto.isBlank()) {
                    throw new IllegalArgumentException("Resposta em texto deve ser informada para dissertativa");
                }
                resposta.setRespostaTexto(respostaTexto);
                break;
        }

        respostaAlunoRepository.criar(resposta);

        if (questao.getTipo() == TipoQuestao.MULTIPLA_ESCOLHA ||
                questao.getTipo() == TipoQuestao.VOUF) {
            corrigirAutomaticamente(resposta, questao);
        }

        return resposta;
    }

    @Transactional
    public void corrigirAutomaticamente(RespostaAluno resposta, Questao questao) throws SQLException {
        BigDecimal nota = BigDecimal.ZERO;

        switch (questao.getTipo()) {
            case MULTIPLA_ESCOLHA:
                List<Alternativa> alternativas = alternativaRepository.buscarPorQuestaoId(questao.getId());
                Alternativa escolhida = alternativas.stream()
                        .filter(alt -> alt.getId().equals(resposta.getAlternativaEscolhidaId()))
                        .findFirst()
                        .orElse(null);

                if (escolhida != null && escolhida.getVerdadeiro()) {
                    nota = BigDecimal.ONE;
                }
                break;

            case VOUF:
                Vouf itemCorreto = voufRepository.buscarPorId(resposta.getVoufItemId());

                if (itemCorreto != null &&
                        itemCorreto.getVerdadeiro().equals(resposta.getVoufResposta())) {
                    nota = BigDecimal.ONE;
                }
                break;

            case DISSERTATIVA:
                return;
        }

        resposta.setNota(nota);
        resposta.setCorrigido(true);
        respostaAlunoRepository.atualizar(resposta);
    }

    @Transactional
    public void corrigirDissertativa(UUID respostaId, BigDecimal nota) throws SQLException {
        RespostaAluno resposta = respostaAlunoRepository.buscarPorId(respostaId);

        if (resposta == null) {
            throw new IllegalArgumentException("Resposta não encontrada");
        }

        Questao questao = questaoRepository.buscarPorId(resposta.getQuestaoId());
        if (questao.getTipo() != TipoQuestao.DISSERTATIVA) {
            throw new IllegalArgumentException("Apenas questões dissertativas podem ser corrigidas manualmente");
        }

        if (nota == null || nota.compareTo(BigDecimal.ZERO) < 0 || nota.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("Nota deve estar entre 0 e 1");
        }

        resposta.setNota(nota);
        resposta.setCorrigido(true);
        respostaAlunoRepository.atualizar(resposta);
    }

    public List<RespostaAluno> listarRespostasAluno(UUID avaliacaoId, UUID alunoId) throws SQLException {
        return respostaAlunoRepository.buscarPorAvaliacaoEAluno(avaliacaoId, alunoId);
    }

    public RespostaAluno buscarPorId(UUID id) throws SQLException {
        return respostaAlunoRepository.buscarPorId(id);
    }

    public BigDecimal calcularNotaFinal(UUID avaliacaoId, UUID alunoId) throws SQLException {
        List<RespostaAluno> respostas = respostaAlunoRepository.buscarPorAvaliacaoEAluno(
                avaliacaoId, alunoId);

        BigDecimal notaTotal = BigDecimal.ZERO;
        int questoesCorrigidas = 0;

        for (RespostaAluno r : respostas) {
            if (r.getCorrigido() && r.getNota() != null) {
                notaTotal = notaTotal.add(r.getNota());
                questoesCorrigidas++;
            }
        }

        if (questoesCorrigidas == 0) {
            return BigDecimal.ZERO;
        }

        return notaTotal.divide(
                BigDecimal.valueOf(questoesCorrigidas),
                2,
                java.math.RoundingMode.HALF_UP).multiply(BigDecimal.TEN);
    }
}
