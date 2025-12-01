package com.uel.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CorrecaoDissertativaDTO(
        UUID respostaId,
        UUID avaliacaoId,
        String avaliacaoDescricao,
        LocalDate avaliacaoData,
        UUID alunoId,
        String alunoMatricula,
        String alunoEmail,
        UUID questaoId,
        String tema,
        String enunciado,
        String respostaTexto,
        Double nota,
        Boolean corrigido) {
}
