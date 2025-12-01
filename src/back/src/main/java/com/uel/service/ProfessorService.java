package com.uel.service;

import com.uel.dto.ProvaTutorDTO;
import com.uel.entity.Professor;
import com.uel.entity.Usuario;
import com.uel.repository.ProfessorRepository;
import com.uel.repository.UsuarioRepository;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ProfessorService {
    private final ProfessorRepository repository;
    private final UsuarioRepository usuarioRepository;

    public ProfessorService(ProfessorRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    public Professor criar(String area, UUID usuarioId) throws SQLException {
        Usuario usuario = usuarioRepository.buscarPorId(usuarioId);
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário informado não existe");
        }

        Professor existente = repository.buscarPorUsuarioId(usuarioId);
        if (existente != null) {
            throw new IllegalArgumentException("Usuário já está vinculado a um professor");
        }

        Professor professor = new Professor(UUID.randomUUID(), area, usuario);
        repository.criar(professor);
        return professor;
    }

    public List<Professor> listarTodos() throws SQLException {
        return repository.listarTodos();
    }

    public List<Professor> listarPorAluno(UUID alunoId) throws SQLException {
        return repository.listarPorAluno(alunoId);
    }

    public List<ProvaTutorDTO> listarProvasComTutor(UUID alunoId) throws SQLException {
        List<ProvaTutorDTO> resultados = repository.listarProvasComTutor(alunoId);
        List<ProvaTutorDTO> prontos = new ArrayList<>();
        for (ProvaTutorDTO linha : resultados) {
            prontos.add(new ProvaTutorDTO(
                    linha.getAvaliacaoId(),
                    linha.getDescricao(),
                    linha.getData(),
                    linha.getHorario(),
                    linha.getTotalQuestoes(),
                    linha.getRespondidas(),
                    linha.getProfessorId(),
                    linha.getProfessorEmail(),
                    nomeAmigavel(linha.getProfessorEmail()),
                    linha.getProfessorArea()
            ));
        }
        return prontos;
    }

    public Professor buscarPorId(UUID id) throws SQLException {
        return repository.buscarPorId(id);
    }

    public Professor atualizar(UUID id, String area) throws SQLException {
        Professor existente = repository.buscarPorId(id);
        if (existente == null) {
            throw new IllegalArgumentException("Professor não encontrado");
        }

        if (area != null && !area.isBlank()) {
            existente.setArea(area);
        }

        repository.atualizar(existente);
        return existente;
    }

    public void deletar(UUID id) throws SQLException {
        Professor existente = repository.buscarPorId(id);
        if (existente == null) {
            throw new IllegalArgumentException("Professor não encontrado");
        }

        boolean removido = repository.deletar(id);
        if (removido && existente.getUsuarioId() != null) {
            usuarioRepository.deletar(existente.getUsuarioId());
        } else if (!removido) {
            throw new IllegalArgumentException("Professor não encontrado");
        }
    }

    private String nomeAmigavel(String email) {
        if (email == null || email.isBlank()) {
            return "Tutor";
        }
        String base = email.split("@")[0];
        String[] partes = base.split("[._-]");
        StringBuilder nome = new StringBuilder();
        for (String parte : partes) {
            if (parte.isBlank()) {
                continue;
            }
            if (nome.length() > 0) {
                nome.append(" ");
            }
            nome.append(Character.toUpperCase(parte.charAt(0))).append(parte.substring(1));
        }
        return nome.length() > 0 ? nome.toString() : email;
    }
}
