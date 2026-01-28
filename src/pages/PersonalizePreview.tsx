import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, PenSquare, ImageOff, MessageSquare } from "lucide-react"; // Removed Info, Sparkles, Palette, User
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { getLetterImage } from "@/utils/getLetterImage";

// Child character imports
import charBoyLight from "@/assets/personalization/whiteboy/whiteboy.png";
import charBoyDark from "@/assets/personalization/Blackboy/BB.png";
import charGirlLight from "@/assets/personalization/whitegirl/whitegirl.png";
import charGirlDark from "@/assets/personalization/Blackgirl/Blackgirl.png";
import dedicationBackground from "@/assets/personalization/dedication-background.jpg";

type Theme = "superhero" | "fairytale" | "animal";

interface Personalization {
  childName: string;
  gender: string;
  skinTone?: string;
}

// Supabase Storage URL for compulsory pages
const STORAGE_URL = 'https://udaudwkblphataokaexq.supabase.co/storage/v1/object/public/book-assets';

// Get character folder for storage (capitalized names as in storage)
const getCharacterFolder = (gender: string, skinTone: string): string => {
  if (gender === 'boy') {
    return skinTone === 'dark' ? 'Blackboy' : 'Whiteboy';
  }
  return skinTone === 'dark' ? 'Blackgirl' : 'Whitegirl';
};

// Get theme for a letter based on gender and occurrence count - matches PDF generator
const getThemeForLetter = (occurrenceIndex: number, gender: string): Theme => {
  // Must match the edge function order exactly
  const boyThemes: Theme[] = ['superhero', 'animal', 'fairytale'];
  const girlThemes: Theme[] = ['fairytale', 'superhero', 'animal'];

  const themes = gender === 'boy' ? boyThemes : girlThemes;
  return themes[occurrenceIndex % 3];
};

