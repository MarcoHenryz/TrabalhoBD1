import { ProfileInfo, ProfileMenu } from "./ProfileMenu";

type TopbarProps = {
  title: string;
  subtitle: string;
  profile: ProfileInfo;
  onLogout: () => void;
};

export function Topbar({ title, subtitle, profile, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-xl font-semibold">{title}</p>
      </div>
      <ProfileMenu profile={profile} onLogout={onLogout} />
    </header>
  );
}
