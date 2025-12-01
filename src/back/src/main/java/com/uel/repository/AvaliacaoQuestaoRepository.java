package com.uel.repository;

import com.uel.entity.Questao;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;
import java.math.BigDecimal;
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
public class AvaliacaoQuestaoRepository {
    private final DataSource dataSource;

    public AvaliacaoQuestaoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void adicionar(UUID avaliacaoId, UUID questaoId, BigDecimal peso, Integer ordem) throws SQLException {
        String sql = """
                  INSERT INTO avaliacao_questoes (avaliacao_id, questao_id, peso, ordem)
                  VALUES (?, ?, ?, ?)
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.setObject(2, questaoId);
            pst.setBigDecimal(3, peso);
            pst.setInt(4, ordem);

            pst.executeUpdate();
        }
    }

    public List<Questao> listarQuestoesPorAvaliacao(UUID avaliacaoId) throws SQLException {
        String sql = """
                  SELECT q.questao_id, q.enunciado, q.tema, q.tipo, q.dificuldade,
                         q.resposta_esperada, q.professor_id, aq.peso, aq.ordem
                  FROM questoes q
                  INNER JOIN avaliacao_questoes aq ON q.questao_id = aq.questao_id
                  WHERE aq.avaliacao_id = ?
                  ORDER BY aq.ordem
                """;

        List<Questao> questoes = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);

            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Questao questao = new Questao();
                    questao.setId(rs.getObject("questao_id", UUID.class));
                    questao.setEnunciado(rs.getString("enunciado"));
                    questao.setTema(rs.getString("tema"));
                    questao.setTipo(TipoQuestao.valueOf(rs.getString("tipo")));
                    questao.setDificuldade(Dificuldade.valueOf(rs.getString("dificuldade")));
                    questao.setRespostaEsperada(rs.getString("resposta_esperada"));
                    questao.setProfessorId(rs.getObject("professor_id", UUID.class));
                    questoes.add(questao);
                }
            }
        }
        return questoes;
    }

    public void remover(UUID avaliacaoId, UUID questaoId) throws SQLException {
        String sql = "DELETE FROM avaliacao_questoes WHERE avaliacao_id = ? AND questao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.setObject(2, questaoId);
            pst.executeUpdate();
        }
    }

    public void removerTodasPorAvaliacao(UUID avaliacaoId) throws SQLException {
        String sql = "DELETE FROM avaliacao_questoes WHERE avaliacao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.executeUpdate();
        }
    }

    public boolean questaoJaAdicionada(UUID avaliacaoId, UUID questaoId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM avaliacao_questoes WHERE avaliacao_id = ? AND questao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.setObject(2, questaoId);

            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    public int contarQuestoesPorAvaliacao(UUID avaliacaoId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM avaliacao_questoes WHERE avaliacao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);

            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
}
