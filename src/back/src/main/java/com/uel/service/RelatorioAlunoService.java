package com.uel.service;

import com.uel.dto.DistribuicaoDificuldadeDTO;
import com.uel.repository.RelatorioAlunoRepository;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class RelatorioAlunoService {
    private final RelatorioAlunoRepository repository;

    public RelatorioAlunoService(RelatorioAlunoRepository repository) {
        this.repository = repository;
    }

    public List<DistribuicaoDificuldadeDTO> distribuirPorDificuldade(
            UUID alunoId,
            Integer meses,
            UUID professorId) throws SQLException {
        return repository.buscarDistribuicaoPorDificuldade(alunoId, meses, professorId);
    }
}
