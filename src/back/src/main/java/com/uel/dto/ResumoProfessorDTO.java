package com.uel.dto;

public record ResumoProfessorDTO(
        int totalAvaliacoes,
        int totalAlunosImpactados,
        Double mediaGeral,
        Double melhorNota,
        Double piorNota,
        int respostasCorrigidas) {
}
