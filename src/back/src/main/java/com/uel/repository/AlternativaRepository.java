package com.uel.repository;

import com.uel.entity.Alternativa;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class AlternativaRepository {
    private final DataSource dataSource;

    public AlternativaRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void criar(UUID questaoId, String alternativa, Boolean verdadeiro) throws SQLException {
        String sql = """
                  INSERT INTO alternativas (id, questao_id, alternativa, verdadeiro)
                  VALUES (?, ?, ?, ?)
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, UUID.randomUUID());
            pst.setObject(2, questaoId);
            pst.setString(3, alternativa);
            pst.setBoolean(4, verdadeiro);

            pst.executeUpdate();
        }
    }

    public List<Alternativa> buscarPorQuestaoId(UUID questaoId) throws SQLException {
        String sql = """
                  SELECT id, questao_id, alternativa, verdadeiro
                  FROM alternativas
                  WHERE questao_id = ?
                  ORDER BY criado_em
                """;

        List<Alternativa> alternativas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, questaoId);

            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    alternativas.add(mapearAlternativa(rs));
                }
            }
        }
        return alternativas;
    }

    public void deletarPorQuestaoId(UUID questaoId) throws SQLException {
        String sql = "DELETE FROM alternativas WHERE questao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, questaoId);
            pst.executeUpdate();
        }
    }

    private Alternativa mapearAlternativa(ResultSet rs) throws SQLException {
        return new Alternativa(
                rs.getObject("id", UUID.class),
                rs.getObject("questao_id", UUID.class),
                rs.getString("alternativa"),
                rs.getBoolean("verdadeiro"));
    }
}