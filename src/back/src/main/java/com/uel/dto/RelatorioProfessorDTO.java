package com.uel.dto;

import java.util.List;

public record RelatorioProfessorDTO(
        ResumoProfessorDTO resumo,
        List<AvaliacaoDesempenhoDTO> avaliacoes,
        List<AlunoComparativoDTO> alunos,
        List<QuestaoDesafioDTO> questoesCriticas,
        List<RankingProfessorDTO> rankingProfessores) {
}
