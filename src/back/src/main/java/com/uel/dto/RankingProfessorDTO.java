package com.uel.dto;

import java.util.UUID;

public record RankingProfessorDTO(
        UUID professorId,
        String nome,
        String email,
        String area,
        Double mediaAcertos,
        int respostasCorrigidas) {
}
