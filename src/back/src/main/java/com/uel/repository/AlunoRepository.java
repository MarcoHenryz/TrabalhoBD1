package com.uel.repository;

import com.uel.entity.Aluno;
import com.uel.entity.Usuario;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class AlunoRepository {
  private final DataSource dataSource;

  public AlunoRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public void criar(Aluno aluno) throws SQLException {
    String sql = "INSERT INTO alunos (id, matricula, media, data_inicio, data_conclusao, usuario_id) VALUES (?, ?, ?, ?, ?, ?)";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, aluno.getId());
      pst.setString(2, aluno.getMatricula());
      pst.setBigDecimal(3, aluno.getMedia());
      pst.setObject(4, aluno.getDataInicio());
      pst.setObject(5, aluno.getDataConclusao());
      pst.setObject(6, aluno.getUsuarioId());
      pst.executeUpdate();
    }
  }

  public Aluno buscarPorId(UUID id) throws SQLException {
    String sql = """
      SELECT a.id,
             a.matricula,
             a.media,
             a.data_inicio,
             a.data_conclusao,
             a.usuario_id,
             u.email        AS usuario_email,
             u.salt         AS usuario_salt,
             u.hash_senha   AS usuario_hash
        FROM alunos a
        JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.id = ?
      """;

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, id);
      try (ResultSet rs = pst.executeQuery()) {
        if (rs.next()) {
          return map(rs);
        }
      }
    }

    return null;
  }

  public List<Aluno> listarTodos() throws SQLException {
    String sql = """
      SELECT a.id,
             a.matricula,
             a.media,
             a.data_inicio,
             a.data_conclusao,
             a.usuario_id,
             u.email        AS usuario_email,
             u.salt         AS usuario_salt,
             u.hash_senha   AS usuario_hash
        FROM alunos a
        JOIN usuarios u ON u.id = a.usuario_id
    ORDER BY a.data_inicio DESC
      """;
    List<Aluno> alunos = new ArrayList<>();

    try (
      Connection conn = dataSource.getConnection();
      Statement st = conn.createStatement();
      ResultSet rs = st.executeQuery(sql)
    ) {
      while (rs.next()) {
        alunos.add(map(rs));
      }
    }

    return alunos;
  }

  public void atualizar(Aluno aluno) throws SQLException {
    String sql = "UPDATE alunos SET matricula = ?, data_inicio = ?, data_conclusao = ? WHERE id = ?";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setString(1, aluno.getMatricula());
      pst.setObject(2, aluno.getDataInicio());
      pst.setObject(3, aluno.getDataConclusao());
      pst.setObject(4, aluno.getId());
      pst.executeUpdate();
    }
  }

  public boolean deletar(UUID id) throws SQLException {
    String sql = "DELETE FROM alunos WHERE id = ?";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, id);
      return pst.executeUpdate() > 0;
    }
  }

  public void atualizarMedia(UUID id, BigDecimal novaMedia) throws SQLException {
    String sql = "UPDATE alunos SET media = ? WHERE id = ?";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setBigDecimal(1, novaMedia);
      pst.setObject(2, id);
      pst.executeUpdate();
    }
  }

  private Aluno map(ResultSet rs) throws SQLException {
    UUID id = rs.getObject("id", UUID.class);
    String matricula = rs.getString("matricula");
    BigDecimal media = rs.getBigDecimal("media");
    LocalDate dataInicio = rs.getObject("data_inicio", LocalDate.class);
    LocalDate dataConclusao = rs.getObject("data_conclusao", LocalDate.class);
    UUID usuarioId = rs.getObject("usuario_id", UUID.class);
    Usuario usuario = null;
    if (usuarioId != null) {
      String email = rs.getString("usuario_email");
      String salt = rs.getString("usuario_salt");
      String hashSenha = rs.getString("usuario_hash");
      usuario = new Usuario(usuarioId, email, salt, hashSenha);
    }
    return new Aluno(id, matricula, media, dataInicio, dataConclusao, usuario);
  }

  public Aluno buscarPorUsuarioId(UUID usuarioId) throws SQLException {
    String sql = """
      SELECT a.id,
             a.matricula,
             a.media,
             a.data_inicio,
             a.data_conclusao,
             a.usuario_id,
             u.email        AS usuario_email,
             u.salt         AS usuario_salt,
             u.hash_senha   AS usuario_hash
        FROM alunos a
        JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.usuario_id = ?
      """;

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, usuarioId);
      try (ResultSet rs = pst.executeQuery()) {
        if (rs.next()) {
          return map(rs);
        }
      }
    }

    return null;
  }
}
