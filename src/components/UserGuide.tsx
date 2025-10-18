import { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface GuideSection {
  title: string;
  content: string;
  tips?: string[];
}

interface UserGuideProps {
  title: string;
  description: string;
  sections: GuideSection[];
  variant?: 'button' | 'inline';
}

export const UserGuide = ({ title, description, sections, variant = 'button' }: UserGuideProps) => {
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const GuideContent = () => (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => toggleSection(index)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{section.title}</CardTitle>
              {expandedSections.includes(index) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes(index) && (
            <CardContent className="pt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
              {section.tips && section.tips.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Badge variant="secondary">💡 Pro Tips</Badge>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {section.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );

  if (variant === 'inline') {
    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <GuideContent />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">User Guide</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <GuideContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
