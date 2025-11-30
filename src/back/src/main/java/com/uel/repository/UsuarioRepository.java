package com.uel.repository;

import com.uel.entity.Usuario;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {
  private final DataSource dataSource;

  public UsuarioRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public void criar(Usuario usuario) throws SQLException {
    String sql = "INSERT INTO usuarios (id, email, salt, hash_senha) VALUES (?, ?, ?, ?)";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, usuario.getId());
      pst.setString(2, usuario.getEmail());
      pst.setString(3, usuario.getSalt());
      pst.setString(4, usuario.getHashSenha());

      pst.executeUpdate();
    }
  }

  public Usuario buscarPorId(UUID targetId) throws SQLException {
    String sql = """
        SELECT u.id,
               u.email,
               u.salt,
               u.hash_senha,
               a.id AS aluno_id,
               p.id AS professor_id
          FROM usuarios u
          LEFT JOIN alunos a ON a.usuario_id = u.id
          LEFT JOIN professores p ON p.usuario_id = u.id
         WHERE u.id = ?
        """;

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, targetId);

      try (ResultSet rs = pst.executeQuery()) {
        if (rs.next()) {
          return mapper(rs);
        }
      }
    }

    return null;
  }

  public List<Usuario> listarTodos() throws SQLException {
    String sql = """
          SELECT u.id,
                 u.email,
                 u.salt,
                 u.hash_senha,
                 a.id AS aluno_id,
                 p.id AS professor_id
            FROM usuarios u
            LEFT JOIN alunos a ON a.usuario_id = u.id
            LEFT JOIN professores p ON p.usuario_id = u.id
        ORDER BY u.email
          """;
    List<Usuario> usuarios = new ArrayList<>();

    try (
        Connection conn = dataSource.getConnection();
        Statement st = conn.createStatement();
        ResultSet rs = st.executeQuery(sql)) {
      while (rs.next()) {
        usuarios.add(mapper(rs));
      }
    }

    return usuarios;
  }

  public void atualizar(Usuario usuario) throws SQLException {
    String sql = "UPDATE usuarios SET email = ?, salt = ?, hash_senha = ? WHERE id = ?";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setString(1, usuario.getEmail());
      pst.setString(2, usuario.getSalt());
      pst.setString(3, usuario.getHashSenha());
      pst.setObject(4, usuario.getId());

      pst.executeUpdate();
    }
  }

  public boolean deletar(UUID id) throws SQLException {
    String sql = "DELETE FROM usuarios WHERE id = ?";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, id);
      return pst.executeUpdate() > 0;
    }
  }

  private Usuario mapper(ResultSet rs) throws SQLException {
    UUID id = rs.getObject("id", UUID.class);
    String email = rs.getString("email");
    String salt = rs.getString("salt");
    String hashSenha = rs.getString("hash_senha");
    UUID alunoId = null;
    UUID professorId = null;
    try {
      alunoId = rs.getObject("aluno_id", UUID.class);
    } catch (SQLException ignored) {
    }
    try {
      professorId = rs.getObject("professor_id", UUID.class);
    } catch (SQLException ignored) {
    }
    Usuario usuario = new Usuario(id, email, salt, hashSenha);
    usuario.setAlunoId(alunoId);
    usuario.setProfessorId(professorId);
    return usuario;
  }
}
