'use client';

import { Zap, Camera, Heart } from "lucide-react";

export default function ProblemSolutionStrip() {
  const features = [
    {
      icon: Zap,
      stat: "15 seconds",
      description: "Average time to log a meal"
    },
    {
      icon: Camera,
      description: "AI-powered food recognition"
    },
    {
      icon: Heart,
      stat: "Your pet grows",
      description: "With every healthy choice you make"
    }
  ];

  return (
    <section className="py-12 bg-[#1A2332]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-[#1E2742]/85 backdrop-blur-sm border-2 border-[#7B68C4]/30"
            >
              <feature.icon className="w-12 h-12 text-[#8DD4D1] mb-4" />
              {feature.stat && (
                <div className="font-playful text-2xl font-bold text-[#E8E8F0] mb-2">
                  {feature.stat}
                </div>
              )}
              <div className="text-base text-[#B8B8C8]">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

