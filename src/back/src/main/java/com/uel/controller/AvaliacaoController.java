package com.uel.controller;

import com.uel.entity.Avaliacao;
import com.uel.entity.AvaliacaoParticipacao;
import com.uel.service.AvaliacaoService;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
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
@RequestMapping("/avaliacoes")
public class AvaliacaoController {
  private final AvaliacaoService avaliacaoService;

  public AvaliacaoController(AvaliacaoService avaliacaoService) {
    this.avaliacaoService = avaliacaoService;
  }

  @PostMapping
  public ResponseEntity<Avaliacao> criar(@RequestBody AvaliacaoRequest request) {
    validarCriacao(request);
    try {
      Avaliacao avaliacao = avaliacaoService.criar(
          request.descricao(),
          request.data(),
          request.horario(),
          converterParticipacoes(request.participantes()));
      return ResponseEntity.status(HttpStatus.CREATED).body(avaliacao);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar avaliação", e);
    }
  }

  @GetMapping
  public List<Avaliacao> listar() {
    try {
      return avaliacaoService.listarTodas();
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar avaliações", e);
    }
  }

  @GetMapping("/aluno/{alunoId}")
  public List<Avaliacao> listarPorAluno(@PathVariable UUID alunoId) {
    try {
      return avaliacaoService.listarPorAluno(alunoId);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar avaliações do aluno", e);
    }
  }

  @GetMapping("/{id}")
  public Avaliacao buscar(@PathVariable UUID id) {
    try {
      Avaliacao avaliacao = avaliacaoService.buscarPorId(id);
      if (avaliacao == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada");
      }
      return avaliacao;
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar avaliação", e);
    }
  }

  @PutMapping("/{id}")
  public Avaliacao atualizar(@PathVariable UUID id, @RequestBody AvaliacaoRequest request) {
    validarAtualizacao(request);
    try {
      return avaliacaoService.atualizar(
          id,
          request.descricao(),
          request.data(),
          request.horario(),
          converterParticipacoes(request.participantes()));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar avaliação", e);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> remover(@PathVariable UUID id) {
    try {
      avaliacaoService.deletar(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover avaliação", e);
    }
  }

  @PostMapping("/{id}/alunos")
  public ResponseEntity<Void> associarAluno(
      @PathVariable UUID id,
      @RequestBody AssociarAlunoRequest request) {
    if (request == null || request.alunoId() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do aluno é obrigatório");
    }

    try {
      avaliacaoService.associarAluno(id, request.alunoId());
      return ResponseEntity.status(HttpStatus.CREATED).build();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao associar aluno", e);
    }
  }

  @DeleteMapping("/{id}/alunos/{alunoId}")
  public ResponseEntity<Void> desassociarAluno(
      @PathVariable UUID id,
      @PathVariable UUID alunoId) {
    try {
      avaliacaoService.desassociarAluno(id, alunoId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao desassociar aluno", e);
    }
  }

  private void validarCriacao(AvaliacaoRequest request) {
    if (request == null || request.descricao() == null || request.descricao().isBlank() || request.data() == null
        || request.horario() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Descrição, data e horário são obrigatórios");
    }
  }

  private void validarAtualizacao(AvaliacaoRequest request) {
    if (request == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
    }
    boolean descricaoVazia = request.descricao() == null || request.descricao().isBlank();
    boolean dataNula = request.data() == null;
    boolean horarioNulo = request.horario() == null;
    boolean participantesNulos = request.participantes() == null;
    if (descricaoVazia && dataNula && horarioNulo && participantesNulos) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe algum campo para atualizar");
    }
  }

  private List<AvaliacaoParticipacao> converterParticipacoes(List<ParticipacaoRequest> participantes) {
    if (participantes == null) {
      return null;
    }
    List<AvaliacaoParticipacao> participacoes = new ArrayList<>();
    for (ParticipacaoRequest participante : participantes) {
      AvaliacaoParticipacao participacao = new AvaliacaoParticipacao();
      participacao.setAlunoId(participante.alunoId());
      participacao.setNota(participante.nota());
      participacoes.add(participacao);
    }
    return participacoes;
  }

  public record AvaliacaoRequest(
      String descricao,
      LocalDate data,
      LocalTime horario,
      List<ParticipacaoRequest> participantes) {
  }

  public record ParticipacaoRequest(UUID alunoId, BigDecimal nota) {
  }

  public record AssociarAlunoRequest(UUID alunoId) {
  }
}
