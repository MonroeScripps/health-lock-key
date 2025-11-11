import { Shield, Heart } from "lucide-react";

export const Logo = () => {
  return (
    <div className="relative flex items-center justify-center">
      <Shield className="w-10 h-10 text-primary" strokeWidth={2} />
      <Heart className="w-5 h-5 text-secondary absolute" fill="currentColor" />
    </div>
  );
};
