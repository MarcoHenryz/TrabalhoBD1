package com.uel.entity;

import java.util.UUID;

public class Professor {

    private UUID id;
    private String area;
    private Usuario usuario;

    public Professor() {
    }

    public Professor(UUID id, String area, Usuario usuario) {
        this.id = id;
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

    public UUID getUsuarioId() {
        return usuario != null ? usuario.getId() : null;
    }

    public void setUsuarioId(Usuario usuario) {
        this.usuario = usuario;
    }

}
