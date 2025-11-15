package com.uel.entity;

import java.math.BigDecimal;
import java.util.UUID;

public class AvaliacaoParticipacao {
  private UUID avaliacaoId;
  private UUID alunoId;
  private BigDecimal nota;
  private Aluno aluno;

  public AvaliacaoParticipacao() {}

  public AvaliacaoParticipacao(UUID avaliacaoId, UUID alunoId, BigDecimal nota) {
    this.avaliacaoId = avaliacaoId;
    this.alunoId = alunoId;
    this.nota = nota;
  }

  public UUID getAvaliacaoId() {
    return avaliacaoId;
  }

  public void setAvaliacaoId(UUID avaliacaoId) {
    this.avaliacaoId = avaliacaoId;
  }

  public UUID getAlunoId() {
    return alunoId;
  }

  public void setAlunoId(UUID alunoId) {
    this.alunoId = alunoId;
  }

  public BigDecimal getNota() {
    return nota;
  }

  public void setNota(BigDecimal nota) {
    this.nota = nota;
  }

  public Aluno getAluno() {
    return aluno;
  }

  public void setAluno(Aluno aluno) {
    this.aluno = aluno;
  }
}
