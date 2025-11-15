package com.uel.repository;

import com.uel.entity.Aluno;
import com.uel.entity.Avaliacao;
import com.uel.entity.AvaliacaoParticipacao;
import com.uel.entity.Usuario;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class AvaliacaoRepository {
  private final DataSource dataSource;

  public AvaliacaoRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public void criar(Avaliacao avaliacao) throws SQLException {
    String sql = "INSERT INTO avaliacoes (id, descricao, data, horario) VALUES (?, ?, ?, ?)";
    try (Connection conn = dataSource.getConnection()) {
      conn.setAutoCommit(false);
      try {
        try (PreparedStatement pst = conn.prepareStatement(sql)) {
          pst.setObject(1, avaliacao.getId());
          pst.setString(2, avaliacao.getDescricao());
          pst.setObject(3, avaliacao.getData());
          pst.setTime(4, Time.valueOf(avaliacao.getHorario()));
          pst.executeUpdate();
        }
        salvarParticipacoes(conn, avaliacao.getId(), avaliacao.getParticipacoes());
        conn.commit();
      } catch (SQLException e) {
        conn.rollback();
        throw e;
      } finally {
        conn.setAutoCommit(true);
      }
    }
  }

  public Avaliacao buscarPorId(UUID id) throws SQLException {
    String sql = "SELECT id, descricao, data, horario FROM avaliacoes WHERE id = ?";
    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, id);
      try (ResultSet rs = pst.executeQuery()) {
        if (rs.next()) {
          Avaliacao avaliacao = map(rs);
          avaliacao.setParticipacoes(buscarParticipacoes(avaliacao.getId()));
          return avaliacao;
        }
      }
    }
    return null;
  }

  public List<Avaliacao> listarTodas() throws SQLException {
    String sql = "SELECT id, descricao, data, horario FROM avaliacoes ORDER BY data DESC, horario DESC";
    List<Avaliacao> avaliacoes = new ArrayList<>();
    try (
      Connection conn = dataSource.getConnection();
      Statement st = conn.createStatement();
      ResultSet rs = st.executeQuery(sql)
    ) {
      while (rs.next()) {
        Avaliacao avaliacao = map(rs);
        avaliacao.setParticipacoes(buscarParticipacoes(avaliacao.getId()));
        avaliacoes.add(avaliacao);
      }
    }
    return avaliacoes;
  }

  public void atualizar(Avaliacao avaliacao) throws SQLException {
    String sql = "UPDATE avaliacoes SET descricao = ?, data = ?, horario = ? WHERE id = ?";
    try (Connection conn = dataSource.getConnection()) {
      conn.setAutoCommit(false);
      try {
        try (PreparedStatement pst = conn.prepareStatement(sql)) {
          pst.setString(1, avaliacao.getDescricao());
          pst.setObject(2, avaliacao.getData());
          pst.setTime(3, Time.valueOf(avaliacao.getHorario()));
          pst.setObject(4, avaliacao.getId());
          pst.executeUpdate();
        }
        removerParticipacoes(conn, avaliacao.getId());
        salvarParticipacoes(conn, avaliacao.getId(), avaliacao.getParticipacoes());
        conn.commit();
      } catch (SQLException e) {
        conn.rollback();
        throw e;
      } finally {
        conn.setAutoCommit(true);
      }
    }
  }

  public boolean deletar(UUID id) throws SQLException {
    String sql = "DELETE FROM avaliacoes WHERE id = ?";
    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, id);
      return pst.executeUpdate() > 0;
    }
  }

  private void salvarParticipacoes(Connection conn, UUID avaliacaoId, List<AvaliacaoParticipacao> participacoes) throws SQLException {
    if (participacoes == null || participacoes.isEmpty()) {
      return;
    }
    String sql = "INSERT INTO avaliacao_alunos (avaliacao_id, aluno_id, nota) VALUES (?, ?, ?)";
    try (PreparedStatement pst = conn.prepareStatement(sql)) {
      for (AvaliacaoParticipacao participacao : participacoes) {
        pst.setObject(1, avaliacaoId);
        pst.setObject(2, participacao.getAlunoId());
        if (participacao.getNota() != null) {
          pst.setBigDecimal(3, participacao.getNota());
        } else {
          pst.setNull(3, java.sql.Types.NUMERIC);
        }
        pst.addBatch();
      }
      pst.executeBatch();
    }
  }

  private void removerParticipacoes(Connection conn, UUID avaliacaoId) throws SQLException {
    String sql = "DELETE FROM avaliacao_alunos WHERE avaliacao_id = ?";
    try (PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, avaliacaoId);
      pst.executeUpdate();
    }
  }

  private List<AvaliacaoParticipacao> buscarParticipacoes(UUID avaliacaoId) throws SQLException {
    String sql = """
      SELECT aa.avaliacao_id,
             aa.aluno_id,
             aa.nota,
             a.matricula,
             a.media,
             a.data_inicio,
             a.data_conclusao,
             a.usuario_id,
             u.email      AS usuario_email,
             u.salt       AS usuario_salt,
             u.hash_senha AS usuario_hash
        FROM avaliacao_alunos aa
        JOIN alunos a ON a.id = aa.aluno_id
        JOIN usuarios u ON u.id = a.usuario_id
       WHERE aa.avaliacao_id = ?
    ORDER BY a.matricula
      """;
    List<AvaliacaoParticipacao> participacoes = new ArrayList<>();
    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, avaliacaoId);
      try (ResultSet rs = pst.executeQuery()) {
        while (rs.next()) {
          participacoes.add(mapParticipacao(rs));
        }
      }
    }
    return participacoes;
  }

  private Avaliacao map(ResultSet rs) throws SQLException {
    UUID id = rs.getObject("id", UUID.class);
    String descricao = rs.getString("descricao");
    LocalDate data = rs.getObject("data", LocalDate.class);
    LocalTime horario = rs.getObject("horario", LocalTime.class);
    return new Avaliacao(id, descricao, data, horario);
  }

  private AvaliacaoParticipacao mapParticipacao(ResultSet rs) throws SQLException {
    UUID avaliacaoId = rs.getObject("avaliacao_id", UUID.class);
    UUID alunoId = rs.getObject("aluno_id", UUID.class);
    AvaliacaoParticipacao participacao = new AvaliacaoParticipacao(avaliacaoId, alunoId, rs.getBigDecimal("nota"));

    UUID usuarioId = rs.getObject("usuario_id", UUID.class);
    Usuario usuario = new Usuario(usuarioId, rs.getString("usuario_email"), rs.getString("usuario_salt"), rs.getString("usuario_hash"));
    Aluno aluno = new Aluno(
      alunoId,
      rs.getString("matricula"),
      rs.getBigDecimal("media"),
      rs.getObject("data_inicio", LocalDate.class),
      rs.getObject("data_conclusao", LocalDate.class),
      usuario
    );

    participacao.setAluno(aluno);
    return participacao;
  }
}
