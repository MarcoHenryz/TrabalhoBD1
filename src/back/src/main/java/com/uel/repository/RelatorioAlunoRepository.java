package com.uel.repository;

import com.uel.dto.DistribuicaoDificuldadeDTO;
import com.uel.enums.Dificuldade;
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
public class RelatorioAlunoRepository {
    private final DataSource dataSource;

    public RelatorioAlunoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<DistribuicaoDificuldadeDTO> buscarDistribuicaoPorDificuldade(
            UUID alunoId,
            Integer meses,
            UUID professorId) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                WITH responsavel AS (
                    SELECT aq.avaliacao_id,
                           q.professor_id,
                           ROW_NUMBER() OVER (PARTITION BY aq.avaliacao_id ORDER BY aq.ordem) AS rn
                      FROM avaliacao_questoes aq
                      JOIN questoes q ON q.questao_id = aq.questao_id
                )
                SELECT q.dificuldade,
                       COUNT(*) AS total_questoes,
                       COUNT(ra.id) AS respondidas,
                       AVG(CASE WHEN ra.corrigido = TRUE AND ra.nota IS NOT NULL THEN ra.nota * 10 END) AS media_nota
                  FROM avaliacao_alunos aa
                  JOIN avaliacoes a ON a.id = aa.avaliacao_id
                  JOIN responsavel r ON r.avaliacao_id = a.id AND r.rn = 1
                  JOIN avaliacao_questoes aq ON aq.avaliacao_id = a.id
                  JOIN questoes q ON q.questao_id = aq.questao_id
             LEFT JOIN respostas_alunos ra
                       ON ra.avaliacao_id = a.id
                      AND ra.aluno_id = aa.aluno_id
                      AND ra.questao_id = q.questao_id
                 WHERE aa.aluno_id = ?
                """);

        List<Object> parametros = new ArrayList<>();
        parametros.add(alunoId);

        if (meses != null && meses > 0) {
            sql.append(" AND a.data >= CURRENT_DATE - make_interval(months => ?)");
            parametros.add(meses);
        }

        if (professorId != null) {
            sql.append(" AND r.professor_id = ?");
            parametros.add(professorId);
        }

        sql.append(" GROUP BY q.dificuldade ORDER BY q.dificuldade");

        try (Connection conn = dataSource.getConnection();
                PreparedStatement pst = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < parametros.size(); i++) {
                Object param = parametros.get(i);
                if (param instanceof UUID uuid) {
                    pst.setObject(i + 1, uuid);
                } else if (param instanceof Integer inteiro) {
                    pst.setInt(i + 1, inteiro);
                } else {
                    pst.setObject(i + 1, param);
                }
            }

            List<DistribuicaoDificuldadeDTO> resultado = new ArrayList<>();
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Dificuldade dificuldade = Dificuldade.valueOf(rs.getString("dificuldade"));
                    int total = rs.getInt("total_questoes");
                    int respondidas = rs.getInt("respondidas");
                    BigDecimal mediaNota = rs.getBigDecimal("media_nota");
                    resultado.add(new DistribuicaoDificuldadeDTO(
                            dificuldade,
                            total,
                            respondidas,
                            mediaNota != null ? mediaNota.doubleValue() : null));
                }
            }
            return resultado;
        }
    }
}
