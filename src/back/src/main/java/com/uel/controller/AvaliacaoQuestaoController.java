package com.uel.controller;

import com.uel.entity.Questao;
import com.uel.service.AvaliacaoQuestaoService;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/avaliacoes/{avaliacaoId}/questoes")
public class AvaliacaoQuestaoController {
    private final AvaliacaoQuestaoService avaliacaoQuestaoService;

    public AvaliacaoQuestaoController(AvaliacaoQuestaoService avaliacaoQuestaoService) {
        this.avaliacaoQuestaoService = avaliacaoQuestaoService;
    }

    @PostMapping
    public ResponseEntity<Void> adicionarQuestao(
            @PathVariable UUID avaliacaoId,
            @RequestBody AdicionarQuestaoRequest request) {
        validarRequest(request);

        try {
            avaliacaoQuestaoService.adicionarQuestao(
                    avaliacaoId,
                    request.questaoId(),
                    request.peso(),
                    request.ordem());
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao adicionar questão", e);
        }
    }

    @GetMapping
    public List<Questao> listarQuestoes(@PathVariable UUID avaliacaoId) {
        try {
            return avaliacaoQuestaoService.listarQuestoes(avaliacaoId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar questões", e);
        }
    }

    @DeleteMapping("/{questaoId}")
    public ResponseEntity<Void> removerQuestao(
            @PathVariable UUID avaliacaoId,
            @PathVariable UUID questaoId) {
        try {
            avaliacaoQuestaoService.removerQuestao(avaliacaoId, questaoId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover questão", e);
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> removerTodasQuestoes(@PathVariable UUID avaliacaoId) {
        try {
            avaliacaoQuestaoService.removerTodasQuestoes(avaliacaoId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover questões", e);
        }
    }

    @GetMapping("/count")
    public int contarQuestoes(@PathVariable UUID avaliacaoId) {
        try {
            return avaliacaoQuestaoService.contarQuestoes(avaliacaoId);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao contar questões", e);
        }
    }

    private void validarRequest(AdicionarQuestaoRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
        }

        if (request.questaoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da questão é obrigatório");
        }

        if (request.peso() != null && request.peso().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Peso deve ser maior que zero");
        }
    }

    // Record para Request
    public record AdicionarQuestaoRequest(
            UUID questaoId,
            BigDecimal peso, // Opcional, default 1.0
            Integer ordem // Opcional, adiciona no final
    ) {
    }
}
