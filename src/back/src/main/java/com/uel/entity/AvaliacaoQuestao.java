package com.uel.entity;

import java.math.BigDecimal;
import java.util.UUID;

public class AvaliacaoQuestao {
    private UUID avaliacaoId;
    private UUID questaoId;
    private BigDecimal peso;
    private Integer ordem;

    public AvaliacaoQuestao() {
    }

    public AvaliacaoQuestao(UUID avaliacaoId, UUID questaoId, BigDecimal peso, Integer ordem) {
        this.avaliacaoId = avaliacaoId;
        this.questaoId = questaoId;
        this.peso = peso;
        this.ordem = ordem;
    }

    public UUID getAvaliacaoId() {
        return avaliacaoId;
    }

    public void setAvaliacaoId(UUID avaliacaoId) {
        this.avaliacaoId = avaliacaoId;
    }

    public UUID getQuestaoId() {
        return questaoId;
    }

    public void setQuestaoId(UUID questaoId) {
        this.questaoId = questaoId;
    }

    public BigDecimal getPeso() {
        return peso;
    }

    public void setPeso(BigDecimal peso) {
        this.peso = peso;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
}
