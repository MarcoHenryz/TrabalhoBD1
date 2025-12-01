package com.uel.dto;

import com.uel.enums.Dificuldade;

public class DistribuicaoDificuldadeDTO {
    private final Dificuldade dificuldade;
    private final int totalQuestoes;
    private final int respondidas;
    private final double percentualRespondidas;
    private final Double mediaNota;

    public DistribuicaoDificuldadeDTO(
            Dificuldade dificuldade,
            int totalQuestoes,
            int respondidas,
            Double mediaNota) {
        this.dificuldade = dificuldade;
        this.totalQuestoes = totalQuestoes;
        this.respondidas = respondidas;
        this.mediaNota = mediaNota;
        this.percentualRespondidas = totalQuestoes == 0 ? 0d : (respondidas * 100.0) / totalQuestoes;
    }

    public Dificuldade getDificuldade() {
        return dificuldade;
    }

    public int getTotalQuestoes() {
        return totalQuestoes;
    }

    public int getRespondidas() {
        return respondidas;
    }

    public double getPercentualRespondidas() {
        return percentualRespondidas;
    }

    public Double getMediaNota() {
        return mediaNota;
    }
}
