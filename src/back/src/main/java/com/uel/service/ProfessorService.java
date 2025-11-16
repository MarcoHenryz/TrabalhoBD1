package com.uel.service;

import com.uel.entity.Professor;
import com.uel.entity.Usuario;
import com.uel.repository.ProfessorRepository;
import com.uel.repository.UsuarioRepository;
import java.sql.SQLException;
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
}