package com.uel.entity;

import java.util.UUID;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;

public class Questao {

    private UUID id;
    private String enunciado;
    private String tema;
    private TipoQuestao tipo;
    private Dificuldade dificuldade;
    private String respostaEsperada;
    private UUID professorId;

    public Questao() {
    }

    public Questao(UUID id, String enunciado, String tema, int nivelDificuldade, TipoQuestao tipo,
            Dificuldade dificuldade, String respostaEsperada, UUID professorId) {
        this.id = id;
        this.enunciado = enunciado;
        this.tema = tema;
        this.tipo = tipo;
        this.dificuldade = dificuldade;
        this.respostaEsperada = respostaEsperada;
        this.professorId = professorId;
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

    public Dificuldade getNivelDificuldade() {
        return dificuldade;
    }

    public void setNivelDificuldade(Dificuldade nivelDificuldade) {
        this.dificuldade = nivelDificuldade;
    }

    public UUID getProfessorId() {
        return professorId;
    }

    public void setProfessorId(UUID professorId) {
        this.professorId = professorId;
    }

    public TipoQuestao getTipo() {
        return tipo;
    }

    public void setTipo(TipoQuestao tipo) {
        this.tipo = tipo;
    }

    public String getRespostaEsperada() {
        return respostaEsperada;
    }

    public void setRespostaEsperada(String respostaEsperada) {
        this.respostaEsperada = respostaEsperada;
    }

}
