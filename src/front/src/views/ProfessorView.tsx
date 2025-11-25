import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderGrid } from "@/components/layout/PlaceholderGrid";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";

export type ProfessorSection = "questoes" | "provas" | "relatorios";

type ProfessorNavItem = {
  key: ProfessorSection;
  label: string;
  todo: string;
};

type ProfessorViewProps = {
  navItems: ProfessorNavItem[];
  activeSection: ProfessorSection;
  onSelectSection: (key: ProfessorSection) => void;
  profile: ProfileInfo;
  onLogout: () => void;
};

export function ProfessorView({ navItems, activeSection, onSelectSection, profile, onLogout }: ProfessorViewProps) {
  const currentSection = navItems.find(item => item.key === activeSection)!;

  return (
    <DashboardLayout
      title="Painel do Professor"
      subtitle="Criar e acompanhar avaliações"
      navItems={navItems}
      activeKey={activeSection}
      onSelect={onSelectSection}
      profile={profile}
      onLogout={onLogout}
    >
      <Card className="w-full">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">{currentSection.label}</CardTitle>
          <CardDescription>{currentSection.todo}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PlaceholderGrid />
          <div className="panel h-44 flex items-center justify-center text-muted-foreground">
            TODO: conteúdo específico da seção escolhida
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
