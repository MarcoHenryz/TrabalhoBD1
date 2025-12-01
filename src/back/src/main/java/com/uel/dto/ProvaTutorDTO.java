package com.uel.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class ProvaTutorDTO {
    private UUID avaliacaoId;
    private String descricao;
    private LocalDate data;
    private LocalTime horario;
    private int totalQuestoes;
    private int respondidas;
    private UUID professorId;
    private String professorEmail;
    private String professorNome;
    private String professorArea;

    public ProvaTutorDTO(
            UUID avaliacaoId,
            String descricao,
            LocalDate data,
            LocalTime horario,
            int totalQuestoes,
            int respondidas,
            UUID professorId,
            String professorEmail,
            String professorNome,
            String professorArea) {
        this.avaliacaoId = avaliacaoId;
        this.descricao = descricao;
        this.data = data;
        this.horario = horario;
        this.totalQuestoes = totalQuestoes;
        this.respondidas = respondidas;
        this.professorId = professorId;
        this.professorEmail = professorEmail;
        this.professorNome = professorNome;
        this.professorArea = professorArea;
    }

    public UUID getAvaliacaoId() {
        return avaliacaoId;
    }

    public String getDescricao() {
        return descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public int getTotalQuestoes() {
        return totalQuestoes;
    }

    public int getRespondidas() {
        return respondidas;
    }

    public UUID getProfessorId() {
        return professorId;
    }

    public String getProfessorEmail() {
        return professorEmail;
    }

    public String getProfessorNome() {
        return professorNome;
    }

    public String getProfessorArea() {
        return professorArea;
    }
}
