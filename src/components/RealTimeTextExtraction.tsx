import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Copy, Share2, Download, Volume2, Search } from 'lucide-react';
import { GoogleLensObject } from '@/types/visual-recognition';
import { useToast } from '@/hooks/use-toast';

interface RealTimeTextExtractionProps {
  textObjects: GoogleLensObject[];
  onTextSelect: (textObject: GoogleLensObject) => void;
}

const RealTimeTextExtraction = ({ textObjects, onTextSelect }: RealTimeTextExtractionProps) => {
  const { toast } = useToast();
  const [translatedTexts, setTranslatedTexts] = useState<Map<string, string>>(new Map());
  const [isTranslating, setIsTranslating] = useState<Set<string>>(new Set());

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Text has been copied successfully",
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const translateText = useCallback(async (textObj: GoogleLensObject) => {
    const textContent = textObj.interactionData?.textInfo?.content;
    if (!textContent) return;

    setIsTranslating(prev => new Set(prev).add(textObj.id));

    try {
      // Simulate translation API call
      // In real implementation, use Google Translate API or similar
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTranslation = `Translated: ${textContent}`;
      setTranslatedTexts(prev => new Map(prev).set(textObj.id, mockTranslation));
      
      toast({
        title: "Translation Complete",
        description: "Text has been translated successfully",
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Could not translate the text",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(prev => {
        const newSet = new Set(prev);
        newSet.delete(textObj.id);
        return newSet;
      });
    }
  }, [toast]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Text-to-speech is not available in your browser",
        variant: "destructive",
      });
    }
  }, [toast]);

  const searchText = useCallback((text: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    window.open(searchUrl, '_blank');
  }, []);

  const downloadText = useCallback((text: string, filename: string = 'extracted-text.txt') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Text file download has started",
    });
  }, [toast]);

  const getLanguageFlag = (language: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
    };
    return flags[language] || '🌐';
  };

  if (textObjects.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <Languages className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-2">No Text Detected</h3>
          <p className="text-sm text-muted-foreground">
            Point your camera at text, signs, or documents to extract and translate content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Text Recognition ({textObjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="detected" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detected">Detected</TabsTrigger>
              <TabsTrigger value="translated">Translated</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="detected" className="space-y-3 mt-4">
              <div className="space-y-3">
                {textObjects.map((textObj) => {
                  const textInfo = textObj.interactionData?.textInfo;
                  if (!textInfo) return null;

                  return (
                    <div
                      key={textObj.id}
                      className="border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => onTextSelect(textObj)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getLanguageFlag(textInfo.language)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {textInfo.language.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {textObj.confidence}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 rounded p-2 mb-3">
                        <p className="text-sm font-mono leading-relaxed">
                          {textInfo.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(textInfo.content);
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            translateText(textObj);
                          }}
                          disabled={isTranslating.has(textObj.id)}
                        >
                          <Languages className="w-3 h-3 mr-1" />
                          {isTranslating.has(textObj.id) ? 'Translating...' : 'Translate'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(textInfo.content);
                          }}
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Speak
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            searchText(textInfo.content);
                          }}
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Search
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="translated" className="space-y-3 mt-4">
              {translatedTexts.size === 0 ? (
                <div className="text-center py-6">
                  <Languages className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No translations yet. Click "Translate" on any detected text.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(translatedTexts.entries()).map(([id, translation]) => {
                    const originalText = textObjects.find(obj => obj.id === id);
                    return (
                      <div key={id} className="border border-border/50 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Original:</div>
                          <div className="bg-muted/30 rounded p-2 text-sm">
                            {originalText?.interactionData?.textInfo?.content}
                          </div>
                          <div className="text-xs text-muted-foreground">Translation:</div>
                          <div className="bg-primary/10 rounded p-2 text-sm">
                            {translation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 flex-col gap-1"
                  onClick={() => {
                    const allText = textObjects
                      .map(obj => obj.interactionData?.textInfo?.content)
                      .filter(Boolean)
                      .join('\n\n');
                    copyToClipboard(allText);
                  }}
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-xs">Copy All</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-12 flex-col gap-1"
                  onClick={() => {
                    const allText = textObjects
                      .map(obj => obj.interactionData?.textInfo?.content)
                      .filter(Boolean)
                      .join('\n\n');
                    downloadText(allText, `extracted-text-${Date.now()}.txt`);
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">Download</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-12 flex-col gap-1"
                  onClick={() => {
                    const allText = textObjects
                      .map(obj => obj.interactionData?.textInfo?.content)
                      .filter(Boolean)
                      .join(' ');
                    if (navigator.share) {
                      navigator.share({
                        title: 'Extracted Text',
                        text: allText,
                      });
                    } else {
                      copyToClipboard(allText);
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Share</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-12 flex-col gap-1"
                  onClick={() => {
                    const allText = textObjects
                      .map(obj => obj.interactionData?.textInfo?.content)
                      .filter(Boolean)
                      .join(' ');
                    searchText(allText);
                  }}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs">Search All</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeTextExtraction;