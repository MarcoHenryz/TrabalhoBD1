package com.uel.dto;

import java.util.UUID;

public record AlunoComparativoDTO(
        UUID alunoId,
        String matricula,
        String email,
        Double media,
        Double melhorNota,
        Double piorNota,
        int avaliacoesRespondidas) {
}
