package com.uel.service;

import com.uel.entity.Questao;
import com.uel.repository.AvaliacaoQuestaoRepository;
import com.uel.repository.AvaliacaoRepository;
import com.uel.repository.QuestaoRepository;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvaliacaoQuestaoService {
    private final AvaliacaoQuestaoRepository avaliacaoQuestaoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final QuestaoRepository questaoRepository;

    public AvaliacaoQuestaoService(
            AvaliacaoQuestaoRepository avaliacaoQuestaoRepository,
            AvaliacaoRepository avaliacaoRepository,
            QuestaoRepository questaoRepository) {
        this.avaliacaoQuestaoRepository = avaliacaoQuestaoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.questaoRepository = questaoRepository;
    }

    @Transactional
    public void adicionarQuestao(
            UUID avaliacaoId,
            UUID questaoId,
            BigDecimal peso,
            Integer ordem) throws SQLException {
        if (avaliacaoRepository.buscarPorId(avaliacaoId) == null) {
            throw new IllegalArgumentException("Avaliação não encontrada");
        }

        if (questaoRepository.buscarPorId(questaoId) == null) {
            throw new IllegalArgumentException("Questão não encontrada");
        }

        if (avaliacaoQuestaoRepository.questaoJaAdicionada(avaliacaoId, questaoId)) {
            throw new IllegalArgumentException("Questão já adicionada à avaliação");
        }

        if (peso == null || peso.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Peso deve ser maior que zero");
        }

        if (ordem == null) {
            int total = avaliacaoQuestaoRepository.contarQuestoesPorAvaliacao(avaliacaoId);
            ordem = total + 1;
        }

        avaliacaoQuestaoRepository.adicionar(avaliacaoId, questaoId, peso, ordem);
    }

    public List<Questao> listarQuestoes(UUID avaliacaoId) throws SQLException {
        if (avaliacaoRepository.buscarPorId(avaliacaoId) == null) {
            throw new IllegalArgumentException("Avaliação não encontrada");
        }

        return avaliacaoQuestaoRepository.listarQuestoesPorAvaliacao(avaliacaoId);
    }

    @Transactional
    public void removerQuestao(UUID avaliacaoId, UUID questaoId) throws SQLException {
        if (avaliacaoRepository.buscarPorId(avaliacaoId) == null) {
            throw new IllegalArgumentException("Avaliação não encontrada");
        }

        if (!avaliacaoQuestaoRepository.questaoJaAdicionada(avaliacaoId, questaoId)) {
            throw new IllegalArgumentException("Questão não está na avaliação");
        }

        avaliacaoQuestaoRepository.remover(avaliacaoId, questaoId);
    }

    @Transactional
    public void removerTodasQuestoes(UUID avaliacaoId) throws SQLException {
        if (avaliacaoRepository.buscarPorId(avaliacaoId) == null) {
            throw new IllegalArgumentException("Avaliação não encontrada");
        }

        avaliacaoQuestaoRepository.removerTodasPorAvaliacao(avaliacaoId);
    }

    public int contarQuestoes(UUID avaliacaoId) throws SQLException {
        return avaliacaoQuestaoRepository.contarQuestoesPorAvaliacao(avaliacaoId);
    }
}