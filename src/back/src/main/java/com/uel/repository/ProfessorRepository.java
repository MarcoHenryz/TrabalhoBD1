package com.uel.repository;

import com.uel.entity.Professor;
import com.uel.entity.Usuario;
import com.uel.dto.ProvaTutorDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class ProfessorRepository {
    private final DataSource dataSource;

    public ProfessorRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void criar(Professor professor) throws SQLException {
        String sql = "INSERT INTO professores (id, area, usuario_id) VALUES (?, ?, ?)";

        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setObject(1, professor.getId());
            pst.setString(2, professor.getArea());
            pst.setObject(3, professor.getUsuarioId());
            pst.executeUpdate();
        }
    }

    public Professor buscarPorId(UUID id) throws SQLException {
        String sql = """
                SELECT p.id,
                       p.area,
                       p.usuario_id,
                       u.email        AS usuario_email,
                       u.salt         AS usuario_salt,
                       u.hash_senha   AS usuario_hash
                  FROM professores p
                  JOIN usuarios u ON u.id = p.usuario_id
                 WHERE p.id = ?
                """;

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

    public List<Professor> listarTodos() throws SQLException {
        String sql = """
                  SELECT p.id,
                         p.area,
                         p.usuario_id,
                         u.email        AS usuario_email,
                         u.salt         AS usuario_salt,
                         u.hash_senha   AS usuario_hash
                    FROM professores p
                    JOIN usuarios u ON u.id = p.usuario_id
                ORDER BY p.area
                  """;
        List<Professor> professores = new ArrayList<>();

        try (
                Connection conn = dataSource.getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                professores.add(map(rs));
            }
        }

        return professores;
    }

    public void atualizar(Professor professor) throws SQLException {
        String sql = "UPDATE professores SET area = ? WHERE id = ?";

        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setString(1, professor.getArea());
            pst.setObject(2, professor.getId());
            pst.executeUpdate();
        }
    }

    public boolean deletar(UUID id) throws SQLException {
        String sql = "DELETE FROM professores WHERE id = ?";

        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setObject(1, id);
            return pst.executeUpdate() > 0;
        }
    }

    public Professor buscarPorUsuarioId(UUID usuarioId) throws SQLException {
        String sql = """
                SELECT p.id,
                       p.area,
                       p.usuario_id,
                       u.email        AS usuario_email,
                       u.salt         AS usuario_salt,
                       u.hash_senha   AS usuario_hash
                  FROM professores p
                  JOIN usuarios u ON u.id = p.usuario_id
                 WHERE p.usuario_id = ?
                """;

        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setObject(1, usuarioId);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        }

        return null;
    }

    public List<Professor> listarPorAluno(UUID alunoId) throws SQLException {
        String sql = """
                SELECT DISTINCT p.id,
                                p.area,
                                p.usuario_id,
                                u.email        AS usuario_email,
                                u.salt         AS usuario_salt,
                                u.hash_senha   AS usuario_hash
                  FROM professores p
                  JOIN usuarios u ON u.id = p.usuario_id
                  JOIN questoes q ON q.professor_id = p.id
                  JOIN avaliacao_questoes aq ON aq.questao_id = q.questao_id
                  JOIN avaliacao_alunos aa ON aa.avaliacao_id = aq.avaliacao_id
                 WHERE aa.aluno_id = ?
                """;
        List<Professor> professores = new ArrayList<>();
        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setObject(1, alunoId);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    professores.add(map(rs));
                }
            }
        }
        return professores;
    }

    public List<ProvaTutorDTO> listarProvasComTutor(UUID alunoId) throws SQLException {
        String sql = """
                WITH responsavel AS (
                    SELECT aq.avaliacao_id,
                           q.professor_id,
                           ROW_NUMBER() OVER (PARTITION BY aq.avaliacao_id ORDER BY aq.ordem) AS rn
                      FROM avaliacao_questoes aq
                      JOIN questoes q ON q.questao_id = aq.questao_id
                )
                SELECT a.id               AS avaliacao_id,
                       a.descricao        AS avaliacao_descricao,
                       a.data             AS avaliacao_data,
                       a.horario          AS avaliacao_horario,
                       p.id               AS professor_id,
                       p.area             AS professor_area,
                       p.usuario_id       AS professor_usuario_id,
                       u.email            AS professor_email,
                       COUNT(DISTINCT q.questao_id) AS total_questoes,
                       COUNT(DISTINCT CASE WHEN ra.id IS NOT NULL THEN ra.questao_id END) AS respondidas
                  FROM avaliacao_alunos aa
                  JOIN avaliacoes a ON a.id = aa.avaliacao_id
                  JOIN responsavel r ON r.avaliacao_id = a.id AND r.rn = 1
                  JOIN professores p ON p.id = r.professor_id
                  JOIN usuarios u ON u.id = p.usuario_id
             LEFT JOIN avaliacao_questoes aq ON aq.avaliacao_id = a.id
             LEFT JOIN questoes q ON q.questao_id = aq.questao_id
             LEFT JOIN respostas_alunos ra
                       ON ra.avaliacao_id = a.id
                      AND ra.aluno_id = aa.aluno_id
                      AND ra.questao_id = q.questao_id
                 WHERE aa.aluno_id = ?
              GROUP BY a.id, a.descricao, a.data, a.horario, p.id, p.area, p.usuario_id, u.email
              ORDER BY a.data DESC, a.horario DESC
                """;

        List<ProvaTutorDTO> resultados = new ArrayList<>();
        try (Connection conn = dataSource.getConnection(); PreparedStatement pst = conn.prepareStatement(sql)) {
            pst.setObject(1, alunoId);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    UUID avaliacaoId = rs.getObject("avaliacao_id", UUID.class);
                    resultados.add(new ProvaTutorDTO(
                            avaliacaoId,
                            rs.getString("avaliacao_descricao"),
                            rs.getObject("avaliacao_data", LocalDate.class),
                            rs.getObject("avaliacao_horario", LocalTime.class),
                            rs.getInt("total_questoes"),
                            rs.getInt("respondidas"),
                            rs.getObject("professor_id", UUID.class),
                            rs.getString("professor_email"),
                            null, // nome será preenchido no service
                            rs.getString("professor_area")
                    ));
                }
            }
        }
        return resultados;
    }

    private Professor map(ResultSet rs) throws SQLException {
        UUID id = rs.getObject("id", UUID.class);
        String area = rs.getString("area");
        UUID usuarioId = rs.getObject("usuario_id", UUID.class);

        Usuario usuario = null;
        if (usuarioId != null) {
            String email = rs.getString("usuario_email");
            String salt = rs.getString("usuario_salt");
            String hashSenha = rs.getString("usuario_hash");
            usuario = new Usuario(usuarioId, email, salt, hashSenha);
        }

        return new Professor(id, area, usuario);
    }
}
