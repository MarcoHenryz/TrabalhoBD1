package com.uel.controller;

import com.uel.entity.Aluno;
import com.uel.service.AlunoService;
import java.sql.SQLException;
import java.time.LocalDate;
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
@RequestMapping("/alunos")
public class AlunoController {
  private final AlunoService alunoService;

  public AlunoController(AlunoService alunoService) {
    this.alunoService = alunoService;
  }

  @PostMapping
  public ResponseEntity<Aluno> criar(@RequestBody AlunoRequest request) {
    validarCriacao(request);
    try {
      Aluno aluno = alunoService.criar(request.matricula(), request.dataInicio(), request.dataConclusao(), request.usuarioId());
      return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar aluno", e);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  @GetMapping
  public List<Aluno> listar() {
    try {
      return alunoService.listarTodos();
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar alunos", e);
    }
  }

  @GetMapping("/{id}")
  public Aluno buscar(@PathVariable UUID id) {
    try {
      Aluno aluno = alunoService.buscarPorId(id);
      if (aluno == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado");
      }
      return aluno;
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar aluno", e);
    }
  }

  @PutMapping("/{id}")
  public Aluno atualizar(@PathVariable UUID id, @RequestBody AlunoRequest request) {
    validarAtualizacao(request);
    try {
      return alunoService.atualizar(id, request.matricula(), request.dataInicio(), request.dataConclusao());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar aluno", e);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> remover(@PathVariable UUID id) {
    try {
      alunoService.deletar(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover aluno", e);
    }
  }

  private void validarCriacao(AlunoRequest request) {
    boolean usuarioInvalido = request == null || request.usuarioId() == null;
    boolean matriculaInvalida = request == null || request.matricula() == null || request.matricula().isBlank();
    boolean dataInicioInvalida = request == null || request.dataInicio() == null;
    if (usuarioInvalido || matriculaInvalida || dataInicioInvalida) {
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Matrícula, data de início e usuário são obrigatórios"
      );
    }
  }

  private void validarAtualizacao(AlunoRequest request) {
    if (request == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
    }
    boolean matriculaVazia = request.matricula() == null || request.matricula().isBlank();
    boolean dataInicioNula = request.dataInicio() == null;
    boolean dataConclusaoNula = request.dataConclusao() == null;
    if (matriculaVazia && dataInicioNula && dataConclusaoNula) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe algum campo para atualizar");
    }
  }

  public record AlunoRequest(String matricula, LocalDate dataInicio, LocalDate dataConclusao, UUID usuarioId) {}
}
