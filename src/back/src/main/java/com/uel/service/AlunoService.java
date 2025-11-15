package com.uel.service;

import com.uel.entity.Aluno;
import com.uel.entity.Usuario;
import com.uel.repository.AlunoRepository;
import com.uel.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
  public class AlunoService {
  private final AlunoRepository repository;
  private final UsuarioRepository usuarioRepository;

  public AlunoService(AlunoRepository repository, UsuarioRepository usuarioRepository) {
    this.repository = repository;
    this.usuarioRepository = usuarioRepository;
  }

  public Aluno criar(String matricula, LocalDate dataInicio, LocalDate dataConclusao, UUID usuarioId) throws SQLException {
    Usuario usuario = usuarioRepository.buscarPorId(usuarioId);
    if (usuario == null) {
      throw new IllegalArgumentException("Usuário informado não existe");
    }

    Aluno existente = repository.buscarPorUsuarioId(usuarioId);
    if (existente != null) {
      throw new IllegalArgumentException("Usuário já está vinculado a um aluno");
    }

    Aluno aluno = new Aluno(UUID.randomUUID(), matricula, BigDecimal.ZERO.setScale(2), dataInicio, dataConclusao, usuario);
    repository.criar(aluno);
    return aluno;
  }

  public List<Aluno> listarTodos() throws SQLException {
    return repository.listarTodos();
  }

  public Aluno buscarPorId(UUID id) throws SQLException {
    return repository.buscarPorId(id);
  }

  public Aluno atualizar(UUID id, String matricula, LocalDate dataInicio, LocalDate dataConclusao) throws SQLException {
    Aluno existente = repository.buscarPorId(id);
    if (existente == null) {
      throw new IllegalArgumentException("Aluno não encontrado");
    }

    if (matricula != null && !matricula.isBlank()) {
      existente.setMatricula(matricula);
    }
    if (dataInicio != null) {
      existente.setDataInicio(dataInicio);
    }
    existente.setDataConclusao(dataConclusao);

    repository.atualizar(existente);
    return existente;
  }

  public void deletar(UUID id) throws SQLException {
    Aluno existente = repository.buscarPorId(id);
    if (existente == null) {
      throw new IllegalArgumentException("Aluno não encontrado");
    }

    boolean removido = repository.deletar(id);
    if (removido && existente.getUsuarioId() != null) {
      usuarioRepository.deletar(existente.getUsuarioId());
    } else if (!removido) {
      throw new IllegalArgumentException("Aluno não encontrado");
    }
  }

  public void atualizarMedia(UUID id, BigDecimal novaMedia) throws SQLException {
    repository.atualizarMedia(id, novaMedia);
  }
}
