package com.uel.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class Aluno {
  private UUID id;
  private String matricula;
  private BigDecimal media;
  private LocalDate dataInicio;
  private LocalDate dataConclusao;

  public Aluno() {}

  public Aluno(UUID id, String matricula, BigDecimal media, LocalDate dataInicio, LocalDate dataConclusao) {
    this.id = id;
    this.matricula = matricula;
    this.media = media;
    this.dataInicio = dataInicio;
    this.dataConclusao = dataConclusao;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getMatricula() {
    return matricula;
  }

  public void setMatricula(String matricula) {
    this.matricula = matricula;
  }

  public BigDecimal getMedia() {
    return media;
  }

  public void setMedia(BigDecimal media) {
    this.media = media;
  }

  public LocalDate getDataInicio() {
    return dataInicio;
  }

  public void setDataInicio(LocalDate dataInicio) {
    this.dataInicio = dataInicio;
  }

  public LocalDate getDataConclusao() {
    return dataConclusao;
  }

  public void setDataConclusao(LocalDate dataConclusao) {
    this.dataConclusao = dataConclusao;
  }
}
