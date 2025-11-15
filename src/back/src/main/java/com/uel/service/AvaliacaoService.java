package com.uel.service;

import com.uel.entity.Aluno;
import com.uel.entity.Avaliacao;
import com.uel.entity.AvaliacaoParticipacao;
import com.uel.repository.AlunoRepository;
import com.uel.repository.AvaliacaoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AvaliacaoService {
  private final AvaliacaoRepository avaliacaoRepository;
  private final AlunoRepository alunoRepository;

  public AvaliacaoService(AvaliacaoRepository avaliacaoRepository, AlunoRepository alunoRepository) {
    this.avaliacaoRepository = avaliacaoRepository;
    this.alunoRepository = alunoRepository;
  }

  public Avaliacao criar(String descricao, LocalDate data, LocalTime horario, List<AvaliacaoParticipacao> participacoes)
    throws SQLException {
    Avaliacao avaliacao = new Avaliacao(UUID.randomUUID(), descricao, data, horario);
    avaliacao.setParticipacoes(prepararParticipacoes(avaliacao.getId(), participacoes));
    avaliacaoRepository.criar(avaliacao);
    return avaliacaoRepository.buscarPorId(avaliacao.getId());
  }

  public List<Avaliacao> listarTodas() throws SQLException {
    return avaliacaoRepository.listarTodas();
  }

  public Avaliacao buscarPorId(UUID id) throws SQLException {
    return avaliacaoRepository.buscarPorId(id);
  }

  public Avaliacao atualizar(
    UUID id,
    String descricao,
    LocalDate data,
    LocalTime horario,
    List<AvaliacaoParticipacao> novasParticipacoes
  ) throws SQLException {
    Avaliacao existente = avaliacaoRepository.buscarPorId(id);
    if (existente == null) {
      throw new IllegalArgumentException("Avaliação não encontrada");
    }

    if (descricao != null && !descricao.isBlank()) {
      existente.setDescricao(descricao);
    }
    if (data != null) {
      existente.setData(data);
    }
    if (horario != null) {
      existente.setHorario(horario);
    }
    if (novasParticipacoes != null) {
      existente.setParticipacoes(prepararParticipacoes(existente.getId(), novasParticipacoes));
    }

    avaliacaoRepository.atualizar(existente);
    return avaliacaoRepository.buscarPorId(id);
  }

  public void deletar(UUID id) throws SQLException {
    boolean removida = avaliacaoRepository.deletar(id);
    if (!removida) {
      throw new IllegalArgumentException("Avaliação não encontrada");
    }
  }

  private List<AvaliacaoParticipacao> prepararParticipacoes(UUID avaliacaoId, List<AvaliacaoParticipacao> participacoes)
    throws SQLException {
    if (participacoes == null) {
      return new ArrayList<>();
    }

    Set<UUID> alunosProcessados = new HashSet<>();
    List<AvaliacaoParticipacao> prontas = new ArrayList<>();
    for (AvaliacaoParticipacao participacao : participacoes) {
      if (participacao.getAlunoId() == null) {
        throw new IllegalArgumentException("Aluno é obrigatório na participação");
      }
      if (!alunosProcessados.add(participacao.getAlunoId())) {
        throw new IllegalArgumentException("Aluno duplicado na mesma avaliação");
      }
      Aluno aluno = alunoRepository.buscarPorId(participacao.getAlunoId());
      if (aluno == null) {
        throw new IllegalArgumentException("Aluno informado não existe: " + participacao.getAlunoId());
      }

      BigDecimal nota = participacao.getNota();
      if (nota != null) {
        nota = nota.setScale(2, RoundingMode.HALF_UP);
      }
      AvaliacaoParticipacao nova = new AvaliacaoParticipacao(avaliacaoId, aluno.getId(), nota);
      nova.setAluno(aluno);
      prontas.add(nova);
    }

    return prontas;
  }
}
