package com.uel.service;

import com.uel.entity.Aluno;
import com.uel.entity.Usuario;
import com.uel.repository.UsuarioRepository;
import com.uel.repository.AlunoRepository;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
  private final UsuarioRepository repository;
  private final AlunoRepository alunoRepository;
  private final BCryptPasswordEncoder encoder;
  private final SecureRandom secureRandom = new SecureRandom();

  public UsuarioService(UsuarioRepository repository, AlunoRepository alunoRepository, BCryptPasswordEncoder encoder) {
    this.repository = repository;
    this.alunoRepository = alunoRepository;
    this.encoder = encoder;
  }

  public Usuario criar(String email, String senha) throws SQLException {
    Usuario usuario = novoUsuario(email, senha);
    repository.criar(usuario);
    return usuario;
  }

  public List<Usuario> listarTodos() throws SQLException {
    return repository.listarTodos();
  }

  public Usuario buscarPorId(UUID id) throws SQLException {
    return repository.buscarPorId(id);
  }

  public Usuario atualizar(UUID id, String novoEmail, String novaSenha) throws SQLException {
    Usuario existente = repository.buscarPorId(id);
    if (existente == null) {
      throw new IllegalArgumentException("Usuário não encontrado");
    }

    if (novoEmail != null && !novoEmail.isBlank()) {
      existente.setEmail(novoEmail);
    }

    if (novaSenha != null && !novaSenha.isBlank()) {
      String novoSalt = gerarSalt();
      existente.setSalt(novoSalt);
      existente.setHashSenha(gerarHashSenha(novoSalt, novaSenha));
    }

    repository.atualizar(existente);
    return existente;
  }

  public void deletar(UUID id) throws SQLException {
    Aluno aluno = alunoRepository.buscarPorUsuarioId(id);
    if (aluno != null) {
      alunoRepository.deletar(aluno.getId());
    }
    boolean removido = repository.deletar(id);
    if (!removido) {
      throw new IllegalArgumentException("Usuário não encontrado");
    }
  }

  public boolean conferirSenha(Usuario usuario, String senhaTeste) {
    if (usuario == null || senhaTeste == null) {
      return false;
    }
    return encoder.matches(usuario.getSalt() + senhaTeste, usuario.getHashSenha());
  }

  private Usuario novoUsuario(String email, String senha) {
    UUID id = UUID.randomUUID();
    String salt = gerarSalt();
    String hashSenha = gerarHashSenha(salt, senha);
    return new Usuario(id, email, salt, hashSenha);
  }

  private String gerarSalt() {
    byte[] bytes = new byte[12];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String gerarHashSenha(String salt, String senha) {
    return encoder.encode(salt + senha);
  }
}
