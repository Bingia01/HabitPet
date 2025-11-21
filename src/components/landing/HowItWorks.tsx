'use client';

import { Smartphone, Camera, Heart, TrendingUp, PartyPopper } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Smartphone,
      title: "Open Forki",
      description: "Launch Forki whenever you eat. No need to create an account or set complex goals."
    },
    {
      number: 2,
      icon: Camera,
      title: "Log Your Meal",
      description: "Tap once or snap a photo. Our AI handles the rest in under 15 seconds."
    },
    {
      number: 3,
      icon: Heart,
      title: "Your Forki Reacts",
      description: "Watch your Forki celebrate, grow stronger, and cheer you on!"
    },
    {
      number: 4,
      icon: TrendingUp,
      title: "Build Your Streak",
      description: "Consistency unlocks rewards, levels up your Forki, and creates lasting habits."
    },
    {
      number: 5,
      icon: PartyPopper,
      title: "Celebrate Progress",
      description: "Review your weekly recap and share your achievements with the community."
    }
  ];

  return (
    <section className="py-24 bg-[#1A2332]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E8F0] mb-6">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-[#B8B8C8] max-w-2xl mx-auto">
            Five simple steps to building healthier habits that actually stick.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-6 items-start ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#8DD4D1] flex items-center justify-center shadow-lg border-2 border-[#7B68C4]">
                    <step.icon className="w-10 h-10 text-[#0A1128]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#F5C9E0] flex items-center justify-center font-playful font-bold text-[#0A1128] border-4 border-[#1A2332]">
                    {step.number}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-[#1E2742]/85 rounded-3xl p-8 shadow-md border-2 border-[#7B68C4]/30">
                <h3 className="font-playful text-2xl font-bold text-[#E8E8F0] mb-3">
                  {step.title}
                </h3>
                <p className="text-lg text-[#B8B8C8] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

