package com.uel.repository;

import com.uel.entity.Professor;
import com.uel.entity.Usuario;
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