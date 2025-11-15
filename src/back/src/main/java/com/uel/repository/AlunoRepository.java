package com.uel.repository;

import com.uel.entity.Aluno;
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
    String sql = "INSERT INTO alunos (id, matricula, media, data_inicio, data_conclusao) VALUES (?, ?, ?, ?, ?)";

    try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, aluno.getId());
      pst.setString(2, aluno.getMatricula());
      pst.setBigDecimal(3, aluno.getMedia());
      pst.setObject(4, aluno.getDataInicio());
      pst.setObject(5, aluno.getDataConclusao());
      pst.executeUpdate();
    }
  }

  public Aluno buscarPorId(UUID id) throws SQLException {
    String sql = "SELECT id, matricula, media, data_inicio, data_conclusao FROM alunos WHERE id = ?";

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
    String sql = "SELECT id, matricula, media, data_inicio, data_conclusao FROM alunos ORDER BY data_inicio DESC";
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
    return new Aluno(id, matricula, media, dataInicio, dataConclusao);
  }
}
