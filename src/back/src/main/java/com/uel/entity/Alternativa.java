package com.uel.entity;

import java.util.UUID;

public class Alternativa {
    private UUID id;
    private UUID questaoId;
    private String alternativa;
    private Boolean verdadeiro;

    public Alternativa() {
    }

    public Alternativa(UUID id, UUID questaoId, String alternativa, Boolean verdadeiro) {
        this.id = id;
        this.questaoId = questaoId;
        this.alternativa = alternativa;
        this.verdadeiro = verdadeiro;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuestaoId() {
        return questaoId;
    }

    public void setQuestaoId(UUID questaoId) {
        this.questaoId = questaoId;
    }

    public String getAlternativa() {
        return alternativa;
    }

    public void setAlternativa(String alternativa) {
        this.alternativa = alternativa;
    }

    public Boolean getVerdadeiro() {
        return verdadeiro;
    }

    public void setVerdadeiro(Boolean verdadeiro) {
        this.verdadeiro = verdadeiro;
    }
}