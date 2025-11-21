'use client';

import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function FinalCTA() {
  const router = useRouter();

  const handleWebAppClick = () => {
    router.push('/onboarding');
  };

  const handleAppStoreClick = () => {
    alert("Coming soon to App Store!");
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-background rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playful text-4xl md:text-5xl font-bold text-foreground mb-6">
                Start Building Healthier Habits Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of students who've made tracking effortless. Your pet companion is waiting!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg font-semibold min-h-14"
                  onClick={handleWebAppClick}
                >
                  Try Web App Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold min-h-14"
                  onClick={handleAppStoreClick}
                >
                  <Download className="mr-2 w-5 h-5" />
                  App Store
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Free to start. No credit card required.
              </p>
            </div>

            <div className="flex justify-center">
              <Image 
                src="/mascots/Footer_Forki.png"
                alt="Happy Forki mascot welcoming you"
                width={300}
                height={300}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

