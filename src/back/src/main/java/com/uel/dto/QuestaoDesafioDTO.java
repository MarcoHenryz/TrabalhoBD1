package com.uel.dto;

import com.uel.enums.Dificuldade;
import java.util.UUID;

public record QuestaoDesafioDTO(
        UUID questaoId,
        String enunciado,
        String tema,
        Dificuldade dificuldade,
        Double mediaNota,
        int totalRespostas,
        Double percentualAcerto) {
}
