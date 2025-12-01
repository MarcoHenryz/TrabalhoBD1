import { ReactNode } from "react";
import { ProfileInfo } from "./ProfileMenu";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type NavItem<T extends string> = {
  key: T;
  label: string;
};

type DashboardLayoutProps<T extends string> = {
  title: string;
  subtitle: string;
  navItems: NavItem<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
  profile: ProfileInfo;
  onLogout: () => void;
  onUpdateProfile: (data: { name?: string; avatar?: string | null }) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  children: ReactNode;
};

export function DashboardLayout<T extends string>({
  title,
  subtitle,
  navItems,
  activeKey,
  onSelect,
  profile,
  onLogout,
  onUpdateProfile,
  theme,
  onToggleTheme,
  children,
}: DashboardLayoutProps<T>) {
  return (
    <div className="dashboard">
      <Sidebar
        title="Notaki"
        navItems={navItems}
        activeKey={activeKey}
        onSelect={onSelect}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <main className="content">
        <Topbar
          title={title}
          subtitle={subtitle}
          profile={profile}
          onLogout={onLogout}
          onUpdateProfile={onUpdateProfile}
        />
        {children}
      </main>
    </div>
  );
}
