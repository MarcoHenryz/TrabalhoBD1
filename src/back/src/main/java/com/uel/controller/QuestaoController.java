package com.uel.controller;

import com.uel.entity.Questao;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;
import com.uel.service.QuestaoService;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/questoes")
public class QuestaoController {
    private final QuestaoService questaoService;

    public QuestaoController(QuestaoService questaoService) {
        this.questaoService = questaoService;
    }

    @PostMapping
    public ResponseEntity<Questao> criar(@RequestBody QuestaoRequest request) {
        validarCriacao(request);
        try {
            Questao questao = questaoService.criar(
                    request.enunciado(),
                    request.tema(),
                    request.tipo(),
                    request.dificuldade(),
                    request.respostaEsperada(),
                    request.professorId(),
                    request.alternativas(),
                    request.itensVouf());
            return ResponseEntity.status(HttpStatus.CREATED).body(questao);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar questão", e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @GetMapping
    public List<Questao> listar() {
        try {
            return questaoService.listarTodas();
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar questões", e);
        }
    }

    @GetMapping("/{id}")
    public Questao buscar(@PathVariable UUID id) {
        try {
            Questao questao = questaoService.buscarPorId(id);
            if (questao == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Questão não encontrada");
            }
            return questao;
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar questão", e);
        }
    }

    @GetMapping("/{id}/alternativas")
    public List<AlternativaResponse> buscarAlternativas(@PathVariable UUID id) {
        try {
            return questaoService.buscarAlternativasPorQuestaoId(id);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar alternativas", e);
        }
    }

    @GetMapping("/{id}/itens-vouf")
    public List<VoufResponse> buscarItensVouf(@PathVariable UUID id) {
        try {
            return questaoService.buscarItensVoufPorQuestaoId(id);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar itens VouF", e);
        }
    }

    @PutMapping("/{id}")
    public Questao atualizar(@PathVariable UUID id, @RequestBody QuestaoRequest request) {
        validarAtualizacao(request);
        try {
            return questaoService.atualizar(
                    id,
                    request.enunciado(),
                    request.tema(),
                    request.tipo(),
                    request.dificuldade(),
                    request.respostaEsperada(),
                    request.alternativas(),
                    request.itensVouf());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar questão", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        try {
            questaoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover questão", e);
        }
    }

    private void validarCriacao(QuestaoRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
        }

        if (request.enunciado() == null || request.enunciado().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enunciado é obrigatório");
        }

        if (request.tema() == null || request.tema().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tema é obrigatório");
        }

        if (request.tipo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo da questão é obrigatório");
        }

        if (request.dificuldade() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dificuldade é obrigatória");
        }

        if (request.professorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do professor é obrigatório");
        }
    }

    private void validarAtualizacao(QuestaoRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
        }

        boolean enunciadoVazio = request.enunciado() == null || request.enunciado().isBlank();
        boolean temaVazio = request.tema() == null || request.tema().isBlank();
        boolean tipoNulo = request.tipo() == null;
        boolean dificuldadeNula = request.dificuldade() == null;
        boolean alternativasNulas = request.alternativas() == null;
        boolean itensVoufNulos = request.itensVouf() == null;

        if (enunciadoVazio && temaVazio && tipoNulo && dificuldadeNula && alternativasNulas && itensVoufNulos) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe algum campo para atualizar");
        }
    }

    public record QuestaoRequest(
            String enunciado,
            String tema,
            TipoQuestao tipo,
            Dificuldade dificuldade,
            String respostaEsperada,
            UUID professorId,
            List<AlternativaRequest> alternativas,
            List<VoufRequest> itensVouf) {
    }

    public record AlternativaRequest(
            String alternativa,
            Boolean verdadeiro) {
    }

    public record VoufRequest(
            String item,
            Boolean verdadeiro) {
    }

    public record AlternativaResponse(
            UUID id,
            String alternativa,
            Boolean verdadeiro) {
    }

    public record VoufResponse(
            UUID id,
            String item,
            Boolean verdadeiro) {
    }
}
