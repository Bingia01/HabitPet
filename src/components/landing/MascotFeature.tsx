'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MascotFeature() {
  const [selectedState, setSelectedState] = useState(0);
  
  const mascotStates = [
    {
      video: "/mascots/Forki_Starving.mp4",
      title: "Starving",
      description: "When you haven't logged meals, your pet gets hungry and needs your attention!"
    },
    {
      video: "/mascots/Forki_Strong.mp4",
      title: "Strong & Healthy",
      description: "When you're consistent with logging and making healthy choices, your pet is strong and thriving!"
    },
    {
      video: "/mascots/Forki_Overfull.mp4",
      title: "Overfull",
      description: "When you've logged too much, your pet shows you the importance of balance."
    }
  ];

  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Meet Your New Best Friend
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlike boring trackers, Forki gives you an adorable companion that lives, grows, and celebrates with you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-3xl p-8 mb-8">
              <video 
                src={mascotStates[selectedState].video} 
                autoPlay
                loop
                muted
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              {mascotStates.map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={selectedState === index ? "default" : "outline"}
                  onClick={() => setSelectedState(index)}
                  className="rounded-full"
                >
                  State {index + 1}
                </Button>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-background rounded-3xl p-8 shadow-lg">
              <h3 className="font-playful text-2xl md:text-3xl font-bold text-foreground mb-4">
                {mascotStates[selectedState].title}
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                {mascotStates[selectedState].description}
              </p>
              <div className="bg-accent/20 rounded-2xl p-6 border-l-4 border-primary">
                <p className="italic text-foreground">
                  "The pet feature is genius! I actually look forward to logging my meals now. It's like having a Tamagotchi that rewards healthy habits!" 
                </p>
                <p className="text-sm text-muted-foreground mt-3">— Sarah, USC Student</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-2xl">
                <div className="font-playful text-3xl font-bold text-primary">92%</div>
                <div className="text-sm text-muted-foreground mt-1">Stay Engaged</div>
              </div>
              <div className="text-center p-4 bg-background rounded-2xl">
                <div className="font-playful text-3xl font-bold text-primary">14+</div>
                <div className="text-sm text-muted-foreground mt-1">Day Streaks</div>
              </div>
              <div className="text-center p-4 bg-background rounded-2xl">
                <div className="font-playful text-3xl font-bold text-primary">500K</div>
                <div className="text-sm text-muted-foreground mt-1">Meals Logged</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

