package com.uel.entity;

import java.util.UUID;

public class Professor {

    private UUID id;
    private String area;
    private Usuario usuario;

    private Professor() {
    }

    public Professor(String area, Usuario usuario) {
        this.id = UUID.randomUUID();
        this.area = area;
        this.usuario = usuario;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

}
