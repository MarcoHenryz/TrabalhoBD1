import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderGrid } from "@/components/layout/PlaceholderGrid";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { ProvasAluno } from "@/components/aluno/ProvasAluno";
import { TutoresAluno } from "@/components/aluno/TutoresAluno";
import { NotasAluno } from "@/components/aluno/NotasAluno";

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
  const currentTab = navItems.find(item => item.key === activeTab)!;

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
        <Card className="w-full">
          <CardHeader className="gap-2">
            <CardTitle className="text-2xl">{currentTab.label}</CardTitle>
            <CardDescription>{currentTab.todo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PlaceholderGrid />
            <div className="panel h-44 flex items-center justify-center text-muted-foreground">
              TODO: conteúdo específico da aba escolhida
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
