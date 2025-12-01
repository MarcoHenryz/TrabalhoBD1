import { ProfileInfo, ProfileMenu } from "./ProfileMenu";

type TopbarProps = {
  title: string;
  subtitle: string;
  profile: ProfileInfo;
  onLogout: () => void;
  onUpdateProfile: (data: { name?: string; avatar?: string | null }) => void;
};

export function Topbar({ title, subtitle, profile, onLogout, onUpdateProfile }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-xl font-semibold">{title}</p>
      </div>
      <ProfileMenu profile={profile} onLogout={onLogout} onUpdateProfile={onUpdateProfile} />
    </header>
  );
}
