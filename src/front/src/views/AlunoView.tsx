import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderGrid } from "@/components/layout/PlaceholderGrid";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { ProvasAluno } from "@/components/aluno/ProvasAluno";

export type AlunoTab = "disciplinas" | "provasPendentes" | "notas" | "relatorios";

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
};

export function AlunoView({ navItems, activeTab, onSelectTab, profile, onLogout, alunoId }: AlunoViewProps) {
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
    >
      {activeTab === "provasPendentes" ? (
        <ProvasAluno alunoId={alunoId} />
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
