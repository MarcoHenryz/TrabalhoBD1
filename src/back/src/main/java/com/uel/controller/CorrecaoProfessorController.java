package com.uel.controller;

import com.uel.dto.CorrecaoDissertativaDTO;
import com.uel.service.RespostaAlunoService;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/professores/{professorId}/correcoes")
public class CorrecaoProfessorController {
    private final RespostaAlunoService respostaAlunoService;

    public CorrecaoProfessorController(RespostaAlunoService respostaAlunoService) {
        this.respostaAlunoService = respostaAlunoService;
    }

    @GetMapping
    public List<CorrecaoDissertativaDTO> listar(
            @PathVariable UUID professorId,
            @RequestParam(defaultValue = "pendentes") String status) {
        Boolean corrigido = switch (status.toLowerCase()) {
            case "pendentes" -> false;
            case "corrigidas" -> true;
            case "todas" -> null;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido");
        };

        try {
            return respostaAlunoService.listarParaCorrecao(professorId, corrigido);
        } catch (SQLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao listar correções pendentes",
                    e);
        }
    }

    @PutMapping("/{respostaId}")
    public ResponseEntity<Void> corrigir(
            @PathVariable UUID professorId,
            @PathVariable UUID respostaId,
            @RequestBody CorrigirProfessorRequest request) {
        if (request == null || request.nota() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota é obrigatória");
        }

        try {
            respostaAlunoService.corrigirDissertativaComoProfessor(
                    respostaId,
                    professorId,
                    request.nota());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao corrigir resposta", e);
        }
    }

    public record CorrigirProfessorRequest(BigDecimal nota) {
    }
}
