import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const getProfileStorageKey = (usuario: Usuario) => `notaki_profile_${usuario.id || usuario.email}`;

  const carregarProfileSalvo = (usuario: Usuario): Partial<ProfileInfo> | null => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(getProfileStorageKey(usuario));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<ProfileInfo>;
    } catch {
      return null;
    }
  };

  const salvarProfile = (usuario: Usuario, data: ProfileInfo) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(getProfileStorageKey(usuario), JSON.stringify(data));
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const professorNav = useMemo(
    () => [
      { key: "questoes" as ProfessorSection, label: "Criar questões", todo: "Formulário para criação de questões" },
      { key: "gerenciarQuestoes" as ProfessorSection, label: "Gerenciar Questões", todo: "Listagem e gerenciamento de questões" },
      { key: "provas" as ProfessorSection, label: "Criar provas", todo: "Montagem e agendamento de provas" },
      { key: "gerenciarAvaliacoes" as ProfessorSection, label: "Gerenciar Avaliações", todo: "Listagem e gerenciamento de avaliações" },
      { key: "correcoes" as ProfessorSection, label: "Corrigir questões", todo: "Acompanhe pendências dissertativas e lance notas" },
      { key: "relatorios" as ProfessorSection, label: "Ver relatórios", todo: "Gráficos e comparativos entre alunos, provas e docentes" },
    ],
    [],
  );

  const alunoNav = useMemo(
    () => [
      { key: "tutores" as AlunoTab, label: "Tutores", todo: "Veja seus tutores e provas vinculadas" },
      { key: "provasPendentes" as AlunoTab, label: "Provas pendentes", todo: "Responda as avaliações disponíveis para você" },
      { key: "notas" as AlunoTab, label: "Notas", todo: "Acompanhe notas, correções e histórico" },
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
      const baseProfile: ProfileInfo = {
        name: nomeAmigavel(usuario.email, usuario.professorId ? "Prof." : undefined),
        email: usuario.email,
        roleLabel: usuario.professorId ? "Professor" : "Aluno",
        dept: usuario.professorId ? "Departamento X" : "Curso Y",
        avatar: null,
      };
      const salvo = carregarProfileSalvo(usuario);
      const finalProfile = salvo ? { ...baseProfile, ...salvo } : baseProfile;
      setProfile(finalProfile);
      salvarProfile(usuario, finalProfile);
      
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
    setProfile(null);
    setErroLogin(null);
  };

  const handleProfileUpdate = (data: { name?: string; avatar?: string | null }) => {
    setProfile((prev) => {
      if (!prev || !usuarioLogado) return prev;
      const atualizado = { ...prev, ...data, name: data.name ?? prev.name };
      salvarProfile(usuarioLogado, atualizado);
      return atualizado;
    });
  };

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  if (view === "professor" && usuarioLogado && profile) {
    return (
      <ProfessorView
        navItems={professorNav}
        activeSection={professorSection}
        onSelectSection={setProfessorSection}
        profile={profile}
        onLogout={handleLogout}
        onUpdateProfile={handleProfileUpdate}
        theme={theme}
        onToggleTheme={toggleTheme}
        professorId={usuarioLogado.professorId!}
      />
    );
  }

  if (view === "aluno" && usuarioLogado && profile) {

    return (
      <AlunoView
        navItems={alunoNav}
        activeTab={alunoTab}
        onSelectTab={setAlunoTab}
        profile={profile}
        onLogout={handleLogout}
        onUpdateProfile={handleProfileUpdate}
        theme={theme}
        onToggleTheme={toggleTheme}
        alunoId={usuarioLogado.alunoId!}
        selectedAvaliacaoId={avaliacaoSelecionadaAlunoId}
        onSelectAvaliacao={setAvaliacaoSelecionadaAlunoId}
      />
    );
  }

  return <LoginView onSubmit={handleLogin} erro={erroLogin} />;
}

export default App;
