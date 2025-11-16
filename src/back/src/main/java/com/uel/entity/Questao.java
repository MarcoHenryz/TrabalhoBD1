package com.uel.entity;

import java.util.UUID;

public class Questao {

    private UUID id;
    private String enunciado;
    private String tema;
    private int nivelDificuldade;

    public Questao() {
    }

    public Questao(UUID id, String enunciado, String tema, int nivelDificuldade) {
        this.id = id;
        this.enunciado = enunciado;
        this.tema = tema;
        this.nivelDificuldade = nivelDificuldade;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public int getNivelDificuldade() {
        return nivelDificuldade;
    }

    public void setNivelDificuldade(int nivelDificuldade) {
        this.nivelDificuldade = nivelDificuldade;
    }

}
