import React from 'react';
import ImageForgeryDetector from '@/components/forensics/ImageForgeryDetector';

const ForgeryDetection: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Forgery Detection</h1>
          <p className="text-muted-foreground">
            Detect manipulations with Error Level Analysis, metadata verification, invisible watermark checks,
            and AI-based tamper assessment.
          </p>
        </header>
        <ImageForgeryDetector />
      </div>
    </div>
  );
};

export default ForgeryDetection;
