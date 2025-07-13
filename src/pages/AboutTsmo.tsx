import React from 'react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

const AboutTsmo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* About TSMO Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="mb-8">
              <img 
                src={tsmoLogo} 
                alt="TSMO Logo" 
                className="h-36 md:h-48 mx-auto object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About TSMO
            </h1>
            <p className="text-xl text-muted-foreground">
              Born from an artist's frustration, built for every creator's protection
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-foreground">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                After graduating from art school, I was eager to share my work with the world. Like many emerging artists, I turned to the internet to build my portfolio, hoping it would help me land freelance jobs, commissions, and gallery interest. I uploaded my digital illustrations, photography, and mixed media pieces onto platforms meant to connect creatives with clients. At first, the responses were encouraging—people liked my work, some even shared it. It felt like a promising start.
              </p>
              
              <p className="font-semibold text-primary">
                But the excitement quickly turned into frustration.
              </p>
              
              <p>
                I began to notice my artwork popping up in unexpected places—blogs, online stores, social media accounts, even merchandise sites—without my name, credit, or permission. Strangers were reposting, reselling, and in some cases, even claiming to be the original artists. I'd put hours, days, sometimes weeks into creating those pieces, and now they were being used by others to gain followers or make money, while I got nothing.
              </p>
              
              <p>
                I tried reporting stolen content, but the process was tedious and inconsistent. Some platforms took down the art; others ignored me. Worst of all, I realized that even when I found unauthorized uses, I had no real way to track the full scope of the theft. It felt like fighting shadows.
              </p>
              
              <p>
                That experience was a turning point. I realized I wasn't alone—this is a problem faced by countless creators in every field: artists, photographers, designers, animators, musicians. The digital world makes sharing easy, but it also makes stealing effortless. We live in a time when protecting your creative work shouldn't be a luxury—it should be a basic right.
              </p>
              
              <p className="font-semibold text-primary text-xl">
                That's why I started TSMO.
              </p>
              
              <p>
                TSMO is an AI-powered platform built specifically to help artists protect their intellectual property online. It scans the internet for unauthorized use of your work, sends you alerts when your images appear elsewhere, and helps you take action—whether that's filing takedown notices, requesting credit, or seeking legal support. Think of it as a digital watchdog for your portfolio.
              </p>
              
              <p>
                But more than just a tool, TSMO is a movement. It's a response to the exploitation of creative labor. It's a declaration that artists deserve respect, recognition, and protection in a digital economy that too often undervalues original work.
              </p>
              
              <p className="font-semibold text-primary text-xl">
                At its core, TSMO is about empowerment.
              </p>
              
              <p>
                We want creators to feel safe sharing their work, knowing that someone has their back. Because when you spend your life creating something unique, you shouldn't have to worry about it being stolen—you should be able to focus on making more of what only you can make.
              </p>
              
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-xl font-medium text-primary text-center">
                  Thank you for joining TSMO.
                </p>
                <p className="text-lg text-muted-foreground text-center mt-2">
                  - Shirleena Cunningham, Founder & CEO
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutTsmo;