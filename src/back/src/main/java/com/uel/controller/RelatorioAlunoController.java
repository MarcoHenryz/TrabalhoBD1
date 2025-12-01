package com.uel.controller;

import com.uel.dto.DistribuicaoDificuldadeDTO;
import com.uel.service.RelatorioAlunoService;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/relatorios/alunos")
public class RelatorioAlunoController {
    private final RelatorioAlunoService relatorioAlunoService;

    public RelatorioAlunoController(RelatorioAlunoService relatorioAlunoService) {
        this.relatorioAlunoService = relatorioAlunoService;
    }

    @GetMapping("/{alunoId}/dificuldades")
    public List<DistribuicaoDificuldadeDTO> distribuicaoPorDificuldade(
            @PathVariable UUID alunoId,
            @RequestParam(required = false) Integer meses,
            @RequestParam(required = false) UUID professorId) {
        try {
            return relatorioAlunoService.distribuirPorDificuldade(alunoId, meses, professorId);
        } catch (SQLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao consultar distribuição por dificuldade",
                    e);
        }
    }
}
