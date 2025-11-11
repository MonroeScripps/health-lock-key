import { Lock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Data Access: Limited</span>
        </div>
      </div>
    </footer>
  );
};
