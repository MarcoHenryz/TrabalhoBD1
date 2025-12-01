package com.uel.repository;

import com.uel.entity.RespostaAluno;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class RespostaAlunoRepository {
    private final DataSource dataSource;

    public RespostaAlunoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void criar(RespostaAluno resposta) throws SQLException {
        String sql = """
                  INSERT INTO respostas_alunos
                  (id, avaliacao_id, aluno_id, questao_id, alternativa_escolhida_id,
                   vouf_item_id, vouf_resposta, resposta_texto, nota, corrigido, respondido_em)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, resposta.getId());
            pst.setObject(2, resposta.getAvaliacaoId());
            pst.setObject(3, resposta.getAlunoId());
            pst.setObject(4, resposta.getQuestaoId());
            pst.setObject(5, resposta.getAlternativaEscolhidaId());
            pst.setObject(6, resposta.getVoufItemId());
            pst.setObject(7, resposta.getVoufResposta());
            pst.setString(8, resposta.getRespostaTexto());
            pst.setBigDecimal(9, resposta.getNota());
            pst.setBoolean(10, resposta.getCorrigido() != null ? resposta.getCorrigido() : false);
            pst.setTimestamp(11, resposta.getRespondidoEm() != null ? Timestamp.valueOf(resposta.getRespondidoEm())
                    : new Timestamp(System.currentTimeMillis()));

            pst.executeUpdate();
        }
    }

    public List<RespostaAluno> buscarPorAvaliacaoEAluno(UUID avaliacaoId, UUID alunoId) throws SQLException {
        String sql = """
                  SELECT id, avaliacao_id, aluno_id, questao_id, alternativa_escolhida_id,
                         vouf_item_id, vouf_resposta, resposta_texto, nota, corrigido, respondido_em
                  FROM respostas_alunos
                  WHERE avaliacao_id = ? AND aluno_id = ?
                  ORDER BY respondido_em
                """;

        List<RespostaAluno> respostas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.setObject(2, alunoId);

            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    respostas.add(mapearResposta(rs));
                }
            }
        }
        return respostas;
    }

    public RespostaAluno buscarPorId(UUID id) throws SQLException {
        String sql = """
                  SELECT id, avaliacao_id, aluno_id, questao_id, alternativa_escolhida_id,
                         vouf_item_id, vouf_resposta, resposta_texto, nota, corrigido, respondido_em
                  FROM respostas_alunos
                  WHERE id = ?
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, id);

            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return mapearResposta(rs);
                }
            }
        }
        return null;
    }

    public void atualizar(RespostaAluno resposta) throws SQLException {
        String sql = """
                  UPDATE respostas_alunos
                  SET alternativa_escolhida_id = ?, vouf_item_id = ?, vouf_resposta = ?,
                      resposta_texto = ?, nota = ?, corrigido = ?
                  WHERE id = ?
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, resposta.getAlternativaEscolhidaId());
            pst.setObject(2, resposta.getVoufItemId());
            pst.setObject(3, resposta.getVoufResposta());
            pst.setString(4, resposta.getRespostaTexto());
            pst.setBigDecimal(5, resposta.getNota());
            pst.setBoolean(6, resposta.getCorrigido() != null ? resposta.getCorrigido() : false);
            pst.setObject(7, resposta.getId());

            pst.executeUpdate();
        }
    }

    public boolean jaRespondeu(UUID avaliacaoId, UUID alunoId, UUID questaoId) throws SQLException {
        String sql = """
                  SELECT COUNT(*)
                  FROM respostas_alunos
                  WHERE avaliacao_id = ? AND aluno_id = ? AND questao_id = ?
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql)) {

            pst.setObject(1, avaliacaoId);
            pst.setObject(2, alunoId);
            pst.setObject(3, questaoId);

            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    public List<com.uel.dto.CorrecaoDissertativaDTO> listarParaCorrecao(UUID professorId, Boolean corrigido)
            throws SQLException {
        StringBuilder sql = new StringBuilder("""
                  SELECT ra.id                AS resposta_id,
                         ra.avaliacao_id      AS avaliacao_id,
                         a.descricao          AS avaliacao_descricao,
                         a.data               AS avaliacao_data,
                         ra.aluno_id          AS aluno_id,
                         al.matricula         AS aluno_matricula,
                         u.email              AS aluno_email,
                         q.questao_id         AS questao_id,
                         q.tema               AS tema,
                         q.enunciado          AS enunciado,
                         ra.resposta_texto    AS resposta_texto,
                         ra.nota              AS nota,
                         ra.corrigido         AS corrigido,
                         ra.respondido_em     AS respondido_em
                    FROM respostas_alunos ra
                    JOIN questoes q ON q.questao_id = ra.questao_id
                    JOIN avaliacoes a ON a.id = ra.avaliacao_id
                    JOIN alunos al ON al.id = ra.aluno_id
                    JOIN usuarios u ON u.id = al.usuario_id
                   WHERE q.professor_id = ?
                     AND q.tipo = 'DISSERTATIVA'
                """);

        List<Object> parametros = new ArrayList<>();
        parametros.add(professorId);

        if (corrigido != null) {
            sql.append(" AND ra.corrigido = ?");
            parametros.add(corrigido);
        }

        sql.append(" ORDER BY ra.corrigido ASC, ra.respondido_em DESC");

        List<com.uel.dto.CorrecaoDissertativaDTO> resultados = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < parametros.size(); i++) {
                Object param = parametros.get(i);
                if (param instanceof UUID uuid) {
                    pst.setObject(i + 1, uuid);
                } else if (param instanceof Boolean bool) {
                    pst.setBoolean(i + 1, bool);
                } else {
                    pst.setObject(i + 1, param);
                }
            }

            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    resultados.add(new com.uel.dto.CorrecaoDissertativaDTO(
                            rs.getObject("resposta_id", UUID.class),
                            rs.getObject("avaliacao_id", UUID.class),
                            rs.getString("avaliacao_descricao"),
                            rs.getObject("avaliacao_data", java.time.LocalDate.class),
                            rs.getObject("aluno_id", UUID.class),
                            rs.getString("aluno_matricula"),
                            rs.getString("aluno_email"),
                            rs.getObject("questao_id", UUID.class),
                            rs.getString("tema"),
                            rs.getString("enunciado"),
                            rs.getString("resposta_texto"),
                            rs.getBigDecimal("nota") != null ? rs.getBigDecimal("nota").doubleValue() * 10 : null,
                            rs.getBoolean("corrigido")));
                }
            }
        }

        return resultados;
    }

    private RespostaAluno mapearResposta(ResultSet rs) throws SQLException {
        RespostaAluno resposta = new RespostaAluno();
        resposta.setId(rs.getObject("id", UUID.class));
        resposta.setAvaliacaoId(rs.getObject("avaliacao_id", UUID.class));
        resposta.setAlunoId(rs.getObject("aluno_id", UUID.class));
        resposta.setQuestaoId(rs.getObject("questao_id", UUID.class));
        resposta.setAlternativaEscolhidaId(rs.getObject("alternativa_escolhida_id", UUID.class));
        resposta.setVoufItemId(rs.getObject("vouf_item_id", UUID.class));

        Boolean voufResp = (Boolean) rs.getObject("vouf_resposta");
        resposta.setVoufResposta(voufResp);

        resposta.setRespostaTexto(rs.getString("resposta_texto"));
        resposta.setNota(rs.getBigDecimal("nota"));
        resposta.setCorrigido(rs.getBoolean("corrigido"));

        Timestamp timestamp = rs.getTimestamp("respondido_em");
        if (timestamp != null) {
            resposta.setRespondidoEm(timestamp.toLocalDateTime());
        }

        return resposta;
    }
}
