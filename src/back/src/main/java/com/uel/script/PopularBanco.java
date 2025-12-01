package com.uel.script;

import com.uel.controller.QuestaoController.AlternativaRequest;
import com.uel.controller.QuestaoController.VoufRequest;
import com.uel.entity.Alternativa;
import com.uel.entity.Aluno;
import com.uel.entity.Avaliacao;
import com.uel.entity.AvaliacaoParticipacao;
import com.uel.entity.Professor;
import com.uel.entity.Questao;
import com.uel.entity.Usuario;
import com.uel.entity.Vouf;
import com.uel.entity.RespostaAluno;
import com.uel.enums.Dificuldade;
import com.uel.enums.TipoQuestao;
import com.uel.repository.AlternativaRepository;
import com.uel.repository.VoufRepository;
import com.uel.service.AlunoService;
import com.uel.service.AvaliacaoQuestaoService;
import com.uel.service.AvaliacaoService;
import com.uel.service.ProfessorService;
import com.uel.service.QuestaoService;
import com.uel.service.RespostaAlunoService;
import com.uel.service.UsuarioService;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.uel")
public class PopularBanco {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(PopularBanco.class);
    // Desabilita o servidor web para executar apenas o script
    app.setWebApplicationType(org.springframework.boot.WebApplicationType.NONE);
    app.run(args);
  }

  @Bean
  public CommandLineRunner popularDados(
      UsuarioService usuarioService,
      AlunoService alunoService,
      ProfessorService professorService,
      QuestaoService questaoService,
      AvaliacaoService avaliacaoService,
      AvaliacaoQuestaoService avaliacaoQuestaoService,
      RespostaAlunoService respostaAlunoService,
      AlternativaRepository alternativaRepository,
      VoufRepository voufRepository,
      DataSource dataSource) {
    return args -> {
      System.out.println("=== Iniciando população do banco de dados ===");

      try {
        limparBanco(dataSource);

        System.out.println("\nCriando professores e alunos (senha padrão: 'senha')...");
        // Garante que usuários antigos com o mesmo e-mail não gerem conflito
        removerUsuarioPorEmail(dataSource, "professor1@email.com");
        removerUsuarioPorEmail(dataSource, "professor2@email.com");
        removerUsuarioPorEmail(dataSource, "professor3@email.com");
        removerUsuarioPorEmail(dataSource, "aluno1@email.com");
        removerUsuarioPorEmail(dataSource, "aluno2@email.com");
        removerUsuarioPorEmail(dataSource, "aluno3@email.com");
        removerUsuarioPorEmail(dataSource, "aluno4@email.com");
        removerUsuarioPorEmail(dataSource, "aluno5@email.com");

        Usuario profUser1 = getOrCreateUsuario(usuarioService, "professor1@email.com", "senha");
        Professor professor1 = getOrCreateProfessor(professorService, profUser1, "Algoritmos");

        Usuario profUser2 = getOrCreateUsuario(usuarioService, "professor2@email.com", "senha");
        Professor professor2 = getOrCreateProfessor(professorService, profUser2, "Banco de Dados");

        Usuario profUser3 = getOrCreateUsuario(usuarioService, "professor3@email.com", "senha");
        Professor professor3 = getOrCreateProfessor(professorService, profUser3, "Estruturas de Dados");

        List<Aluno> alunos = new ArrayList<>();
        alunos.add(getOrCreateAluno(alunoService, usuarioService, "A0001", "aluno1@email.com"));
        alunos.add(getOrCreateAluno(alunoService, usuarioService, "A0002", "aluno2@email.com"));
        alunos.add(getOrCreateAluno(alunoService, usuarioService, "A0003", "aluno3@email.com"));
        alunos.add(getOrCreateAluno(alunoService, usuarioService, "A0004", "aluno4@email.com"));
        alunos.add(getOrCreateAluno(alunoService, usuarioService, "A0005", "aluno5@email.com"));

        alunoService.atualizarMedia(alunos.get(0).getId(), new BigDecimal("7.5"));
        alunoService.atualizarMedia(alunos.get(1).getId(), new BigDecimal("8.2"));
        alunoService.atualizarMedia(alunos.get(2).getId(), new BigDecimal("6.9"));
        alunoService.atualizarMedia(alunos.get(3).getId(), new BigDecimal("8.7"));
        alunoService.atualizarMedia(alunos.get(4).getId(), new BigDecimal("7.9"));

        System.out.println("Professores: " + professor1.getId() + " e " + professor2.getId());
        System.out.println("Alunos criados: " + alunos.size());

        System.out.println("\nCriando 15 questões...");
        Questao q1 = questaoService.criar(
            "Qual a complexidade de tempo média da busca binária?",
            "Algoritmos",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor1.getId(),
            List.of(
                new AlternativaRequest("O(log n)", true),
                new AlternativaRequest("O(n)", false),
                new AlternativaRequest("O(n²)", false)
            ),
            null
        );

        Questao q2 = questaoService.criar(
            "Qual comando SQL cria uma tabela nova?",
            "SQL",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor2.getId(),
            List.of(
                new AlternativaRequest("CREATE TABLE", true),
                new AlternativaRequest("INSERT INTO", false),
                new AlternativaRequest("UPDATE TABLE", false)
            ),
            null
        );

        Questao q3 = questaoService.criar(
            "Índices costumam acelerar consultas de leitura.",
            "Banco de Dados",
            TipoQuestao.VOUF,
            Dificuldade.FACIL,
            null,
            professor2.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", true))
        );

        Questao q4 = questaoService.criar(
            "O verbo HTTP PUT é idempotente por padrão.",
            "Web",
            TipoQuestao.VOUF,
            Dificuldade.MEDIO,
            null,
            professor1.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", true))
        );

        Questao q5 = questaoService.criar(
            "Explique rapidamente o que é 3FN (Terceira Forma Normal).",
            "Modelagem",
            TipoQuestao.DISSERTATIVA,
            Dificuldade.MEDIO,
            "Resposta descrevendo eliminação de dependências transitivas",
            professor2.getId(),
            null,
            null
        );

        Questao q6 = questaoService.criar(
            "Para que serve o controle de versão em projetos de software?",
            "Processos",
            TipoQuestao.DISSERTATIVA,
            Dificuldade.FACIL,
            "Guardar histórico e permitir colaboração",
            professor1.getId(),
            null,
            null
        );

        Questao q7 = questaoService.criar(
            "Qual JOIN retorna apenas correspondências entre tabelas?",
            "SQL",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor2.getId(),
            List.of(
                new AlternativaRequest("INNER JOIN", true),
                new AlternativaRequest("LEFT JOIN", false),
                new AlternativaRequest("CROSS JOIN", false)
            ),
            null
        );

        Questao q8 = questaoService.criar(
            "Qual cláusula filtra linhas em uma consulta SQL?",
            "SQL",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor2.getId(),
            List.of(
                new AlternativaRequest("WHERE", true),
                new AlternativaRequest("GROUP BY", false),
                new AlternativaRequest("ORDER BY", false)
            ),
            null
        );

        Questao q9 = questaoService.criar(
            "O comando COMMIT finaliza a transação atual.",
            "Transações",
            TipoQuestao.VOUF,
            Dificuldade.FACIL,
            null,
            professor1.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", true))
        );

        Questao q10 = questaoService.criar(
            "Quando vale a pena criar um índice composto?",
            "Otimização",
            TipoQuestao.DISSERTATIVA,
            Dificuldade.DIFICIL,
            "Quando as colunas são filtradas juntas com frequência",
            professor1.getId(),
            null,
            null
        );

        Questao q11 = questaoService.criar(
            "Para que serve o comando 'git branch'?",
            "Controle de Versão",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor1.getId(),
            List.of(
                new AlternativaRequest("Criar ou listar ramificações", true),
                new AlternativaRequest("Enviar código ao repositório remoto", false),
                new AlternativaRequest("Mesclar duas branches", false)
            ),
            null
        );

        Questao q12 = questaoService.criar(
            "A normalização de dados reduz redundância e anomalias de atualização.",
            "Modelagem",
            TipoQuestao.VOUF,
            Dificuldade.FACIL,
            null,
            professor2.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", true))
        );

        Questao q13 = questaoService.criar(
            "Descreva brevemente as propriedades ACID de uma transação.",
            "Transações",
            TipoQuestao.DISSERTATIVA,
            Dificuldade.MEDIO,
            "Atomicidade, Consistência, Isolamento, Durabilidade",
            professor2.getId(),
            null,
            null
        );

        Questao q14 = questaoService.criar(
            "Qual estrutura de dados segue o princípio LIFO?",
            "Estruturas de Dados",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.FACIL,
            null,
            professor1.getId(),
            List.of(
                new AlternativaRequest("Pilha", true),
                new AlternativaRequest("Fila", false),
                new AlternativaRequest("Árvore", false)
            ),
            null
        );

        Questao q15 = questaoService.criar(
            "É recomendável manter transações abertas por longos períodos.",
            "Transações",
            TipoQuestao.VOUF,
            Dificuldade.MEDIO,
            null,
            professor2.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", false))
        );

        Questao q16 = questaoService.criar(
            "Qual estrutura permite busca e inserção em O(log n)?",
            "Estruturas de Dados",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.MEDIO,
            null,
            professor3.getId(),
            List.of(
                new AlternativaRequest("Árvore balanceada", true),
                new AlternativaRequest("Lista encadeada", false),
                new AlternativaRequest("Tabela não indexada", false)
            ),
            null
        );

        Questao q17 = questaoService.criar(
            "Hashing perfeito elimina colisões?",
            "Estruturas de Dados",
            TipoQuestao.VOUF,
            Dificuldade.DIFICIL,
            null,
            professor3.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", false))
        );

        Questao q18 = questaoService.criar(
            "Explique quando usar fila de prioridade.",
            "Estruturas de Dados",
            TipoQuestao.DISSERTATIVA,
            Dificuldade.MEDIO,
            "Quando tarefas precisam sair pela maior prioridade",
            professor3.getId(),
            null,
            null
        );

        Questao q19 = questaoService.criar(
            "Qual instrução define chave estrangeira em SQL?",
            "SQL Avançado",
            TipoQuestao.MULTIPLA_ESCOLHA,
            Dificuldade.MEDIO,
            null,
            professor2.getId(),
            List.of(
                new AlternativaRequest("FOREIGN KEY ... REFERENCES", true),
                new AlternativaRequest("PRIMARY KEY", false),
                new AlternativaRequest("UNIQUE", false)
            ),
            null
        );

        Questao q20 = questaoService.criar(
            "Filas são FIFO e Pilhas são LIFO.",
            "Estruturas de Dados",
            TipoQuestao.VOUF,
            Dificuldade.FACIL,
            null,
            professor3.getId(),
            null,
            List.of(new VoufRequest("A afirmação é", true))
        );

        System.out.println("Questões criadas.");

        System.out.println("\nCriando 5 avaliações e vinculando questões...");
        Avaliacao avaliacao1 = avaliacaoService.criar(
            "Prova Fundamentos de Algoritmos",
            LocalDate.now().plusDays(7),
            LocalTime.of(9, 0),
            participacoes(alunos)
        );

        Avaliacao avaliacao2 = avaliacaoService.criar(
            "Prova Banco de Dados Aplicada",
            LocalDate.now().plusDays(14),
            LocalTime.of(19, 0),
            participacoes(alunos)
        );

        Avaliacao avaliacao3 = avaliacaoService.criar(
            "Prova Git e Modelagem de Dados",
            LocalDate.now().plusDays(21),
            LocalTime.of(10, 30),
            participacoes(alunos)
        );

        Avaliacao avaliacao4 = avaliacaoService.criar(
            "Revisão Integrada Algoritmos e BD",
            LocalDate.now().plusDays(28),
            LocalTime.of(8, 30),
            participacoes(alunos)
        );

        Avaliacao avaliacao5 = avaliacaoService.criar(
            "Prova SQL Consolidada",
            LocalDate.now().plusDays(35),
            LocalTime.of(18, 30),
            participacoes(alunos)
        );

        Avaliacao avaliacao6 = avaliacaoService.criar(
            "Estruturas I - Árvores e Hash",
            LocalDate.now().plusDays(42),
            LocalTime.of(14, 0),
            participacoes(alunos)
        );

        Avaliacao avaliacao7 = avaliacaoService.criar(
            "Estruturas II - Filas e Pilhas",
            LocalDate.now().plusDays(49),
            LocalTime.of(16, 0),
            participacoes(alunos)
        );

        Avaliacao avaliacao8 = avaliacaoService.criar(
            "SQL Avançado e Índices",
            LocalDate.now().plusDays(56),
            LocalTime.of(9, 30),
            participacoes(alunos)
        );

        Avaliacao avaliacao9 = avaliacaoService.criar(
            "Laboratório de Performance",
            LocalDate.now().plusDays(63),
            LocalTime.of(11, 0),
            participacoes(alunos)
        );

        Avaliacao avaliacao10 = avaliacaoService.criar(
            "Revisão Final Integrada",
            LocalDate.now().plusDays(70),
            LocalTime.of(19, 0),
            participacoes(alunos)
        );

        // Avaliação 1 recebe as 5 primeiras questões
        adicionarQuestao(avaliacaoQuestaoService, avaliacao1, q1, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao1, q2, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao1, q3, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao1, q4, 4);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao1, q5, 5);

        // Avaliação 2 foca em desenvolvimento e otimização
        adicionarQuestao(avaliacaoQuestaoService, avaliacao2, q6, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao2, q7, 2); // professor2 (dono)
        adicionarQuestao(avaliacaoQuestaoService, avaliacao2, q8, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao2, q9, 4);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao2, q10, 5);

        // Avaliação 3 mistura Git e modelagem
        adicionarQuestao(avaliacaoQuestaoService, avaliacao3, q11, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao3, q12, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao3, q13, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao3, q14, 4);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao3, q15, 5);

        // Avaliação 4 revisita conceitos anteriores
        adicionarQuestao(avaliacaoQuestaoService, avaliacao4, q1, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao4, q6, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao4, q8, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao4, q12, 4);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao4, q14, 5);

        // Avaliação 5 consolida SQL e fundamentos
        adicionarQuestao(avaliacaoQuestaoService, avaliacao5, q2, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao5, q3, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao5, q5, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao5, q7, 4);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao5, q11, 5);

        // Avaliação 6 traz árvores e hashing
        adicionarQuestao(avaliacaoQuestaoService, avaliacao6, q16, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao6, q17, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao6, q20, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao6, q10, 4);
        // Inclui q18 porque há respostas para ela nesta avaliação
        adicionarQuestao(avaliacaoQuestaoService, avaliacao6, q18, 5);

        // Avaliação 7 explora filas/pilhas
        adicionarQuestao(avaliacaoQuestaoService, avaliacao7, q14, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao7, q18, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao7, q20, 3);

        // Avaliação 8 foca em SQL avançado
        adicionarQuestao(avaliacaoQuestaoService, avaliacao8, q19, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao8, q2, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao8, q3, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao8, q15, 4);

        // Avaliação 9 mistura performance e algoritmos
        adicionarQuestao(avaliacaoQuestaoService, avaliacao9, q1, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao9, q4, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao9, q16, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao9, q18, 4);

        // Avaliação 10 fecha com revisão geral
        adicionarQuestao(avaliacaoQuestaoService, avaliacao10, q7, 1);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao10, q12, 2);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao10, q13, 3);
        adicionarQuestao(avaliacaoQuestaoService, avaliacao10, q19, 4);

        System.out.println("Avaliações criadas: "
            + avaliacao1.getId() + ", "
            + avaliacao2.getId() + ", "
            + avaliacao3.getId() + ", "
            + avaliacao4.getId() + ", "
            + avaliacao5.getId() + ", "
            + avaliacao6.getId() + ", "
            + avaliacao7.getId() + ", "
            + avaliacao8.getId() + ", "
            + avaliacao9.getId() + " e "
            + avaliacao10.getId());

        System.out.println("\nRegistrando respostas de alguns alunos (nem todos respondem tudo)...");
        Map<Questao, List<Alternativa>> alternativas = new HashMap<>();
        alternativas.put(q1, alternativaRepository.buscarPorQuestaoId(q1.getId()));
        alternativas.put(q2, alternativaRepository.buscarPorQuestaoId(q2.getId()));
        alternativas.put(q7, alternativaRepository.buscarPorQuestaoId(q7.getId()));
        alternativas.put(q8, alternativaRepository.buscarPorQuestaoId(q8.getId()));
        alternativas.put(q11, alternativaRepository.buscarPorQuestaoId(q11.getId()));
        alternativas.put(q14, alternativaRepository.buscarPorQuestaoId(q14.getId()));
        alternativas.put(q16, alternativaRepository.buscarPorQuestaoId(q16.getId()));
        alternativas.put(q19, alternativaRepository.buscarPorQuestaoId(q19.getId()));

        Map<Questao, List<Vouf>> itensVouf = new HashMap<>();
        itensVouf.put(q3, voufRepository.buscarPorQuestaoId(q3.getId()));
        itensVouf.put(q4, voufRepository.buscarPorQuestaoId(q4.getId()));
        itensVouf.put(q9, voufRepository.buscarPorQuestaoId(q9.getId()));
        itensVouf.put(q12, voufRepository.buscarPorQuestaoId(q12.getId()));
        itensVouf.put(q15, voufRepository.buscarPorQuestaoId(q15.getId()));
        itensVouf.put(q17, voufRepository.buscarPorQuestaoId(q17.getId()));
        itensVouf.put(q20, voufRepository.buscarPorQuestaoId(q20.getId()));

        List<RespostaAluno> dissertativasParaCorrigir = new ArrayList<>();

        // Avaliação 1 respostas
        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(0).getId(), q1.getId(), alternativaCorreta(alternativas.get(q1)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(0).getId(), q3.getId(), null, itensVouf.get(q3).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(0).getId(), q5.getId(), null, null, null, "Normaliza até remover dependências transitivas."));

        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(1).getId(), q1.getId(), alternativaErrada(alternativas.get(q1)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(1).getId(), q2.getId(), alternativaCorreta(alternativas.get(q2)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(1).getId(), q4.getId(), null, itensVouf.get(q4).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(2).getId(), q1.getId(), alternativaCorreta(alternativas.get(q1)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(2).getId(), q2.getId(), alternativaErrada(alternativas.get(q2)), null, null, null);

        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(3).getId(), q3.getId(), null, itensVouf.get(q3).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao1.getId(), alunos.get(4).getId(), q2.getId(), alternativaCorreta(alternativas.get(q2)), null, null, null);

        // Avaliação 2 respostas
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(0).getId(), q6.getId(), null, null, null, "Permite colaboração segura e histórico de mudanças."));
        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(0).getId(), q7.getId(), alternativaCorreta(alternativas.get(q7)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(0).getId(), q9.getId(), null, itensVouf.get(q9).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(1).getId(), q7.getId(), alternativaErrada(alternativas.get(q7)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(1).getId(), q8.getId(), alternativaCorreta(alternativas.get(q8)), null, null, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(1).getId(), q10.getId(), null, null, null, "Quando consultas usam várias colunas juntas com frequência."));

        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(2).getId(), q6.getId(), null, null, null, "Mantém histórico e facilita rollback."));
        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(2).getId(), q9.getId(), null, itensVouf.get(q9).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(3).getId(), q7.getId(), alternativaCorreta(alternativas.get(q7)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(3).getId(), q8.getId(), alternativaCorreta(alternativas.get(q8)), null, null, null);

        respostaAlunoService.responderQuestao(avaliacao2.getId(), alunos.get(4).getId(), q8.getId(), alternativaCorreta(alternativas.get(q8)), null, null, null);

        // Avaliação 3 respostas
        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(0).getId(), q11.getId(), alternativaCorreta(alternativas.get(q11)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(0).getId(), q12.getId(), null, itensVouf.get(q12).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(0).getId(), q13.getId(), null, null, null, "ACID garante atomicidade, consistência, isolamento e durabilidade."));
        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(0).getId(), q14.getId(), alternativaCorreta(alternativas.get(q14)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(0).getId(), q15.getId(), null, itensVouf.get(q15).getFirst().getId(), false, null);

        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(4).getId(), q11.getId(), alternativaErrada(alternativas.get(q11)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao3.getId(), alunos.get(4).getId(), q14.getId(), alternativaCorreta(alternativas.get(q14)), null, null, null);

        // Avaliação 4 respostas
        respostaAlunoService.responderQuestao(avaliacao4.getId(), alunos.get(1).getId(), q1.getId(), alternativaCorreta(alternativas.get(q1)), null, null, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao4.getId(), alunos.get(1).getId(), q6.getId(), null, null, null, "Controle de versão guarda histórico e facilita auditoria."));
        respostaAlunoService.responderQuestao(avaliacao4.getId(), alunos.get(1).getId(), q12.getId(), null, itensVouf.get(q12).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao4.getId(), alunos.get(2).getId(), q8.getId(), alternativaCorreta(alternativas.get(q8)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao4.getId(), alunos.get(2).getId(), q14.getId(), alternativaCorreta(alternativas.get(q14)), null, null, null);

        // Avaliação 5 respostas
        respostaAlunoService.responderQuestao(avaliacao5.getId(), alunos.get(2).getId(), q2.getId(), alternativaCorreta(alternativas.get(q2)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao5.getId(), alunos.get(2).getId(), q3.getId(), null, itensVouf.get(q3).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao5.getId(), alunos.get(2).getId(), q5.getId(), null, null, null, "Elimina dependências transitivas e redundâncias."));

        respostaAlunoService.responderQuestao(avaliacao5.getId(), alunos.get(3).getId(), q7.getId(), alternativaErrada(alternativas.get(q7)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao5.getId(), alunos.get(3).getId(), q11.getId(), alternativaCorreta(alternativas.get(q11)), null, null, null);

        // Avaliação 6 respostas
        respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(0).getId(), q16.getId(), alternativaCorreta(alternativas.get(q16)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(0).getId(), q17.getId(), null, itensVouf.get(q17).getFirst().getId(), false, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(0).getId(), q18.getId(), null, null, null, "Usar quando eventos precisam sair em prioridade."));

        respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(1).getId(), q16.getId(), alternativaErrada(alternativas.get(q16)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(1).getId(), q20.getId(), null, itensVouf.get(q20).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(2).getId(), q17.getId(), null, itensVouf.get(q17).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(2).getId(), q10.getId(), null, null, null, "Índices compostos quando filtros combinam colunas."));
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao6.getId(), alunos.get(2).getId(), q18.getId(), null, null, null, "Fila de prioridade para escalonar jobs críticos."));

        // Avaliação 7 respostas
        respostaAlunoService.responderQuestao(avaliacao7.getId(), alunos.get(0).getId(), q14.getId(), alternativaCorreta(alternativas.get(q14)), null, null, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao7.getId(), alunos.get(0).getId(), q18.getId(), null, null, null, "Usar fila de prioridade para eventos urgentes."));
        respostaAlunoService.responderQuestao(avaliacao7.getId(), alunos.get(0).getId(), q20.getId(), null, itensVouf.get(q20).getFirst().getId(), true, null);

        respostaAlunoService.responderQuestao(avaliacao7.getId(), alunos.get(3).getId(), q14.getId(), alternativaCorreta(alternativas.get(q14)), null, null, null);

        // Avaliação 8 respostas
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(1).getId(), q19.getId(), alternativaCorreta(alternativas.get(q19)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(1).getId(), q2.getId(), alternativaCorreta(alternativas.get(q2)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(1).getId(), q3.getId(), null, itensVouf.get(q3).getFirst().getId(), true, null);
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(1).getId(), q15.getId(), null, itensVouf.get(q15).getFirst().getId(), false, null);

        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(4).getId(), q19.getId(), alternativaErrada(alternativas.get(q19)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(4).getId(), q2.getId(), alternativaCorreta(alternativas.get(q2)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao8.getId(), alunos.get(4).getId(), q3.getId(), null, itensVouf.get(q3).getFirst().getId(), true, null);

        // Avaliação 9 respostas
        respostaAlunoService.responderQuestao(avaliacao9.getId(), alunos.get(0).getId(), q1.getId(), alternativaCorreta(alternativas.get(q1)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao9.getId(), alunos.get(0).getId(), q4.getId(), null, itensVouf.get(q4).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao9.getId(), alunos.get(0).getId(), q18.getId(), null, null, null, "Fila de prioridade para escalonar builds."));

        respostaAlunoService.responderQuestao(avaliacao9.getId(), alunos.get(2).getId(), q16.getId(), alternativaCorreta(alternativas.get(q16)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao9.getId(), alunos.get(2).getId(), q4.getId(), null, itensVouf.get(q4).getFirst().getId(), true, null);

        // Avaliação 10 respostas
        respostaAlunoService.responderQuestao(avaliacao10.getId(), alunos.get(3).getId(), q7.getId(), alternativaCorreta(alternativas.get(q7)), null, null, null);
        respostaAlunoService.responderQuestao(avaliacao10.getId(), alunos.get(3).getId(), q12.getId(), null, itensVouf.get(q12).getFirst().getId(), true, null);
        dissertativasParaCorrigir.add(respostaAlunoService.responderQuestao(avaliacao10.getId(), alunos.get(3).getId(), q13.getId(), null, null, null, "ACID protege consistência mesmo em falhas."));
        respostaAlunoService.responderQuestao(avaliacao10.getId(), alunos.get(3).getId(), q19.getId(), alternativaCorreta(alternativas.get(q19)), null, null, null);

        // Corrige ~80% das dissertativas com notas variadas
        BigDecimal[] notas = {
            new BigDecimal("0.6"),
            new BigDecimal("0.7"),
            new BigDecimal("0.8"),
            new BigDecimal("0.9"),
            new BigDecimal("1.0"),
            new BigDecimal("0.75")
        };
        int idxNota = 0;
        for (int i = 0; i < dissertativasParaCorrigir.size(); i++) {
          // pula algumas para manter 20-25% não corrigidas
          if (i % 4 == 0) {
            continue;
          }
          BigDecimal nota = notas[idxNota % notas.length];
          idxNota++;
          respostaAlunoService.corrigirDissertativa(dissertativasParaCorrigir.get(i).getId(), nota);
        }

        // Garante pelo menos uma questão de cada tipo não corrigida
        try (Connection conn = dataSource.getConnection()) {
          marcarComoNaoCorrigida(conn, q7.getId());  // múltipla escolha
          marcarComoNaoCorrigida(conn, q4.getId());  // VOUF
          marcarComoNaoCorrigida(conn, q5.getId());  // dissertativa
        }

        System.out.println("\n=== População concluída com sucesso! ===");
        System.out.println("Credenciais de teste:");
        System.out.println("  Professores: professor1@email.com / senha | professor2@email.com / senha | professor3@email.com / senha");
        System.out.println("  Alunos: aluno1@email.com ... aluno5@email.com (senha para todos: senha)");

      } catch (SQLException e) {
        System.err.println("Erro ao popular banco: " + e.getMessage());
        e.printStackTrace();
        System.exit(1);
      } catch (IllegalArgumentException e) {
        System.err.println("Erro de validação: " + e.getMessage());
        e.printStackTrace();
        System.exit(1);
      }
    };
  }

  private void limparBanco(DataSource dataSource) throws SQLException {
    try (Connection conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
      st.execute("""
          TRUNCATE TABLE respostas_alunos, avaliacao_questoes, avaliacao_alunos,
          avaliacoes, alternativas, vouf, questoes, alunos, professores, usuarios
          RESTART IDENTITY CASCADE
          """);
    } catch (SQLException e) {
      System.out.println("TRUNCATE falhou, tentando limpeza manual: " + e.getMessage());
      try (Connection conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
        st.executeUpdate("DELETE FROM respostas_alunos");
        st.executeUpdate("DELETE FROM avaliacao_questoes");
        st.executeUpdate("DELETE FROM avaliacao_alunos");
        st.executeUpdate("DELETE FROM avaliacoes");
        st.executeUpdate("DELETE FROM alternativas");
        st.executeUpdate("DELETE FROM vouf");
        st.executeUpdate("DELETE FROM questoes");
        st.executeUpdate("DELETE FROM alunos");
        st.executeUpdate("DELETE FROM professores");
        st.executeUpdate("DELETE FROM usuarios");
      }
    }
  }

  private List<AvaliacaoParticipacao> participacoes(List<Aluno> alunos) {
    return alunos.stream().map(aluno -> {
      AvaliacaoParticipacao participacao = new AvaliacaoParticipacao();
      participacao.setAlunoId(aluno.getId());
      return participacao;
    }).toList();
  }

  private void adicionarQuestao(
      AvaliacaoQuestaoService avaliacaoQuestaoService,
      Avaliacao avaliacao,
      Questao questao,
      int ordem) throws SQLException {
    avaliacaoQuestaoService.adicionarQuestao(avaliacao.getId(), questao.getId(), BigDecimal.ONE, ordem);
  }

  private Usuario getOrCreateUsuario(UsuarioService usuarioService, String email, String senha) throws SQLException {
    Usuario existente = usuarioService.listarTodos().stream()
        .filter(u -> email.equalsIgnoreCase(u.getEmail()))
        .findFirst()
        .orElse(null);
    if (existente != null) {
      return existente;
    }
    return usuarioService.criar(email, senha);
  }

  private Professor getOrCreateProfessor(ProfessorService professorService, Usuario usuario, String area) throws SQLException {
    Professor existente = professorService.listarTodos().stream()
        .filter(p -> usuario.getId().equals(p.getUsuarioId()))
        .findFirst()
        .orElse(null);
    if (existente != null) {
      return existente;
    }
    return professorService.criar(area, usuario.getId());
  }

  private Aluno getOrCreateAluno(AlunoService alunoService, UsuarioService usuarioService, String matricula, String email) throws SQLException {
    Usuario usuario = getOrCreateUsuario(usuarioService, email, "senha");
    Aluno existente = alunoService.listarTodos().stream()
        .filter(a -> matricula.equalsIgnoreCase(a.getMatricula()) || usuario.getId().equals(a.getUsuarioId()))
        .findFirst()
        .orElse(null);
    if (existente != null) {
      return existente;
    }
    return alunoService.criar(matricula, LocalDate.of(2023, 2, 1), null, usuario.getId());
  }

  private java.util.UUID alternativaCorreta(List<Alternativa> alternativas) {
    return alternativas.stream()
        .filter(Alternativa::getVerdadeiro)
        .findFirst()
        .orElseThrow()
        .getId();
  }

  private java.util.UUID alternativaErrada(List<Alternativa> alternativas) {
    return alternativas.stream()
        .filter(alt -> !alt.getVerdadeiro())
        .findFirst()
        .orElseThrow()
        .getId();
  }

  private void removerUsuarioPorEmail(DataSource dataSource, String email) throws SQLException {
    if (email == null || email.isBlank()) {
      return;
    }
    try (Connection conn = dataSource.getConnection();
        PreparedStatement pst = conn.prepareStatement("DELETE FROM usuarios WHERE lower(email) = lower(?)")) {
      pst.setString(1, email);
      pst.executeUpdate();
    }
  }

  private void marcarComoNaoCorrigida(Connection conn, java.util.UUID questaoId) throws SQLException {
    String sql = """
        UPDATE respostas_alunos
           SET corrigido = FALSE,
               nota = NULL
         WHERE id IN (
           SELECT id FROM respostas_alunos
            WHERE questao_id = ?
            ORDER BY respondido_em
            LIMIT 1
         )
        """;
    try (PreparedStatement pst = conn.prepareStatement(sql)) {
      pst.setObject(1, questaoId);
      pst.executeUpdate();
    }
  }
}
