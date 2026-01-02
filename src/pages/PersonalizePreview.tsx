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
  theme?: Theme;
}

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
    navigate("/checkout");
  };

  if (!personalization) {
    return null;
  }

  // A-Z Story-Block Engine
  const storyBlocks: Record<string, string[]> = {
    A: ["The A was with an Aardvark, digging up ants. 'It's for Awesome!' he said, 'Now, go on! Take a chance!'"],
    B: ["A Big, Booming Baboon was balancing B. 'It's for Being so Brave! Now, take it from me!'"],
    C: ["A Castle of clouds held the letter C high. 'It's for Caring!' a kind, clever pixie flew by."],
    D: ["A Dassie was Dozing, all snug on the D. 'It's for Dreaming,' he yawned, 'of all you can be!'"],
    E: ["An Enormous Elephant, Ever-so-gentle and grand, held E in his trunk, right for your little hand."],
    F: ["A Fennec Fox, fluffy and Fast, hurried past. 'This F is for Faith! Hold it tight, make it last!'"],
    G: ["A Giant Giraffe, with his head in the sky, was nibbling a cloud where the G drifted by."],
    H: ["A Happy-hippo-hero, named Harry-the-Brave, was using the H to make a big splashy wave!"],
    I: ["An Impala was leaping, so nimble and high, 'This I is for Inspire! Like stars in the sky!'"],
    J: ["A Jumping Jackal juggled the J with great glee. 'It's for Joy!' he yipped, 'It's the best thing to be!'"],
    K: ["A Kingfisher, quick! with a click-clack-ka-cheer! dived down for the K and said, 'Keep Kindness right here!'"],
    L: ["A Lazy Lion was Lounging on L. 'It's for Love,' he purred softly, 'and Living so well.'"],
    M: ["A Marching Meerkat was holding the M. 'It's for Mercy!' he chirped, 'A most magical gem!'"],
    N: ["A Nimble Nyala, stepped out from the trees. 'This N is for Nice! You're a breeze-on-a-breeze!'"],
    O: ["An Ostrich, so tall, peeked his head from the ground. 'This O is for Open! To all that's around!'"],
    P: ["A Pangolin, covered in plates, held the P. 'It's for Patience,' he mumbled, 'as all grown-ups should be.'"],
    Q: ["A Quiet Quelea (a small finch) in a flock found the Q on a Quiver tree, high on a rock."],
    R: ["A Resting Rhino was Resting, right on the R. 'It's for Respect!' he snorted, 'You'll surely go far!'"],
    S: ["A Springbok was Sleeping right under the S. 'It's for Strong!' he awoke, 'and for Saying your \"Yes!\"'"],
    T: ["A Tortoise, so slow, was Trudging on T. 'It's for Thoughtful,' he mused, 'and Taking-your-time, you see.'"],
    U: ["A Uni-Zebra (a Unicorn, it's true!) was guarding the U and said, 'It's for Unique-You!'"],
    V: ["A Vervet monkey, with a voom and a vash, found the V in a Vine in a lightning-quick flash!"],
    W: ["A Warthog was Wallowing, Watching the W. 'It's for Wonderful! Worthy! And Wise!'"],
    X: ["An 'eXtra' special boX held the X just right. 'It's for eXtra Love! And eXtra bright light!'"],
    Y: ["The Y was held by a hero, 'Mega-Yellow-Mongoose!' 'It's for YOU!' he announced, 'Now let's put it to use!'"],
    Z: ["A Zebra, all Zig-Zagged and Zippy, you see, was Zooming right past with the letter Z!"]
  };

  // Build the book pages
  const buildBook = (name: string, gender: string, skinTone: string, theme: Theme) => {
    const letters = name.toUpperCase().split('').filter(l => /[A-Z]/.test(l));
    const pages: Array<{ type: string; content: string; letter?: string; image?: string }> = [];

    // Title Page
    pages.push({
      type: "title",
      content: `${name}'s Great Name Chase`
    });

    // Letter pages with themed illustrations
    letters.forEach((letter) => {
      const options = storyBlocks[letter];
      if (options && options.length > 0) {
        const letterImage = getLetterImage(
          gender as 'boy' | 'girl',
          skinTone as 'light' | 'dark',
          theme,
          letter
        );
        pages.push({
          type: "letter",
          content: options[0],
          letter: letter,
          image: letterImage
        });
      }
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
    personalization.skinTone || 'light',
    personalization.theme || 'superhero'
  );

  // Background colors for variety
  const bgColors = [
    "from-primary/20 to-accent/10",
    "from-accent/20 to-primary/10",
    "from-blue-100 to-purple-100",
    "from-green-100 to-yellow-100",
    "from-pink-100 to-orange-100"
  ];

  const getThemeLabel = (theme?: Theme) => {
    switch (theme) {
      case "superhero": return "Superhero";
      case "fairytale": return "Fairytale";
      case "animal": return "Animal";
      default: return "Superhero";
    }
  };

  // Render a single book page - aspect ratio 37:21 (book dimensions 37cm x 21cm)
  const renderPage = (page: typeof book[0], index: number) => {
    return (
      <div
        key={index}
        className={`relative aspect-[37/21] shadow-xl rounded-lg overflow-hidden border border-border ${
          page.type === "letter" && page.image ? '' : `bg-gradient-to-br ${bgColors[index % bgColors.length]}`
        }`}
      >
        {/* Letter Page with Themed Illustration */}
        {page.type === "letter" && page.image && (
          <>
            <img
              src={page.image}
              alt={`Letter ${page.letter} illustration`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            {/* Letter Badge */}
            <div className="absolute top-3 left-3 w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
              <span className="font-fredoka text-xl md:text-2xl text-primary-foreground font-bold">
                {page.letter}
              </span>
            </div>
            {/* Story Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <p className="font-fredoka text-xs md:text-sm text-white leading-relaxed text-center">
                {page.content}
              </p>
            </div>
          </>
        )}

        {/* Letter Page without illustration (fallback) */}
        {page.type === "letter" && !page.image && (
          <>
            <div className="absolute top-3 left-3 w-12 h-12 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="font-fredoka text-2xl md:text-3xl text-primary-foreground font-bold">
                {page.letter}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
              <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-full shadow-xl">
                <p className="font-fredoka text-sm md:text-base text-foreground leading-relaxed text-center">
                  {page.content}
                </p>
              </div>
            </div>
          </>
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

        {/* Page Number */}
        <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-inter text-muted-foreground">
          {index + 1}
        </div>
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
                  <p className="font-fredoka text-foreground">{getThemeLabel(personalization.theme)}</p>
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
