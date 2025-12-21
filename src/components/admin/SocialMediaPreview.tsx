import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check, Twitter, X, Plus, Hash } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
}

interface SocialMediaPreviewProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (post: BlogPost, hashtags: string[], mentions: string[]) => void;
  isPosting: boolean;
}

// Hashtag mapping based on TSMO's focus areas
const HASHTAG_MAP: Record<string, string[]> = {
  'art': ['#DigitalArt', '#ArtCommunity'],
  'artist': ['#ArtistRights', '#ArtistOnTwitter'],
  'digital': ['#DigitalCreator', '#DigitalArtist'],
  'creator': ['#CreatorEconomy', '#CreatorCommunity'],
  'copyright': ['#CopyrightProtection', '#ArtTheft'],
  'protection': ['#CreatorRights', '#ProtectYourArt'],
  'theft': ['#ArtTheft', '#StopArtTheft'],
  'ai': ['#AIArt', '#NoAITraining'],
  'deepfake': ['#DeepfakeDetection', '#FakeDetector'],
  'blockchain': ['#Web3', '#Blockchain'],
  'nft': ['#NFT', '#CryptoArt'],
  'verify': ['#ContentVerification', '#DigitalAuthenticity'],
  'watermark': ['#WatermarkProtection', '#CreatorTools'],
  'security': ['#DigitalSecurity', '#ContentProtection'],
  'music': ['#MusicProducers', '#MusicianRights'],
  'photography': ['#Photography', '#PhotographerRights'],
};

// Suggested accounts to mention based on content
const SUGGESTED_MENTIONS: { handle: string; description: string; keywords: string[] }[] = [
  { handle: '@ArtistDaily', description: 'Art community', keywords: ['art', 'artist', 'digital', 'creator'] },
  { handle: '@artists_team', description: 'Artists collective', keywords: ['art', 'artist'] },
  { handle: '@copyrightallnc', description: 'Copyright advocacy', keywords: ['copyright', 'protection', 'theft'] },
  { handle: '@CreativeCommons', description: 'Creative licensing', keywords: ['copyright', 'creator'] },
  { handle: '@AIEthicsDaily', description: 'AI ethics news', keywords: ['ai', 'deepfake'] },
  { handle: '@creaborators', description: 'Creator economy', keywords: ['creator', 'digital'] },
];

function generateHashtags(tags: string[], title: string): string[] {
  const hashtags = new Set<string>(['#TSMO']); // Always include branded hashtag
  
  // Process tags
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    Object.entries(HASHTAG_MAP).forEach(([keyword, hashes]) => {
      if (lowerTag.includes(keyword)) {
        hashes.forEach(h => hashtags.add(h));
      }
    });
  });
  
  // Process title
  const lowerTitle = title.toLowerCase();
  Object.entries(HASHTAG_MAP).forEach(([keyword, hashes]) => {
    if (lowerTitle.includes(keyword)) {
      hashes.slice(0, 1).forEach(h => hashtags.add(h)); // Only first match from title
    }
  });
  
  // Limit to 5 hashtags
  return Array.from(hashtags).slice(0, 5);
}

function getSuggestedMentions(tags: string[], title: string): string[] {
  const suggestions: string[] = [];
  const content = [...tags, title].join(' ').toLowerCase();
  
  SUGGESTED_MENTIONS.forEach(mention => {
    if (mention.keywords.some(keyword => content.includes(keyword))) {
      suggestions.push(mention.handle);
    }
  });
  
  return suggestions.slice(0, 3);
}

const SocialMediaPreview = ({ post, open, onOpenChange, onPost, isPosting }: SocialMediaPreviewProps) => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (post) {
      const generated = generateHashtags(post.tags || [], post.title);
      setHashtags(generated);
      const mentions = getSuggestedMentions(post.tags || [], post.title);
      setSelectedMentions(mentions);
    }
  }, [post]);
  
  if (!post) return null;
  
  const blogUrl = `${window.location.origin}/blog/${post.slug}`;
  
  // Build tweet preview
  let tweetText = `📝 New Blog Post: ${post.title}`;
  if (post.excerpt) {
    const maxExcerpt = 100;
    const truncated = post.excerpt.length > maxExcerpt 
      ? post.excerpt.substring(0, maxExcerpt - 3) + "..."
      : post.excerpt;
    tweetText += `\n\n${truncated}`;
  }
  tweetText += `\n\n${blogUrl}`;
  if (hashtags.length > 0) {
    tweetText += `\n\n${hashtags.join(' ')}`;
  }
  if (selectedMentions.length > 0) {
    tweetText += `\n\ncc ${selectedMentions.join(' ')}`;
  }
  
  const charCount = tweetText.length;
  const isOverLimit = charCount > 280;
  
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };
  
  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    const formatted = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`;
    if (!hashtags.includes(formatted)) {
      setHashtags([...hashtags, formatted]);
    }
    setNewHashtag("");
  };
  
  const toggleMention = (mention: string) => {
    if (selectedMentions.includes(mention)) {
      setSelectedMentions(selectedMentions.filter(m => m !== mention));
    } else {
      setSelectedMentions([...selectedMentions, mention]);
    }
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(tweetText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handlePost = () => {
    if (isOverLimit) {
      toast.error("Tweet exceeds 280 characters");
      return;
    }
    onPost(post, hashtags, selectedMentions);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-500" />
            Post to X (Twitter)
          </DialogTitle>
          <DialogDescription>
            Preview and customize your tweet before posting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tweet Preview */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="whitespace-pre-wrap text-sm">{tweetText}</p>
          </div>
          
          {/* Character Count */}
          <div className="flex items-center justify-between">
            {isOverLimit ? (
              <span className="text-xs text-destructive">
                Too long by {charCount - 280} characters. Shorten the excerpt/hashtags.
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Tip: keep it under 280 characters.
              </span>
            )}
            <span
              className={`text-sm font-medium ${
                isOverLimit
                  ? "text-destructive"
                  : charCount > 250
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {charCount}/280
            </span>
          </div>
          
          {/* Hashtags Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Hashtags
            </Label>
            <div className="flex flex-wrap gap-1">
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add hashtag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                className="h-8 text-sm"
              />
              <Button size="sm" variant="outline" onClick={handleAddHashtag} className="h-8" type="button">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Mentions Section */}
          <div className="space-y-2">
            <Label>Suggested Mentions</Label>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_MENTIONS.map(mention => (
                <div key={mention.handle} className="flex items-center gap-2">
                  <Checkbox
                    id={mention.handle}
                    checked={selectedMentions.includes(mention.handle)}
                    onCheckedChange={() => toggleMention(mention.handle)}
                  />
                  <label htmlFor={mention.handle} className="text-sm cursor-pointer">
                    <span className="font-medium text-blue-500">{mention.handle}</span>
                    <span className="text-muted-foreground text-xs block">{mention.description}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handlePost} disabled={isPosting} className="flex-1" type="button">
              {isPosting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Twitter className="h-4 w-4 mr-2" />
              )}
              Post to X
            </Button>
            <Button variant="outline" onClick={handleCopy} type="button">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaPreview;
