import { useMemo, useState, type FormEvent } from "react";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { AlunoView, type AlunoTab } from "@/views/AlunoView";
import { LoginView } from "@/views/LoginView";
import { ProfessorView, type ProfessorSection } from "@/views/ProfessorView";
import { login, type Usuario } from "@/lib/apiprof";
import "./index.css";

type View = "login" | "professor" | "aluno";

function nomeAmigavel(email: string, prefixo?: string) {
  const base = email.split("@")[0] || email;
  const nome = base
    .split(/[._-]/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
  if (prefixo && nome) return `${prefixo} ${nome}`;
  return nome || email;
}

export function App() {
  const [view, setView] = useState<View>("login");
  const [professorSection, setProfessorSection] = useState<ProfessorSection>("questoes");
  const [alunoTab, setAlunoTab] = useState<AlunoTab>("provasPendentes");
  const [avaliacaoSelecionadaAlunoId, setAvaliacaoSelecionadaAlunoId] = useState<string | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [erroLogin, setErroLogin] = useState<string | null>(null);

  const professorNav = useMemo(
    () => [
      { key: "questoes" as ProfessorSection, label: "Criar questões", todo: "Formulário para criação de questões" },
      { key: "gerenciarQuestoes" as ProfessorSection, label: "Gerenciar Questões", todo: "Listagem e gerenciamento de questões" },
      { key: "provas" as ProfessorSection, label: "Criar provas", todo: "Montagem e agendamento de provas" },
      { key: "gerenciarAvaliacoes" as ProfessorSection, label: "Gerenciar Avaliações", todo: "Listagem e gerenciamento de avaliações" },
      { key: "relatorios" as ProfessorSection, label: "Ver relatórios", todo: "TODO: relatórios de desempenho das turmas" },
    ],
    [],
  );

  const alunoNav = useMemo(
    () => [
      { key: "tutores" as AlunoTab, label: "Tutores", todo: "Veja seus tutores e provas vinculadas" },
      { key: "provasPendentes" as AlunoTab, label: "Provas pendentes", todo: "Responda as avaliações disponíveis para você" },
      { key: "notas" as AlunoTab, label: "Notas", todo: "TODO: notas recentes e histórico" },
      { key: "relatorios" as AlunoTab, label: "Relatórios", todo: "TODO: relatórios individuais de progresso" },
    ],
    [],
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroLogin(null);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const senha = formData.get("password") as string;

    try {
      const usuario = await login(email, senha);
      setUsuarioLogado(usuario);
      
      // Determina se é professor ou aluno baseado nos IDs
      if (usuario.professorId) {
        setView("professor");
      } else if (usuario.alunoId) {
        setView("aluno");
      } else {
        setErroLogin("Usuário não possui perfil de professor ou aluno");
      }
    } catch (error) {
      setErroLogin(error instanceof Error ? error.message : "Erro ao fazer login");
    }
  };

  const handleLogout = () => {
    setView("login");
    setProfessorSection("questoes");
    setAlunoTab("provasPendentes");
    setAvaliacaoSelecionadaAlunoId(null);
    setUsuarioLogado(null);
    setErroLogin(null);
  };

  if (view === "professor" && usuarioLogado) {
    const profile: ProfileInfo = {
      name: nomeAmigavel(usuarioLogado.email, "Prof."),
      email: usuarioLogado.email,
      roleLabel: "Professor",
      dept: "Departamento X",
    };

    return (
      <ProfessorView
        navItems={professorNav}
        activeSection={professorSection}
        onSelectSection={setProfessorSection}
        profile={profile}
        onLogout={handleLogout}
        professorId={usuarioLogado.professorId!}
      />
    );
  }

  if (view === "aluno" && usuarioLogado) {
    const profile: ProfileInfo = {
      name: nomeAmigavel(usuarioLogado.email),
      email: usuarioLogado.email,
      roleLabel: "Aluno",
      dept: "Curso Y",
    };

    return (
      <AlunoView
        navItems={alunoNav}
        activeTab={alunoTab}
        onSelectTab={setAlunoTab}
        profile={profile}
        onLogout={handleLogout}
        alunoId={usuarioLogado.alunoId!}
        selectedAvaliacaoId={avaliacaoSelecionadaAlunoId}
        onSelectAvaliacao={setAvaliacaoSelecionadaAlunoId}
      />
    );
  }

  return <LoginView onSubmit={handleLogin} erro={erroLogin} />;
}

export default App;
