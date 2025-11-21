'use client';

import { CheckCircle, TrendingUp, Camera, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AppShowcase() {
  const callouts = [
    {
      icon: Camera,
      label: "1-Tap Logging",
      description: "Just snap and go - AI recognizes your food instantly"
    },
    {
      icon: Trophy,
      label: "Build Streaks",
      description: "Keep your momentum with visual rewards and celebrations"
    },
    {
      icon: TrendingUp,
      label: "Track Progress",
      description: "See your growth with beautiful weekly insights"
    }
  ];

  return (
    <section className="py-24 bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E8F0] mb-6">
            Tracking Made Effortless
          </h2>
          <p className="text-lg md:text-xl text-[#B8B8C8] max-w-2xl mx-auto">
            No more tedious typing or database searching. Just tap, and your Forki celebrates with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {callouts.map((callout, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-lg transition-all cursor-default border-[#7B68C4]/30 bg-[#1E2742]/85 hover:border-[#7B68C4]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#8DD4D1]/20 flex items-center justify-center mb-6 border border-[#7B68C4]/30">
                  <callout.icon className="w-8 h-8 text-[#8DD4D1]" />
                </div>
                <h3 className="font-semibold text-xl text-[#E8E8F0] mb-3">
                  {callout.label}
                </h3>
                <p className="text-[#B8B8C8] leading-relaxed">
                  {callout.description}
                </p>
                <CheckCircle className="w-6 h-6 text-[#8DD4D1] mt-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

