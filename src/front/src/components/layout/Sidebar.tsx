import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

type SidebarProps<T extends string> = {
  title: string;
  navItems: { key: T; label: string }[];
  activeKey: T;
  onSelect: (key: T) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function Sidebar<T extends string>({ title, navItems, activeKey, onSelect, theme, onToggleTheme }: SidebarProps<T>) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="text-lg font-semibold">{title}</span>
      </div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <Button
            key={item.key}
            variant={item.key === activeKey ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="sidebar-footer">
        <Button variant="ghost" className="w-full justify-between" onClick={onToggleTheme} aria-pressed={theme === "dark"}>
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </span>
          <span className="relative inline-flex h-5 w-10 items-center rounded-full border border-border bg-secondary/70">
            <span
              className={`absolute h-4 w-4 rounded-full bg-primary shadow-sm transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </span>
        </Button>
      </div>
    </aside>
  );
}
