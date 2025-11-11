import { Shield } from "lucide-react";

export const Hero = () => {
  return (
    <section className="pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-hero shadow-elevated">
            <Shield className="w-16 h-16 text-white" strokeWidth={2} />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Care Without Compromise
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your medical records, encrypted and secure. Share selectively with doctors and insurers while maintaining complete control of your health data.
        </p>
      </div>
    </section>
  );
};
