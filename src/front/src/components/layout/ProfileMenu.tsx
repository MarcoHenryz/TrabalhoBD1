import { useState } from "react";
import { Button } from "@/components/ui/button";

export type ProfileInfo = {
  name: string;
  email: string;
  roleLabel: string;
  dept: string;
};

type ProfileMenuProps = {
  profile: ProfileInfo;
  onLogout: () => void;
};

export function ProfileMenu({ profile, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" className="flex items-center gap-2 rounded-full px-3" onClick={() => setOpen(prev => !prev)}>
        <span className="avatar">{profile.name.slice(0, 1)}</span>
        <span className="hidden sm:inline text-sm font-medium">{profile.name}</span>
      </Button>
      {open && (
        <div className="profile-popover">
          <div className="flex items-center gap-3">
            <div className="avatar bg-primary/10 text-primary">{profile.name.slice(0, 1)}</div>
            <div>
              <p className="font-semibold leading-tight">{profile.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{profile.email}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {profile.roleLabel} • {profile.dept}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start">
              Configurações do perfil
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
