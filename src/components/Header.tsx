import { Logo } from "./Logo";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-bold text-foreground">HealthLock</span>
        </div>
        
        <ConnectButton />
      </div>
    </header>
  );
};
