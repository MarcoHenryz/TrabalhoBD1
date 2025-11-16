package com.uel.entity;

import java.util.UUID;

public class Vouf {
    private UUID id;
    private String item;
    private Boolean verdadeiro;
    private UUID questaoId;

    public Vouf() {
    }

    public Vouf(UUID id, String item, Boolean verdadeiro, UUID questaoId) {
        this.id = id;
        this.item = item;
        this.verdadeiro = verdadeiro;
        this.questaoId = questaoId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public Boolean getVerdadeiro() {
        return verdadeiro;
    }

    public void setVerdadeiro(Boolean verdadeiro) {
        this.verdadeiro = verdadeiro;
    }

    public UUID getQuestaoId() {
        return questaoId;
    }

    public void setQuestaoId(UUID questaoId) {
        this.questaoId = questaoId;
    }
}