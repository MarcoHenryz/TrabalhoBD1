package com.uel.repository;

import com.uel.entity.Vouf;
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
public class VoufRepository {
    private final DataSource dataSource;

    public VoufRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void criar(UUID questaoId, String item, Boolean verdadeiro) throws SQLException {
        String sql = """
                  INSERT INTO vouf (id, item, verdadeiro, questao_id)
                  VALUES (?, ?, ?, ?)
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, UUID.randomUUID());
            pst.setString(2, item);
            pst.setBoolean(3, verdadeiro);
            pst.setObject(4, questaoId);

            pst.executeUpdate();
        }
    }

    public List<Vouf> buscarPorQuestaoId(UUID questaoId) throws SQLException {
        String sql = """
                  SELECT id, item, verdadeiro, questao_id
                  FROM vouf
                  WHERE questao_id = ?
                  ORDER BY criado_em
                """;

        List<Vouf> itens = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, questaoId);

            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    itens.add(mapearVouf(rs));
                }
            }
        }
        return itens;
    }

    public void deletarPorQuestaoId(UUID questaoId) throws SQLException {
        String sql = "DELETE FROM vouf WHERE questao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, questaoId);
            pst.executeUpdate();
        }
    }

    private Vouf mapearVouf(ResultSet rs) throws SQLException {
        return new Vouf(
                rs.getObject("id", UUID.class),
                rs.getString("item"),
                rs.getBoolean("verdadeiro"),
                rs.getObject("questao_id", UUID.class));
    }
}