import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type ProfileInfo = {
  name: string;
  email: string;
  roleLabel: string;
  dept: string;
  avatar?: string | null;
};

type ProfileMenuProps = {
  profile: ProfileInfo;
  onLogout: () => void;
  onUpdateProfile: (data: { name?: string; avatar?: string | null }) => void;
};

export function ProfileMenu({ profile, onLogout, onUpdateProfile }: ProfileMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(profile.avatar ?? null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarFallback = profile.avatar || profile.name.slice(0, 1).toUpperCase();
  const avatarOptions = ["🌊", "📚", "🚀", "🎧", "🌟", "🧩", "🪴", profile.name.slice(0, 1).toUpperCase()];

  useEffect(() => {
    setDraftName(profile.name);
    setDraftAvatar(profile.avatar ?? null);
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    setError(null);
    setFeedback(null);

    if (password && password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    onUpdateProfile({ name: draftName.trim() || profile.name, avatar: draftAvatar });
    setFeedback(password ? "Perfil e senha atualizados." : "Perfil atualizado.");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" className="flex items-center gap-2 rounded-full px-3" onClick={() => setOpen(prev => !prev)}>
        <span className="avatar">{avatarFallback}</span>
        <span className="hidden sm:inline text-sm font-medium">{profile.name}</span>
      </Button>
      {open && (
        <div className="profile-popover">
          <div className="flex items-center gap-3">
            <div className="avatar bg-primary/10 text-primary">{avatarFallback}</div>
            <div>
              <p className="font-semibold leading-tight">{profile.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{profile.email}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {profile.roleLabel} • {profile.dept}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setSettingsOpen(true);
                setOpen(false);
                setFeedback(null);
                setError(null);
                setPassword("");
                setConfirmPassword("");
              }}
            >
              Configurações do perfil
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="profile-popover left-auto right-0 w-80">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-tight">Editar perfil</p>
              <p className="text-xs text-muted-foreground">Atualize seu nome, senha e avatar</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(false)}>
              Fechar
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome</label>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  className={`flex h-12 w-full items-center justify-center rounded-md border text-lg transition ${
                    draftAvatar === avatar ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-card"
                  }`}
                  onClick={() => setDraftAvatar(avatar)}
                  type="button"
                >
                  {avatar}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nova senha</label>
              <input
                type="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Confirmar nova senha</label>
              <input
                type="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
            {feedback && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {feedback}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => setSettingsOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 min-w-[120px]" onClick={handleSave}>
                Salvar alterações
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
