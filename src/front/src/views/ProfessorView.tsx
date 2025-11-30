import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderGrid } from "@/components/layout/PlaceholderGrid";
import type { ProfileInfo } from "@/components/layout/ProfileMenu";
import { CriarQuestaoForm } from "@/components/forms/CriarQuestaoForm";
import { ListarQuestoes } from "@/components/forms/ListarQuestoes";
import { NovaAvaliacaoForm } from "@/components/forms/NovaAvaliacaoForm";
import { useState } from "react";

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
  professorId: string;
};

export function ProfessorView({ navItems, activeSection, onSelectSection, profile, onLogout, professorId }: ProfessorViewProps) {
  const currentSection = navItems.find(item => item.key === activeSection)!;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setSuccessMessage("Questão criada com sucesso!");
    setErrorMessage(null);
    setRefreshTrigger(prev => prev + 1); // Trigger para recarregar a lista
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage(null);
  };

  const handleQuestaoDeletada = () => {
    setSuccessMessage("Questão excluída com sucesso!");
    setErrorMessage(null);
    setRefreshTrigger(prev => prev + 1); // Trigger para recarregar a lista
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleAvaliacaoCriada = () => {
    setSuccessMessage("Avaliação criada com sucesso!");
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

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
      {activeSection === "questoes" ? (
        <div className="space-y-6">
          {successMessage && (
            <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}
          <CriarQuestaoForm professorId={professorId} onSuccess={handleSuccess} onError={handleError} />
          <ListarQuestoes 
            onQuestaoDeletada={handleQuestaoDeletada} 
            onError={handleError} 
            refreshTrigger={refreshTrigger}
          />
        </div>
      ) : activeSection === "provas" ? (
        <div className="space-y-6">
          {successMessage && (
            <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {errorMessage}
            </div>
          )}
          <NovaAvaliacaoForm onSuccess={handleAvaliacaoCriada} onError={handleError} />
        </div>
      ) : (
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
      )}
    </DashboardLayout>
  );
}
