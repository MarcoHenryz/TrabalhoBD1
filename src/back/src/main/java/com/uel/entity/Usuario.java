package com.uel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

public class Usuario {
  private UUID id;
  private String email;
  private String salt;
  private String hashSenha;

  public Usuario() {}

  public Usuario(UUID id, String email, String salt, String hashSenha) {
    this.id = id;
    this.email = email;
    this.salt = salt;
    this.hashSenha = hashSenha;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  @JsonIgnore
  public String getSalt() {
    return salt;
  }

  public void setSalt(String salt) {
    this.salt = salt;
  }

  @JsonIgnore
  public String getHashSenha() {
    return hashSenha;
  }

  public void setHashSenha(String hashSenha) {
    this.hashSenha = hashSenha;
  }
}
