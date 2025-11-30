package com.uel.script;

import com.uel.entity.Aluno;
import com.uel.entity.Professor;
import com.uel.entity.Usuario;
import com.uel.service.AlunoService;
import com.uel.service.ProfessorService;
import com.uel.service.UsuarioService;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
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
      ProfessorService professorService) {
    return args -> {
      System.out.println("=== Iniciando população do banco de dados ===");

      try {
        // Criar professores
        System.out.println("\nCriando professores...");
        
        Usuario prof1 = usuarioService.criar("prof.silva@uel.br", "senha123");
        Professor professor1 = professorService.criar("Ciência da Computação", prof1.getId());
        System.out.println("✓ Professor criado: " + prof1.getEmail() + " (ID: " + professor1.getId() + ")");

        Usuario prof2 = usuarioService.criar("prof.santos@uel.br", "senha123");
        Professor professor2 = professorService.criar("Engenharia de Software", prof2.getId());
        System.out.println("✓ Professor criado: " + prof2.getEmail() + " (ID: " + professor2.getId() + ")");

        Usuario prof3 = usuarioService.criar("prof.oliveira@uel.br", "senha123");
        Professor professor3 = professorService.criar("Banco de Dados", prof3.getId());
        System.out.println("✓ Professor criado: " + prof3.getEmail() + " (ID: " + professor3.getId() + ")");

        // Criar alunos
        System.out.println("\nCriando alunos...");
        
        Usuario aluno1 = usuarioService.criar("aluno.marco@uel.br", "senha123");
        Aluno alunoMarco = alunoService.criar(
            "2021001",
            LocalDate.of(2021, 1, 1),
            LocalDate.of(2025, 12, 31),
            aluno1.getId()
        );
        alunoService.atualizarMedia(alunoMarco.getId(), new BigDecimal("8.5"));
        System.out.println("✓ Aluno criado: " + aluno1.getEmail() + " (Matrícula: " + alunoMarco.getMatricula() + ")");

        Usuario aluno2 = usuarioService.criar("aluno.henry@uel.br", "senha123");
        Aluno alunoHenry = alunoService.criar(
            "2021002",
            LocalDate.of(2021, 1, 1),
            LocalDate.of(2025, 12, 31),
            aluno2.getId()
        );
        alunoService.atualizarMedia(alunoHenry.getId(), new BigDecimal("9.0"));
        System.out.println("✓ Aluno criado: " + aluno2.getEmail() + " (Matrícula: " + alunoHenry.getMatricula() + ")");

        Usuario aluno3 = usuarioService.criar("aluno.rodrigo@uel.br", "senha123");
        Aluno alunoRodrigo = alunoService.criar(
            "2021003",
            LocalDate.of(2021, 1, 1),
            LocalDate.of(2025, 12, 31),
            aluno3.getId()
        );
        alunoService.atualizarMedia(alunoRodrigo.getId(), new BigDecimal("7.8"));
        System.out.println("✓ Aluno criado: " + aluno3.getEmail() + " (Matrícula: " + alunoRodrigo.getMatricula() + ")");

        Usuario aluno4 = usuarioService.criar("aluno.maria@uel.br", "senha123");
        Aluno alunoMaria = alunoService.criar(
            "2022001",
            LocalDate.of(2022, 1, 1),
            LocalDate.of(2026, 12, 31),
            aluno4.getId()
        );
        alunoService.atualizarMedia(alunoMaria.getId(), new BigDecimal("8.9"));
        System.out.println("✓ Aluno criado: " + aluno4.getEmail() + " (Matrícula: " + alunoMaria.getMatricula() + ")");

        Usuario aluno5 = usuarioService.criar("aluno.joao@uel.br", "senha123");
        Aluno alunoJoao = alunoService.criar(
            "2022002",
            LocalDate.of(2022, 1, 1),
            LocalDate.of(2026, 12, 31),
            aluno5.getId()
        );
        alunoService.atualizarMedia(alunoJoao.getId(), new BigDecimal("7.5"));
        System.out.println("✓ Aluno criado: " + aluno5.getEmail() + " (Matrícula: " + alunoJoao.getMatricula() + ")");

        System.out.println("\n=== População concluída com sucesso! ===");
        System.out.println("\nCredenciais de teste:");
        System.out.println("Professores:");
        System.out.println("  - prof.silva@uel.br / senha123");
        System.out.println("  - prof.santos@uel.br / senha123");
        System.out.println("  - prof.oliveira@uel.br / senha123");
        System.out.println("\nAlunos:");
        System.out.println("  - aluno.marco@uel.br / senha123");
        System.out.println("  - aluno.henry@uel.br / senha123");
        System.out.println("  - aluno.rodrigo@uel.br / senha123");
        System.out.println("  - aluno.maria@uel.br / senha123");
        System.out.println("  - aluno.joao@uel.br / senha123");

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
}

