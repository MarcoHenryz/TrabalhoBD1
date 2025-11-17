package com.uel.controller;

import com.uel.entity.RespostaAluno;
import com.uel.service.RespostaAlunoService;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/respostas")
public class RespostaAlunoController {
    private final RespostaAlunoService respostaAlunoService;

    public RespostaAlunoController(RespostaAlunoService respostaAlunoService) {
        this.respostaAlunoService = respostaAlunoService;
    }

    @PostMapping
    public ResponseEntity<RespostaAluno> responderQuestao(@RequestBody ResponderQuestaoRequest request) {
        validarResposta(request);

        try {
            RespostaAluno resposta = respostaAlunoService.responderQuestao(
                    request.avaliacaoId(),
                    request.alunoId(),
                    request.questaoId(),
                    request.alternativaEscolhidaId(),
                    request.voufItemId(),
                    request.voufResposta(),
                    request.respostaTexto());
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao responder questão", e);
        }
    }

    @GetMapping("/avaliacao/{avaliacaoId}/aluno/{alunoId}")
    public List<RespostaAluno> listarRespostasAluno(
            @PathVariable UUID avaliacaoId,
            @PathVariable UUID alunoId) {
        try {
            return respostaAlunoService.listarRespostasAluno(avaliacaoId, alunoId);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar respostas", e);
        }
    }

    @GetMapping("/{id}")
    public RespostaAluno buscarPorId(@PathVariable UUID id) {
        try {
            RespostaAluno resposta = respostaAlunoService.buscarPorId(id);
            if (resposta == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resposta não encontrada");
            }
            return resposta;
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar resposta", e);
        }
    }

    @PutMapping("/{id}/corrigir")
    public ResponseEntity<Void> corrigirDissertativa(
            @PathVariable UUID id,
            @RequestBody CorrigirRespostaRequest request) {
        if (request == null || request.nota() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota é obrigatória");
        }

        try {
            respostaAlunoService.corrigirDissertativa(id, request.nota());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao corrigir resposta", e);
        }
    }

    @GetMapping("/avaliacao/{avaliacaoId}/aluno/{alunoId}/nota-final")
    public BigDecimal calcularNotaFinal(
            @PathVariable UUID avaliacaoId,
            @PathVariable UUID alunoId) {
        try {
            return respostaAlunoService.calcularNotaFinal(avaliacaoId, alunoId);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao calcular nota", e);
        }
    }

    private void validarResposta(ResponderQuestaoRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
        }

        if (request.avaliacaoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da avaliação é obrigatório");
        }

        if (request.alunoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do aluno é obrigatório");
        }

        if (request.questaoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da questão é obrigatório");
        }

        boolean temResposta = request.alternativaEscolhidaId() != null ||
                (request.voufItemId() != null && request.voufResposta() != null) ||
                (request.respostaTexto() != null && !request.respostaTexto().isBlank());

        if (!temResposta) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resposta deve ser fornecida");
        }
    }

    public record ResponderQuestaoRequest(
            UUID avaliacaoId,
            UUID alunoId,
            UUID questaoId,
            UUID alternativaEscolhidaId,
            UUID voufItemId,
            Boolean voufResposta,
            String respostaTexto) {
    }

    public record CorrigirRespostaRequest(
            BigDecimal nota) {
    }
}