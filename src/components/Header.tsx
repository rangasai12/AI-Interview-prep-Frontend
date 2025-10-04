import { Briefcase, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onProfileClick?: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          <span>JobMatch AI</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onProfileClick}>
          <User className="w-4 h-4 mr-2" />
          My Profile
        </Button>
      </div>
    </header>
  );
}
