import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { ProvasAluno } from "@/components/aluno/ProvasAluno";
import { TutoresAluno } from "@/components/aluno/TutoresAluno";
import { NotasAluno } from "@/components/aluno/NotasAluno";
import { RelatoriosAluno } from "../components/aluno/RelatoriosAluno";

export type AlunoTab = "tutores" | "provasPendentes" | "notas" | "relatorios";

type AlunoNavItem = {
  key: AlunoTab;
  label: string;
  todo: string;
};

type AlunoViewProps = {
  navItems: AlunoNavItem[];
  activeTab: AlunoTab;
  onSelectTab: (key: AlunoTab) => void;
  profile: ProfileInfo;
  onLogout: () => void;
  alunoId: string;
  selectedAvaliacaoId: string | null;
  onSelectAvaliacao: (id: string | null) => void;
  onUpdateProfile: (data: { name?: string; avatar?: string | null }) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function AlunoView({
  navItems,
  activeTab,
  onSelectTab,
  profile,
  onLogout,
  onUpdateProfile,
  alunoId,
  selectedAvaliacaoId,
  onSelectAvaliacao,
  theme,
  onToggleTheme,
}: AlunoViewProps) {
  return (
    <DashboardLayout
      title="Portal do Aluno"
      subtitle="Disciplinas, provas e resultados"
      navItems={navItems}
      activeKey={activeTab}
      onSelect={onSelectTab}
      profile={profile}
      onLogout={onLogout}
      onUpdateProfile={onUpdateProfile}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      {activeTab === "provasPendentes" ? (
        <ProvasAluno
          alunoId={alunoId}
          selectedAvaliacaoId={selectedAvaliacaoId}
          onSelectAvaliacao={onSelectAvaliacao}
        />
      ) : activeTab === "tutores" ? (
        <TutoresAluno
          alunoId={alunoId}
          onOpenAvaliacao={(avaliacaoId) => {
            onSelectAvaliacao(avaliacaoId);
            onSelectTab("provasPendentes");
          }}
        />
      ) : activeTab === "notas" ? (
        <NotasAluno
          alunoId={alunoId}
          selectedAvaliacaoId={selectedAvaliacaoId}
          onSelectAvaliacao={onSelectAvaliacao}
        />
      ) : (
        <RelatoriosAluno alunoId={alunoId} />
      )}
    </DashboardLayout>
  );
}
