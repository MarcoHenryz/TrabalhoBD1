package com.uel.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RespostaAluno {
    private UUID id;
    private UUID avaliacaoId;
    private UUID alunoId;
    private UUID questaoId;

    private UUID alternativaEscolhidaId;

    private UUID voufItemId;
    private Boolean voufResposta;
    private String respostaTexto;

    private BigDecimal nota;
    private LocalDateTime respondidoEm;
    private Boolean corrigido;

    public RespostaAluno() {
    }

    public RespostaAluno(UUID id, UUID avaliacaoId, UUID alunoId, UUID questaoId) {
        this.id = id;
        this.avaliacaoId = avaliacaoId;
        this.alunoId = alunoId;
        this.questaoId = questaoId;
        this.corrigido = false;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public UUID getQuestaoId() {
        return questaoId;
    }

    public void setQuestaoId(UUID questaoId) {
        this.questaoId = questaoId;
    }

    public UUID getAlternativaEscolhidaId() {
        return alternativaEscolhidaId;
    }

    public void setAlternativaEscolhidaId(UUID alternativaEscolhidaId) {
        this.alternativaEscolhidaId = alternativaEscolhidaId;
    }

    public UUID getVoufItemId() {
        return voufItemId;
    }

    public void setVoufItemId(UUID voufItemId) {
        this.voufItemId = voufItemId;
    }

    public Boolean getVoufResposta() {
        return voufResposta;
    }

    public void setVoufResposta(Boolean voufResposta) {
        this.voufResposta = voufResposta;
    }

    public String getRespostaTexto() {
        return respostaTexto;
    }

    public void setRespostaTexto(String respostaTexto) {
        this.respostaTexto = respostaTexto;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public LocalDateTime getRespondidoEm() {
        return respondidoEm;
    }

    public void setRespondidoEm(LocalDateTime respondidoEm) {
        this.respondidoEm = respondidoEm;
    }

    public Boolean getCorrigido() {
        return corrigido;
    }

    public void setCorrigido(Boolean corrigido) {
        this.corrigido = corrigido;
    }
}
