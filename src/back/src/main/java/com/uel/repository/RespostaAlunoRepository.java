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