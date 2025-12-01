package com.uel.controller;

import com.uel.dto.ProvaTutorDTO;
import com.uel.entity.Professor;
import com.uel.service.ProfessorService;
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
@RequestMapping("/professores")
public class ProfessorController {
    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @PostMapping
    public ResponseEntity<Professor> criar(@RequestBody ProfessorRequest request) {
        validarCriacao(request);
        try {
            Professor professor = professorService.criar(request.area(), request.usuarioId());
            return ResponseEntity.status(HttpStatus.CREATED).body(professor);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar professor", e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @GetMapping
  public List<Professor> listar() {
    try {
      return professorService.listarTodos();
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar professores", e);
    }
  }

  @GetMapping("/aluno/{alunoId}")
  public List<Professor> listarPorAluno(@PathVariable UUID alunoId) {
    try {
      return professorService.listarPorAluno(alunoId);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar tutores do aluno", e);
    }
  }

  @GetMapping("/aluno/{alunoId}/provas")
  public List<ProvaTutorDTO> listarTutoriasDoAluno(@PathVariable UUID alunoId) {
    try {
      return professorService.listarProvasComTutor(alunoId);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar tutores e provas do aluno", e);
    }
  }

  @GetMapping("/{id}")
  public Professor buscar(@PathVariable UUID id) {
    try {
      Professor professor = professorService.buscarPorId(id);
      if (professor == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado");
            }
            return professor;
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar professor", e);
        }
    }

    @PutMapping("/{id}")
    public Professor atualizar(@PathVariable UUID id, @RequestBody ProfessorRequest request) {
        validarAtualizacao(request);
        try {
            return professorService.atualizar(id, request.area());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar professor", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        try {
            professorService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SQLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover professor", e);
        }
    }

    private void validarCriacao(ProfessorRequest request) {
        boolean usuarioInvalido = request == null || request.usuarioId() == null;
        boolean areaInvalida = request == null || request.area() == null || request.area().isBlank();

        if (usuarioInvalido || areaInvalida) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Área e usuário são obrigatórios");
        }
    }

    private void validarAtualizacao(ProfessorRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
        }

        boolean areaVazia = request.area() == null || request.area().isBlank();

        if (areaVazia) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a área para atualizar");
        }
    }

    public record ProfessorRequest(String area, UUID usuarioId) {
    }
}
