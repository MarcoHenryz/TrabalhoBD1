import { useMemo, useState, type FormEvent } from "react";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { AlunoView, type AlunoTab } from "@/views/AlunoView";
import { LoginView } from "@/views/LoginView";
import { ProfessorView, type ProfessorSection } from "@/views/ProfessorView";
import "./index.css";

type View = "login" | "professor" | "aluno";

export function App() {
  const [view, setView] = useState<View>("login");
  const [professorSection, setProfessorSection] = useState<ProfessorSection>("questoes");
  const [alunoTab, setAlunoTab] = useState<AlunoTab>("disciplinas");

  const professorNav = useMemo(
    () => [
      { key: "questoes" satisfies ProfessorSection, label: "Criar questões", todo: "TODO: formulário para criação de questões" },
      { key: "provas" satisfies ProfessorSection, label: "Criar provas", todo: "TODO: montagem e agendamento de provas" },
      { key: "relatorios" satisfies ProfessorSection, label: "Ver relatórios", todo: "TODO: relatórios de desempenho das turmas" },
    ],
    [],
  );

  const alunoNav = useMemo(
    () => [
      { key: "disciplinas" satisfies AlunoTab, label: "Disciplinas matriculadas", todo: "TODO: listar disciplinas e docentes" },
      { key: "provasPendentes" satisfies AlunoTab, label: "Provas pendentes", todo: "TODO: prazos e status das próximas provas" },
      { key: "notas" satisfies AlunoTab, label: "Notas", todo: "TODO: notas recentes e histórico" },
      { key: "relatorios" satisfies AlunoTab, label: "Relatórios", todo: "TODO: relatórios individuais de progresso" },
    ],
    [],
  );

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const role = Math.random() < 0.5 ? "professor" : "aluno";
    setView(role);
  };

  const handleLogout = () => {
    setView("login");
    setProfessorSection("questoes");
    setAlunoTab("disciplinas");
  };

  if (view === "professor") {
    const profile: ProfileInfo = {
      name: "Prof. Placeholder",
      email: "professor@notaki.edu",
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
      />
    );
  }

  if (view === "aluno") {
    const profile: ProfileInfo = {
      name: "Aluno Placeholder",
      email: "aluno@notaki.edu",
      roleLabel: "Aluno",
      dept: "Curso Y",
    };

    return (
      <AlunoView navItems={alunoNav} activeTab={alunoTab} onSelectTab={setAlunoTab} profile={profile} onLogout={handleLogout} />
    );
  }

  return <LoginView onSubmit={handleLogin} />;
}

export default App;