const PersonalizePreview = () => {
  const navigate = useNavigate();
  const [personalization, setPersonalization] = useState<Personalization | null>(null);
  const [fromField, setFromField] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  // 'dedication' = Left Page (From), 'message' = Right Page (Message)
  const [activeModal, setActiveModal] = useState<'dedication' | 'message' | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleImageError = useCallback((index: number) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    setImageErrors(prev => new Set([...prev, index]));
  }, []);

  // Load personalization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("personalization");
    if (saved) {
      setPersonalization(JSON.parse(saved));
    } else {
      navigate("/personalize-book");
    }
  }, [navigate]);

  // Initialize loading state when personalization changes - must be at top level
  useEffect(() => {
    if (personalization) {
      const letters = personalization.childName.toUpperCase().split('').filter(l => /[A-Z]/.test(l));
      // Total pages: cover(1) + intro(2) + letters + ending(2)
      const totalPages = 1 + 2 + letters.length + 2;
      setLoadingImages(new Set(Array.from({ length: totalPages }, (_, i) => i)));
      setImageErrors(new Set());
    }
  }, [personalization]);

  const handleCheckout = () => {
    localStorage.setItem("customization", JSON.stringify({ fromField, personalMessage }));
    navigate("/book-checkout");
  };

  // Early return AFTER all hooks
  if (!personalization) {
    return null;
  }

  // Build the book pages with automatic theme assignment - matches PDF structure
  const buildBook = (name: string, gender: string, skinTone: string) => {
    const letters = name.toUpperCase().split('').filter(l => /[A-Z]/.test(l));
    const characterFolder = getCharacterFolder(gender, skinTone);
    const pages: Array<{ type: string; content?: string; letter?: string; image?: string }> = [];

    // Track letter occurrences for theme cycling
    const letterOccurrences: Map<string, number> = new Map();

    // ============ COVER PAGE ============
    pages.push({
      type: "cover",
      image: `${STORAGE_URL}/${characterFolder}/Cover/cover.jpg`
    });

    // ============ INTRO PAGES ============
    pages.push({
      type: "intro",
      image: `${STORAGE_URL}/${characterFolder}/Intro/1.jpg`
    });
    pages.push({
      type: "intro",
      image: `${STORAGE_URL}/${characterFolder}/Intro/2.jpg`
    });

    // ============ LETTER PAGES ============
    letters.forEach((letter) => {
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      const theme = getThemeForLetter(occurrenceIndex, gender);
      letterOccurrences.set(letter, occurrenceIndex + 1);

      const letterImage = getLetterImage(
        gender as 'boy' | 'girl',
        skinTone as 'light' | 'dark',
        theme,
        letter
      );
      pages.push({
        type: "letter",
        letter: letter,
        image: letterImage
      });
    });

    // ============ ENDING PAGES ============
    pages.push({
      type: "ending",
      image: `${STORAGE_URL}/${characterFolder}/Ending/1.jpg`
    });
    pages.push({
      type: "ending",
      image: `${STORAGE_URL}/${characterFolder}/Ending/2.jpg`
    });

    return pages;
  };

  // Render dedication slide with text overlay (ALWAYS shown - compulsory page)
  const renderDedicationSlide = () => {
    return (
      <div
        className="relative aspect-[634/230] shadow-xl rounded-lg overflow-hidden border border-border"
      >
        {/* Dedication background image */}
        <img
          src={dedicationBackground}
          alt="Dedication page"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Text overlay container - Split into Left and Right pages */}
        <div className="absolute inset-0 grid grid-cols-2">

          {/* LEFT PAGE: Dedication (From Field) */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 text-center pointer-events-none">
            {fromField.trim() ? (
              <div className="max-w-[80%]">
                <p className="font-serif text-xs md:text-base lg:text-lg text-foreground/80 font-medium tracking-wider uppercase">
                  From:
                </p>
                <p className="font-serif text-sm md:text-xl lg:text-2xl text-foreground font-bold mt-2">
                  {fromField}
                </p>
              </div>
            ) : (
              <p className="font-serif text-sm md:text-lg text-muted-foreground/50 italic px-4">
                Dedication (From)
              </p>
            )}
          </div>

          {/* RIGHT PAGE: Message (Personal Message) */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 text-center pointer-events-none">
            {personalMessage.trim() ? (
              <div className="max-w-[75%]">
                <p className="font-serif text-sm md:text-lg lg:text-xl text-foreground/90 leading-relaxed whitespace-pre-wrap tracking-wide">
                  {personalMessage}
                </p>
              </div>
            ) : (
              <p className="font-serif text-sm md:text-lg text-muted-foreground/50 italic px-4">
                Your special message...
              </p>
            )}
          </div>

        </div>
      </div>
    );
  };

  const book = buildBook(
    personalization.childName,
    personalization.gender,
    personalization.skinTone || 'light'
  );

  // Background colors for variety
  const bgColors = [
    "from-primary/20 to-accent/10",
    "from-accent/20 to-primary/10",
    "from-blue-100 to-purple-100",
    "from-green-100 to-yellow-100",
    "from-pink-100 to-orange-100"
  ];
  // Render a single book page - aspect ratio 37:21 (book dimensions 37cm x 21cm)
  const renderPage = (page: typeof book[0], index: number) => {
    // Check if this is a page with a full-bleed image (cover, intro, ending, letter with image)
    const hasFullBleedImage = ['cover', 'intro', 'ending'].includes(page.type) ||
      (page.type === 'letter' && page.image);
    const isLoading = loadingImages.has(index);
    const hasError = imageErrors.has(index);

    const getFallbackLabel = () => {
      if (page.type === 'cover') return 'Cover Page';
      if (page.type === 'intro') return 'Intro Page';
      if (page.type === 'ending') return 'Ending Page';
      if (page.type === 'letter') return `Letter ${page.letter}`;
      return 'Page';
    };

    return (
      <div
        key={index}
        className={`relative aspect-[634/230] shadow-xl rounded-lg overflow-hidden border border-border ${hasFullBleedImage && !hasError ? '' : `bg-gradient-to-br ${bgColors[index % bgColors.length]}`
          }`}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
            <ImageOff className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground font-inter text-sm">{getFallbackLabel()}</p>
            <p className="text-muted-foreground/60 font-inter text-xs mt-1">Upload to Storage</p>
          </div>
        )}

        {/* Cover, Intro, Ending pages - full bleed images from storage */}
        {['cover', 'intro', 'ending'].includes(page.type) && page.image && !hasError && (
          <img
            src={page.image}
            alt={`${page.type} page`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading={index < 3 ? "eager" : "lazy"}
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        )}

        {/* Letter Page with Themed Illustration - Clean, no overlays */}
        {page.type === "letter" && page.image && !hasError && (
          <img
            src={page.image}
            alt={`Letter ${page.letter} illustration`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        )}

        {/* Letter Page without illustration (fallback placeholder) */}
        {page.type === "letter" && !page.image && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="font-fredoka text-4xl text-muted-foreground">
              {page.letter}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 pb-28">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/personalize-book")}
          className="mb-4 font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Page Title */}
        <h1 className="font-fredoka text-2xl md:text-3xl text-primary mb-6">
          Preview Your Book
        </h1>

        {/* Book Pages Grid - 1 column on all screens */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-4xl mx-auto">
          {book.map((page, index) => renderPage(page, index))}
          {/* Dedication slide at the end */}
          {renderDedicationSlide()}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-4 py-3 z-50">
        <div className="container mx-auto flex items-center justify-center gap-3 md:gap-4">

          {/* Dedication Button (Left Page) */}
          <Button
            variant="outline"
            onClick={() => setActiveModal('dedication')}
            className="font-inter flex-1 md:flex-none md:min-w-[120px]"
          >
            <PenSquare className="w-4 h-4 mr-2" />
            Dedication
          </Button>

          {/* Message Button (Right Page) */}
          <Button
            variant="outline"
            onClick={() => setActiveModal('message')}
            className="font-inter flex-1 md:flex-none md:min-w-[120px]"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>

          {/* Proceed Button */}
          <Button
            onClick={handleCheckout}
            className="font-inter flex-1 md:flex-none md:min-w-[140px]"
          >
            Proceed
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Unified Input Modal for Dedication or Message */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-xl text-primary">
              {activeModal === 'dedication' ? 'Dedication (Left Page)' : 'Personal Message (Right Page)'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {activeModal === 'dedication' && (
              <div className="space-y-2">
                <Label htmlFor="from" className="font-inter text-foreground">
                  Who is this book from?
                </Label>
                <Input
                  id="from"
                  placeholder="e.g. Love, Mom & Dad"
                  value={fromField}
                  onChange={(e) => setFromField(e.target.value)}
                  className="font-inter"
                  autoFocus
                />
              </div>
            )}

            {activeModal === 'message' && (
              <div className="space-y-2">
                <Label htmlFor="message" className="font-inter text-foreground">
                  Message to {personalization.childName}
                </Label>
                <Textarea
                  id="message"
                  placeholder="Write a special message..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={5}
                  className="font-inter resize-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setActiveModal(null)} className="w-full font-inter">
              Save & Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalizePreview;
