import React from 'react';
import { ArrowDown, Shield, Sparkles } from 'lucide-react';

export const ProblemToSolutionTransition = () => {
  return (
    <section className="relative py-16 px-4 overflow-hidden bg-gradient-to-b from-amber-50/50 via-background to-primary/5 dark:from-amber-950/10 dark:via-background dark:to-primary/10">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20 animate-float-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Transition arrow with animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-primary/20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <ArrowDown className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Transition text */}
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
              From Challenge
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/50" />
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 via-primary to-accent bg-clip-text text-transparent">
              To Solution
            </h3>

            <p className="text-muted-foreground max-w-lg mx-auto">
              TSMO transforms these industry challenges into opportunities with our comprehensive protection system
            </p>
          </div>

          {/* Shield icon with glow effect */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 animate-pulse-glow" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Animated lines connecting to next section */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent animate-scan-down" />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};
