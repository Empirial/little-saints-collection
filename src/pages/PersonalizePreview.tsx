import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, MessageSquare, Info, User, Sparkles, Palette } from "lucide-react";
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

type Theme = "superhero" | "fairytale" | "animal";

interface Personalization {
  childName: string;
  gender: string;
  skinTone?: string;
}

// Get theme for a letter based on gender and occurrence count
const getThemeForLetter = (occurrenceIndex: number, gender: string): Theme => {
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
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Get child character based on gender and skin tone
  const getChildCharacter = (gender: string, skinTone?: string) => {
    if (gender === "boy") {
      return skinTone === "dark" ? charBoyDark : charBoyLight;
    }
    return skinTone === "dark" ? charGirlDark : charGirlLight;
  };

  useEffect(() => {
    const saved = localStorage.getItem("personalization");
    if (saved) {
      setPersonalization(JSON.parse(saved));
    } else {
      navigate("/personalize-book");
    }
  }, [navigate]);

  const handleCheckout = () => {
    localStorage.setItem("customization", JSON.stringify({ fromField, personalMessage }));
    navigate("/book-checkout");
  };

  if (!personalization) {
    return null;
  }

  // Build the book pages with automatic theme assignment
  const buildBook = (name: string, gender: string, skinTone: string) => {
    const letters = name.toUpperCase().split('').filter(l => /[A-Z]/.test(l));
    const pages: Array<{ type: string; content?: string; letter?: string; image?: string }> = [];
    
    // Track letter occurrences for theme cycling
    const letterOccurrences: Map<string, number> = new Map();

    // Title Page
    pages.push({
      type: "title",
      content: `${name}'s Great Name Chase`
    });

    // Letter pages with dynamically themed illustrations
    letters.forEach((letter) => {
      // Get current occurrence count for this letter
      const occurrenceIndex = letterOccurrences.get(letter) || 0;
      
      // Get theme based on gender and occurrence
      const theme = getThemeForLetter(occurrenceIndex, gender);
      
      // Increment occurrence count for this letter
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

    // Climax
    pages.push({
      type: "frame-climax",
      content: `The chase was all over! The letters were found. They zipped and they zoomed with a magical sound. Each one was a piece of what makes YOU so you! Your name is a marvel, a joy, and a prize.`
    });

    // Dedication
    pages.push({
      type: "dedication",
      content: `To ${name}, with love${fromField ? ` from ${fromField}` : ''}.\n\n${personalMessage || 'You are loved beyond measure.'}`
    });

    return pages;
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
    return (
      <div
        key={index}
        className={`relative aspect-[37/21] shadow-xl rounded-lg overflow-hidden border border-border ${
          page.type === "letter" && page.image ? '' : `bg-gradient-to-br ${bgColors[index % bgColors.length]}`
        }`}
      >
        {/* Letter Page with Themed Illustration - Clean, no overlays */}
        {page.type === "letter" && page.image && (
          <img
            src={page.image}
            alt={`Letter ${page.letter} illustration`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
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

        {/* Title and Climax pages */}
        {(page.type === "title" || page.type === "frame-climax") && (
          <>
            <img
              src={getChildCharacter(personalization.gender, personalization.skinTone)}
              alt="Child character"
              className="absolute bottom-3 right-3 w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
              <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-full shadow-xl">
                <h1 className="font-fredoka text-lg md:text-2xl text-primary text-center leading-tight">
                  {page.content}
                </h1>
              </div>
            </div>
          </>
        )}

        {/* Dedication page */}
        {page.type === "dedication" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
            <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-full shadow-xl">
              <div className="font-fredoka text-sm md:text-base text-foreground text-center space-y-3">
                {page.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>
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
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-4 py-3 z-50">
        <div className="container mx-auto flex items-center justify-center gap-3 md:gap-4">
          <Button
            variant="outline"
            onClick={() => setShowSpecsModal(true)}
            className="font-inter flex-1 md:flex-none md:min-w-[120px]"
          >
            <Info className="w-4 h-4 mr-2" />
            Specs
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMessageModal(true)}
            className="font-inter flex-1 md:flex-none md:min-w-[120px]"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={handleCheckout}
            className="font-inter flex-1 md:flex-none md:min-w-[140px]"
          >
            Proceed
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Specs Modal */}
      <Dialog open={showSpecsModal} onOpenChange={setShowSpecsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-xl text-primary">Book Specifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Child Character Preview */}
            <div className="flex justify-center">
              <img
                src={getChildCharacter(personalization.gender, personalization.skinTone)}
                alt="Child character"
                className="w-24 h-24 object-contain drop-shadow-lg"
              />
            </div>
            
            {/* Info Items */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-inter">Child's Name</p>
                  <p className="font-fredoka text-foreground">{personalization.childName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-inter">Gender</p>
                  <p className="font-fredoka text-foreground">{personalization.gender === "boy" ? "Boy" : "Girl"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-inter">Theme</p>
                  <p className="font-fredoka text-foreground">Auto-assigned based on name</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-inter">Total Pages</p>
                  <p className="font-fredoka text-foreground">{book.length} pages</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSpecsModal(false)} className="w-full font-inter">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fredoka text-xl text-primary">Add Your Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from" className="font-inter text-foreground">
                From
              </Label>
              <Input
                id="from"
                placeholder="Who is this gift from?"
                value={fromField}
                onChange={(e) => setFromField(e.target.value)}
                className="font-inter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-inter text-foreground">
                Personal Message (Dedication)
              </Label>
              <Textarea
                id="message"
                placeholder="Write a special message for your child..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                rows={5}
                className="font-inter resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMessageModal(false)} className="w-full font-inter">
              Save & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalizePreview;
