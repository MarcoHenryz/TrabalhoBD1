package com.uel.controller;

import com.uel.dto.RelatorioProfessorDTO;
import com.uel.service.RelatorioProfessorService;
import java.sql.SQLException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/relatorios/professores")
public class RelatorioProfessorController {
    private final RelatorioProfessorService relatorioProfessorService;

    public RelatorioProfessorController(RelatorioProfessorService relatorioProfessorService) {
        this.relatorioProfessorService = relatorioProfessorService;
    }

    @GetMapping("/{professorId}/painel")
    public RelatorioProfessorDTO montarPainel(
            @PathVariable UUID professorId,
            @RequestParam(required = false) Integer meses) {
        try {
            return relatorioProfessorService.montarPainel(professorId, meses);
        } catch (SQLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao gerar relatórios do professor",
                    e);
        }
    }
}
