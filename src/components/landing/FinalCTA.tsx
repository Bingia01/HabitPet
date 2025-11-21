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
    <section className="py-24 bg-gradient-to-br from-[#0A1128] via-[#1A2332] to-[#2A3441]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#1E2742]/85 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden border-2 border-[#7B68C4]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DD4D1]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7B68C4]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playful text-4xl md:text-5xl font-bold text-[#E8E8F0] mb-6">
                Start Your Forki Journey Today
              </h2>
              <p className="text-lg text-[#B8B8C8] mb-8">
                Join thousands of users who've made tracking effortless. Your Forki companion is waiting!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg font-semibold min-h-14 bg-[#8DD4D1] text-[#0A1128] hover:bg-[#6FB8B5] border-[#7B68C4]"
                  onClick={handleWebAppClick}
                >
                  Start Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold min-h-14 bg-[#1E2742]/60 text-[#E8E8F0] border-2 border-[#7B68C4] hover:bg-[#7B68C4]"
                  onClick={handleAppStoreClick}
                >
                  <Download className="mr-2 w-5 h-5" />
                  Get the App
                </Button>
              </div>

              <p className="text-sm text-[#B8B8C8] mt-6">
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

