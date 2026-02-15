'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MascotFeature() {
  const [selectedState, setSelectedState] = useState(0);
  
  const mascotStates = [
    {
      video: "/mascots/Forki_Starving.mp4",
      title: "Needs You",
      buttonLabel: "Starving",
      description: "When you haven't logged meals, your pet gets hungry and needs your attention!"
    },
    {
      video: "/mascots/Forki_Strong.mp4",
      title: "Thriving",
      buttonLabel: "Strong",
      description: "When you're consistent with logging and making healthy choices, your pet is strong and thriving!"
    },
    {
      video: "/mascots/Forki_Overfull.mp4",
      title: "Needs Balance",
      buttonLabel: "Overfull",
      description: "When you've logged too much, your pet shows you the importance of balance."
    }
  ];

  return (
    <section className="py-24 bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E8F0] mb-6">
            Meet Your Forki
          </h2>
          <p className="text-lg md:text-xl text-[#B8B8C8] max-w-2xl mx-auto">
            Unlike boring trackers, Forki gives you a companion that grows, thrives, and celebrates every healthy choice with you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-gradient-to-br from-[#1E2742]/80 to-[#2A3441]/60 rounded-3xl p-8 mb-8 border-2 border-[#7B68C4]/30">
              <video 
                src={mascotStates[selectedState].video} 
                autoPlay
                loop
                muted
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              {mascotStates.map((state, index) => (
                <Button
                  key={index}
                  size="default"
                  variant={selectedState === index ? "default" : "outline"}
                  onClick={() => setSelectedState(index)}
                  className={`rounded-full px-6 py-3 text-base font-semibold ${
                    selectedState === index 
                      ? "bg-[#8DD4D1] text-[#0A1128] hover:bg-[#6FB8B5] border-[#7B68C4]" 
                      : "bg-[#1E2742]/60 text-[#E8E8F0] border-[#7B68C4]/40 hover:border-[#7B68C4]"
                  }`}
                >
                  {state.buttonLabel}
                </Button>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-[#1E2742]/85 rounded-3xl p-8 shadow-lg border-2 border-[#7B68C4]/30">
              <h3 className="font-playful text-2xl md:text-3xl font-bold text-[#E8E8F0] mb-4">
                {mascotStates[selectedState].title}
              </h3>
              <p className="text-lg text-[#B8B8C8] mb-6">
                {mascotStates[selectedState].description}
              </p>
              <div className="bg-[#2A3441]/60 rounded-2xl p-6 border-l-4 border-[#8DD4D1]">
                <p className="italic text-[#E8E8F0]">
                  &ldquo;The Forki feature is genius! I actually look forward to logging my meals now. It&apos;s like having a companion that rewards healthy habits!&rdquo;
                </p>
                <p className="text-sm text-[#B8B8C8] mt-3">— Sarah, Forki User</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#1E2742]/85 rounded-2xl border border-[#7B68C4]/20">
                <div className="font-playful text-3xl font-bold text-[#8DD4D1]">92%</div>
                <div className="text-sm text-[#B8B8C8] mt-1">Stay Engaged</div>
              </div>
              <div className="text-center p-4 bg-[#1E2742]/85 rounded-2xl border border-[#7B68C4]/20">
                <div className="font-playful text-3xl font-bold text-[#8DD4D1]">14+</div>
                <div className="text-sm text-[#B8B8C8] mt-1">Day Streaks</div>
              </div>
              <div className="text-center p-4 bg-[#1E2742]/85 rounded-2xl border border-[#7B68C4]/20">
                <div className="font-playful text-3xl font-bold text-[#8DD4D1]">500K</div>
                <div className="text-sm text-[#B8B8C8] mt-1">Meals Logged</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

