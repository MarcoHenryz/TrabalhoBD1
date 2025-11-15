package com.uel.controller;

import com.uel.entity.Usuario;
import com.uel.service.UsuarioService;
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
@RequestMapping("/usuarios")
public class UsuarioController {
  private final UsuarioService usuarioService;

  public UsuarioController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
  }

  @PostMapping
  public ResponseEntity<Usuario> criar(@RequestBody UsuarioRequest request) {
    validarRequest(request);
    try {
      Usuario novo = usuarioService.criar(request.email(), request.senha());
      return ResponseEntity.status(HttpStatus.CREATED).body(novo);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar usuário", e);
    }
  }

  @GetMapping
  public List<Usuario> listar() {
    try {
      return usuarioService.listarTodos();
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar usuários", e);
    }
  }

  @GetMapping("/{id}")
  public Usuario buscar(@PathVariable UUID id) {
    try {
      Usuario usuario = usuarioService.buscarPorId(id);
      if (usuario == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
      }
      return usuario;
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar usuário", e);
    }
  }

  @PutMapping("/{id}")
  public Usuario atualizar(@PathVariable UUID id, @RequestBody UsuarioRequest request) {
    validarAtualizacao(request);
    try {
      return usuarioService.atualizar(id, request.email(), request.senha());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar usuário", e);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> remover(@PathVariable UUID id) {
    try {
      usuarioService.deletar(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SQLException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao remover usuário", e);
    }
  }

  private void validarRequest(UsuarioRequest request) {
    if (request == null || request.email() == null || request.email().isBlank() || request.senha() == null || request.senha().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail e senha são obrigatórios");
    }
  }

  private void validarAtualizacao(UsuarioRequest request) {
    if (request == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição é obrigatório");
    }
    boolean emailVazio = request.email() == null || request.email().isBlank();
    boolean senhaVazia = request.senha() == null || request.senha().isBlank();
    if (emailVazio && senhaVazia) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe pelo menos e-mail ou senha para atualizar");
    }
  }

  public record UsuarioRequest(String email, String senha) {}
}
