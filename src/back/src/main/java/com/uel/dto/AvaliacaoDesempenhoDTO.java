package com.uel.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AvaliacaoDesempenhoDTO(
        UUID avaliacaoId,
        String descricao,
        LocalDate data,
        Double mediaNota,
        Double maiorNota,
        Double menorNota,
        int respondentes) {
}
