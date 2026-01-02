import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getLetterImage } from "@/utils/getLetterImage";

// Child character imports
import charBoyLight from "@/assets/personalization/whiteboy/whiteboy.png";
import charBoyDark from "@/assets/personalization/Blackboy/Blackboy.png";
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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
    R: ["A Resting Rhino was Resting, right on the R! 'It's for Respect!' he snorted, 'You'll surely go far!'"],
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
  const currentPage = book[currentPageIndex];

  const handleNextPage = () => {
    if (currentPageIndex < book.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Background colors for variety
  const bgColors = [
    "from-primary/20 to-accent/10",
    "from-accent/20 to-primary/10",
    "from-blue-100 to-purple-100",
    "from-green-100 to-yellow-100",
    "from-pink-100 to-orange-100"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/personalize-book")}
          className="mb-6 font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Personalization
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Area */}
          <div className="space-y-4">
            <h2 className="font-fredoka text-2xl md:text-3xl text-primary">Book Preview</h2>
            
            {/* Page View */}
            <div className="relative max-w-2xl mx-auto">
              <div className={`relative aspect-[3/4] shadow-2xl rounded-lg overflow-hidden border border-border ${currentPage?.type === "letter" && currentPage?.image ? '' : `bg-gradient-to-br ${bgColors[currentPageIndex % bgColors.length]}`}`}>
                {/* Letter Page with Themed Illustration */}
                {currentPage?.type === "letter" && currentPage?.image && (
                  <>
                    <img
                      src={currentPage.image}
                      alt={`Letter ${currentPage.letter} illustration`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Letter Badge */}
                    <div className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
                      <span className="font-fredoka text-2xl md:text-3xl text-primary-foreground font-bold">
                        {currentPage.letter}
                      </span>
                    </div>
                    {/* Story Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                      <p className="font-fredoka text-sm md:text-base text-white leading-relaxed text-center">
                        {currentPage.content}
                      </p>
                    </div>
                  </>
                )}

                {/* Letter Page without illustration (fallback) */}
                {currentPage?.type === "letter" && !currentPage?.image && (
                  <>
                    <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-fredoka text-3xl md:text-4xl text-primary-foreground font-bold">
                        {currentPage.letter}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                      <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 md:p-8 max-w-lg shadow-xl">
                        <p className="font-fredoka text-base md:text-lg text-foreground leading-relaxed text-center">
                          {currentPage.content}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Title and Climax pages */}
                {(currentPage?.type === "title" || currentPage?.type === "frame-climax") && (
                  <>
                    <img
                      src={getChildCharacter(personalization.gender, personalization.skinTone)}
                      alt="Child character"
                      className="absolute bottom-4 right-4 w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                      <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 md:p-8 max-w-lg shadow-xl">
                        <h1 className="font-fredoka text-2xl md:text-4xl text-primary text-center leading-tight">
                          {currentPage.content}
                        </h1>
                      </div>
                    </div>
                  </>
                )}

                {/* Dedication page */}
                {currentPage?.type === "dedication" && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                    <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-5 md:p-8 max-w-lg shadow-xl">
                      <div className="font-fredoka text-base md:text-lg text-foreground text-center space-y-4">
                        {currentPage.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className="font-inter"
              >
                Previous Page
              </Button>
              <p className="font-inter text-sm text-muted-foreground">
                Page {currentPageIndex + 1} of {book.length}
              </p>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPageIndex >= book.length - 1}
                className="font-inter"
              >
                Next Page
              </Button>
            </div>
          </div>

          {/* Customization Form */}
          <div className="space-y-4">
            <h2 className="font-fredoka text-2xl md:text-3xl text-primary">Final Touches</h2>
            <Card className="border-border shadow-lg">
              <CardContent className="space-y-6 pt-6">
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

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-fredoka text-lg text-primary">Your Personalization</h3>
                  <div className="font-inter text-sm space-y-1 text-foreground">
                    <p><strong>Child's Name:</strong> {personalization.childName}</p>
                    <p><strong>Gender:</strong> {personalization.gender === "boy" ? "Boy" : "Girl"}</p>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full font-inter text-base py-6"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizePreview;
