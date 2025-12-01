package com.uel.repository;

import com.uel.dto.AlunoComparativoDTO;
import com.uel.dto.AvaliacaoDesempenhoDTO;
import com.uel.dto.QuestaoDesafioDTO;
import com.uel.dto.RankingProfessorDTO;
import com.uel.dto.ResumoProfessorDTO;
import com.uel.enums.Dificuldade;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class RelatorioProfessorRepository {
    private final DataSource dataSource;

    public RelatorioProfessorRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public ResumoProfessorDTO buscarResumo(UUID professorId, Integer meses) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                WITH avaliacoes_prof AS (
                    SELECT DISTINCT aq.avaliacao_id
                      FROM avaliacao_questoes aq
                      JOIN questoes q ON q.questao_id = aq.questao_id
                     WHERE q.professor_id = ?
                ),
                avaliacoes_filtradas AS (
                    SELECT a.id, a.data
                      FROM avaliacoes a
                      JOIN avaliacoes_prof ap ON ap.avaliacao_id = a.id
                """);
        List<Object> params = new ArrayList<>();
        params.add(professorId);

        if (meses != null && meses > 0) {
            sql.append(" WHERE a.data >= CURRENT_DATE - make_interval(months => ?)");
            params.add(meses);
        }

        sql.append("""
                ),
                notas AS (
                    SELECT ra.avaliacao_id,
                           ra.aluno_id,
                           AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END) AS nota
                      FROM respostas_alunos ra
                      JOIN avaliacoes_filtradas af ON af.id = ra.avaliacao_id
                  GROUP BY ra.avaliacao_id, ra.aluno_id
                ),
                respostas_prof AS (
                    SELECT ra.id, ra.corrigido
                      FROM respostas_alunos ra
                      JOIN questoes q ON q.questao_id = ra.questao_id
                      JOIN avaliacao_questoes aq ON aq.questao_id = q.questao_id AND aq.avaliacao_id = ra.avaliacao_id
                      JOIN avaliacoes_filtradas af ON af.id = ra.avaliacao_id
                     WHERE q.professor_id = ?
                )
                SELECT (SELECT COUNT(*) FROM avaliacoes_filtradas) AS total_avaliacoes,
                       (SELECT COUNT(DISTINCT aluno_id) FROM avaliacao_alunos aa WHERE aa.avaliacao_id IN (SELECT id FROM avaliacoes_filtradas)) AS total_alunos,
                       ROUND(COALESCE(AVG(nota), 0), 2) AS media_geral,
                       COALESCE(MAX(nota), 0) AS melhor_nota,
                       COALESCE(MIN(nota), 0) AS pior_nota,
                       (SELECT COUNT(*) FROM respostas_prof WHERE corrigido = TRUE) AS respostas_corrigidas
                  FROM notas
                """);

        params.add(professorId);

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {
            preencherParametros(pst, params);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return new ResumoProfessorDTO(
                            rs.getInt("total_avaliacoes"),
                            rs.getInt("total_alunos"),
                            rs.getDouble("media_geral"),
                            rs.getDouble("melhor_nota"),
                            rs.getDouble("pior_nota"),
                            rs.getInt("respostas_corrigidas"));
                }
            }
        }

        return new ResumoProfessorDTO(0, 0, 0d, 0d, 0d, 0);
    }

    public List<AvaliacaoDesempenhoDTO> listarDesempenhoAvaliacoes(UUID professorId, Integer meses, int limite)
            throws SQLException {
        StringBuilder sql = new StringBuilder("""
                WITH avaliacoes_prof AS (
                    SELECT DISTINCT aq.avaliacao_id
                      FROM avaliacao_questoes aq
                      JOIN questoes q ON q.questao_id = aq.questao_id
                     WHERE q.professor_id = ?
                ),
                avaliacoes_filtradas AS (
                    SELECT a.id, a.descricao, a.data
                      FROM avaliacoes a
                      JOIN avaliacoes_prof ap ON ap.avaliacao_id = a.id
                """);
        List<Object> params = new ArrayList<>();
        params.add(professorId);

        if (meses != null && meses > 0) {
            sql.append(" WHERE a.data >= CURRENT_DATE - make_interval(months => ?)");
            params.add(meses);
        }

        sql.append("""
                ),
                notas AS (
                    SELECT ra.avaliacao_id,
                           ra.aluno_id,
                           AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END) AS nota
                      FROM respostas_alunos ra
                      JOIN avaliacoes_filtradas af ON af.id = ra.avaliacao_id
                  GROUP BY ra.avaliacao_id, ra.aluno_id
                )
                SELECT af.id,
                       af.descricao,
                       af.data,
                       ROUND(COALESCE(AVG(n.nota), 0), 2) AS media_nota,
                       COALESCE(MAX(n.nota), 0) AS maior_nota,
                       COALESCE(MIN(n.nota), 0) AS menor_nota,
                       COUNT(DISTINCT n.aluno_id) AS respondentes
                  FROM avaliacoes_filtradas af
             LEFT JOIN notas n ON n.avaliacao_id = af.id
              GROUP BY af.id, af.descricao, af.data
              ORDER BY af.data DESC
                 LIMIT ?
                """);

        params.add(limite);

        List<AvaliacaoDesempenhoDTO> resultados = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {
            preencherParametros(pst, params);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    resultados.add(new AvaliacaoDesempenhoDTO(
                            rs.getObject("id", UUID.class),
                            rs.getString("descricao"),
                            rs.getObject("data", LocalDate.class),
                            rs.getDouble("media_nota"),
                            rs.getDouble("maior_nota"),
                            rs.getDouble("menor_nota"),
                            rs.getInt("respondentes")));
                }
            }
        }

        return resultados;
    }

    public List<AlunoComparativoDTO> rankingAlunos(UUID professorId, Integer meses, int limite) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                WITH avaliacoes_prof AS (
                    SELECT DISTINCT aq.avaliacao_id
                      FROM avaliacao_questoes aq
                      JOIN questoes q ON q.questao_id = aq.questao_id
                     WHERE q.professor_id = ?
                ),
                avaliacoes_filtradas AS (
                    SELECT a.id
                      FROM avaliacoes a
                      JOIN avaliacoes_prof ap ON ap.avaliacao_id = a.id
                """);
        List<Object> params = new ArrayList<>();
        params.add(professorId);

        if (meses != null && meses > 0) {
            sql.append(" WHERE a.data >= CURRENT_DATE - make_interval(months => ?)");
            params.add(meses);
        }

        sql.append("""
                ),
                notas AS (
                    SELECT ra.avaliacao_id,
                           ra.aluno_id,
                           AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END) AS nota
                      FROM respostas_alunos ra
                      JOIN avaliacoes_filtradas af ON af.id = ra.avaliacao_id
                  GROUP BY ra.avaliacao_id, ra.aluno_id
                ),
                agrupado AS (
                    SELECT aluno_id,
                           AVG(nota) AS media,
                           MAX(nota) AS melhor,
                           MIN(nota) AS pior,
                           COUNT(DISTINCT avaliacao_id) AS provas
                      FROM notas
                  GROUP BY aluno_id
                )
                SELECT ag.aluno_id,
                       al.matricula,
                       u.email,
                       ROUND(COALESCE(ag.media, 0), 2) AS media,
                       COALESCE(ag.melhor, 0) AS melhor_nota,
                       COALESCE(ag.pior, 0) AS pior_nota,
                       ag.provas
                  FROM agrupado ag
                  JOIN alunos al ON al.id = ag.aluno_id
                  JOIN usuarios u ON u.id = al.usuario_id
              ORDER BY ag.media DESC NULLS LAST, ag.provas DESC
                 LIMIT ?
                """);

        params.add(limite);

        List<AlunoComparativoDTO> resultados = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {
            preencherParametros(pst, params);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    resultados.add(new AlunoComparativoDTO(
                            rs.getObject("aluno_id", UUID.class),
                            rs.getString("matricula"),
                            rs.getString("email"),
                            rs.getDouble("media"),
                            rs.getDouble("melhor_nota"),
                            rs.getDouble("pior_nota"),
                            rs.getInt("provas")));
                }
            }
        }

        return resultados;
    }

    public List<QuestaoDesafioDTO> listarQuestoesDificeis(UUID professorId, Integer meses, int limite)
            throws SQLException {
        StringBuilder sql = new StringBuilder("""
                SELECT q.questao_id,
                       q.enunciado,
                       q.tema,
                       q.dificuldade,
                       ROUND(AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END), 2) AS media,
                       COUNT(ra.id) AS total_respostas,
                       ROUND(AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota END) * 100, 2) AS percentual_acerto
                  FROM questoes q
             LEFT JOIN respostas_alunos ra ON ra.questao_id = q.questao_id
             LEFT JOIN avaliacoes a ON a.id = ra.avaliacao_id
                 WHERE q.professor_id = ?
                """);
        List<Object> params = new ArrayList<>();
        params.add(professorId);

        if (meses != null && meses > 0) {
            sql.append("   AND a.data >= CURRENT_DATE - make_interval(months => ?)");
            params.add(meses);
        }

        sql.append("""
              GROUP BY q.questao_id, q.enunciado, q.tema, q.dificuldade
              ORDER BY media ASC NULLS LAST, total_respostas DESC
                 LIMIT ?
                """);

        params.add(limite);

        List<QuestaoDesafioDTO> resultados = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {
            preencherParametros(pst, params);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    resultados.add(new QuestaoDesafioDTO(
                            rs.getObject("questao_id", UUID.class),
                            rs.getString("enunciado"),
                            rs.getString("tema"),
                            Dificuldade.valueOf(rs.getString("dificuldade")),
                            rs.getDouble("media"),
                            rs.getInt("total_respostas"),
                            rs.getObject("percentual_acerto") != null ? rs.getDouble("percentual_acerto") : null));
                }
            }
        }

        return resultados;
    }

    public List<RankingProfessorDTO> rankingProfessores(Integer meses, int limite) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                WITH respostas AS (
                    SELECT q.professor_id,
                           AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END) AS media,
                           COUNT(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN 1 END) AS corrigidas
                      FROM questoes q
                 LEFT JOIN respostas_alunos ra ON ra.questao_id = q.questao_id
                 LEFT JOIN avaliacoes a ON a.id = ra.avaliacao_id
                     WHERE 1=1
                """);
        List<Object> params = new ArrayList<>();

        if (meses != null && meses > 0) {
            sql.append("   AND a.data >= CURRENT_DATE - make_interval(months => ?)");
            params.add(meses);
        }

        sql.append("""
                  GROUP BY q.professor_id
                )
                SELECT p.id,
                       u.email AS nome,
                       u.email,
                       p.area,
                       ROUND(COALESCE(r.media, 0), 2) AS media_acertos,
                       COALESCE(r.corrigidas, 0) AS respostas_corrigidas
                  FROM professores p
                  JOIN usuarios u ON u.id = p.usuario_id
             LEFT JOIN respostas r ON r.professor_id = p.id
              ORDER BY media_acertos DESC NULLS LAST, respostas_corrigidas DESC
                 LIMIT ?
                """);

        params.add(limite);

        List<RankingProfessorDTO> resultados = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {
            preencherParametros(pst, params);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    resultados.add(new RankingProfessorDTO(
                            rs.getObject("id", UUID.class),
                            rs.getString("nome"),
                            rs.getString("email"),
                            rs.getString("area"),
                            rs.getDouble("media_acertos"),
                            rs.getInt("respostas_corrigidas")));
                }
            }
        }

        return resultados;
    }

    private void preencherParametros(PreparedStatement pst, List<Object> params) throws SQLException {
        for (int i = 0; i < params.size(); i++) {
            Object valor = params.get(i);
            if (valor instanceof UUID uuid) {
                pst.setObject(i + 1, uuid);
            } else if (valor instanceof Integer inteiro) {
                pst.setInt(i + 1, inteiro);
            } else if (valor == null) {
                pst.setObject(i + 1, null);
            } else {
                pst.setObject(i + 1, valor);
            }
        }
    }
}
