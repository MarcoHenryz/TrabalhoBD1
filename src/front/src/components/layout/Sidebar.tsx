import { Button } from "@/components/ui/button";

type SidebarProps<T extends string> = {
  title: string;
  navItems: { key: T; label: string }[];
  activeKey: T;
  onSelect: (key: T) => void;
};

export function Sidebar<T extends string>({ title, navItems, activeKey, onSelect }: SidebarProps<T>) {
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
        <Button variant="ghost" className="w-full justify-start">
          Alterar Tema
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Configurações
        </Button>
      </div>
    </aside>
  );
}
