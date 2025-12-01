package com.uel.repository;

import com.uel.entity.Questao;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;
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
public class QuestaoRepository {
    private final DataSource dataSource;

    public QuestaoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void criar(Questao questao) throws SQLException {
        String sql = """
                  INSERT INTO questoes (questao_id, enunciado, tema, tipo, dificuldade, resposta_esperada, professor_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, questao.getId());
            pst.setString(2, questao.getEnunciado());
            pst.setString(3, questao.getTema());
            pst.setString(4, questao.getTipo().name());
            pst.setString(5, questao.getDificuldade().name());
            pst.setString(6, questao.getRespostaEsperada());
            pst.setObject(7, questao.getProfessorId());

            pst.executeUpdate();
        }
    }

    public Questao buscarPorId(UUID id) throws SQLException {
        String sql = """
                  SELECT questao_id, enunciado, tema, tipo, dificuldade, resposta_esperada, professor_id
                  FROM questoes
                  WHERE questao_id = ?
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, id);

            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return mapearQuestao(rs);
                }
            }
        }
        return null;
    }

    public List<Questao> listarTodas() throws SQLException {
        String sql = """
                  SELECT questao_id, enunciado, tema, tipo, dificuldade, resposta_esperada, professor_id
                  FROM questoes
                  ORDER BY criado_em DESC
                """;

        List<Questao> questoes = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                questoes.add(mapearQuestao(rs));
            }
        }
        return questoes;
    }

    public void atualizar(Questao questao) throws SQLException {
        String sql = """
                  UPDATE questoes
                  SET enunciado = ?, tema = ?, tipo = ?, dificuldade = ?, resposta_esperada = ?
                  WHERE questao_id = ?
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setString(1, questao.getEnunciado());
            pst.setString(2, questao.getTema());
            pst.setString(3, questao.getTipo().name());
            pst.setString(4, questao.getDificuldade().name());
            pst.setString(5, questao.getRespostaEsperada());
            pst.setObject(6, questao.getId());

            pst.executeUpdate();
        }
    }

    public boolean deletar(UUID id) throws SQLException {
        String sql = "DELETE FROM questoes WHERE questao_id = ?";

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, id);
            return pst.executeUpdate() > 0;
        }
    }

    private Questao mapearQuestao(ResultSet rs) throws SQLException {
        Questao questao = new Questao();
        questao.setId(rs.getObject("questao_id", UUID.class));
        questao.setEnunciado(rs.getString("enunciado"));
        questao.setTema(rs.getString("tema"));
        questao.setTipo(TipoQuestao.valueOf(rs.getString("tipo")));
        questao.setDificuldade(Dificuldade.valueOf(rs.getString("dificuldade")));
        questao.setRespostaEsperada(rs.getString("resposta_esperada"));
        questao.setProfessorId(rs.getObject("professor_id", UUID.class));
        return questao;
    }
}
