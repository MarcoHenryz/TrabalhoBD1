package com.uel.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Avaliacao {
  private UUID id;
  private String descricao;
  private LocalDate data;
  private LocalTime horario;
  private List<AvaliacaoParticipacao> participacoes = new ArrayList<>();

  public Avaliacao() {}

  public Avaliacao(UUID id, String descricao, LocalDate data, LocalTime horario) {
    this.id = id;
    this.descricao = descricao;
    this.data = data;
    this.horario = horario;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getDescricao() {
    return descricao;
  }

  public void setDescricao(String descricao) {
    this.descricao = descricao;
  }

  public LocalDate getData() {
    return data;
  }

  public void setData(LocalDate data) {
    this.data = data;
  }

  public LocalTime getHorario() {
    return horario;
  }

  public void setHorario(LocalTime horario) {
    this.horario = horario;
  }

  public List<AvaliacaoParticipacao> getParticipacoes() {
    return participacoes;
  }

  public void setParticipacoes(List<AvaliacaoParticipacao> participacoes) {
    this.participacoes = participacoes == null ? new ArrayList<>() : participacoes;
  }
}
