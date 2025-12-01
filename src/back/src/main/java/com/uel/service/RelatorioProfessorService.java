package com.uel.service;

import com.uel.dto.RelatorioProfessorDTO;
import com.uel.repository.RelatorioProfessorRepository;
import java.sql.SQLException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class RelatorioProfessorService {
    private final RelatorioProfessorRepository repository;

    public RelatorioProfessorService(RelatorioProfessorRepository repository) {
        this.repository = repository;
    }

    public RelatorioProfessorDTO montarPainel(UUID professorId, Integer meses) throws SQLException {
        return new RelatorioProfessorDTO(
                repository.buscarResumo(professorId, meses),
                repository.listarDesempenhoAvaliacoes(professorId, meses, 12),
                repository.rankingAlunos(professorId, meses, 8),
                repository.listarQuestoesDificeis(professorId, meses, 6),
                repository.rankingProfessores(meses, 5));
    }
}
