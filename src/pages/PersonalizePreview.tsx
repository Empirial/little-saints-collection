import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

// Child character imports
import DarkskinnedBoy from "@/assets/personalization/Darkskinnedboy.png";
import DarkskinGirl from "@/assets/personalization/darkskingirl.png";
import LightskinGirl from "@/assets/personalization/lightskingirl.png";
import WhiteBoy from "@/assets/personalization/whiteboy.png";

// Character imports for letters
import AardvarkChar from "@/assets/personalization/characters/Whimsical Aardvark.png";
import AngelChar from "@/assets/personalization/characters/Whimsical Angel.png";
import AntelopeManChar from "@/assets/personalization/characters/Amazing Antelope-Man.png";
import ElasticElandChar from "@/assets/personalization/characters/Elastic-Eland.png";
import EnchantedElfChar from "@/assets/personalization/characters/Enchanted Elf.png";
import ElephantChar from "@/assets/personalization/characters/Whimsical Elephant.png";
import LeopardChar from "@/assets/personalization/characters/Whimsical Leopard.png";
import LightningLeopardChar from "@/assets/personalization/characters/Lightning-Leopard.png";
import LionChar from "@/assets/personalization/characters/Whimsical Lion.png";
import MeerkatChar from "@/assets/personalization/characters/Zippy Meerkat.png";
import MermaidChar from "@/assets/personalization/characters/Whimsical Mermaid.png";
import MongooseChar from "@/assets/personalization/characters/Whimsical Mongoose.png";
import NguniChar from "@/assets/personalization/characters/Whimsical 'Nguni-Boy'.png";
import NyalaChar from "@/assets/personalization/characters/Whimsical Nyala.png";
import OlympicOryxChar from "@/assets/personalization/characters/Whimsical 'Olympic-Oryx'.png";
import OstrichChar from "@/assets/personalization/characters/Whimsical Ostrich.png";
import RhinoChar from "@/assets/personalization/characters/Whimsical Rhino.png";
import RocketRhinoChar from "@/assets/personalization/characters/Whimsical 'Rocket Rhino'.png";
import RainbowKeeperChar from "@/assets/personalization/characters/Whimsical 'Rainbow-Keeper'.png";
import SpringbokChar from "@/assets/personalization/characters/Whimsical Springbok.png";
import SecretaryBirdChar from "@/assets/personalization/characters/Whimsical 'Super-Secretary-Bird.png";

// Background imports
import BedroomLeft from "@/assets/personalization/theme/bedroom-left.png";
import BedroomRight from "@/assets/personalization/theme/bedroom-right.png";
import CoastLeft from "@/assets/personalization/theme/Aerial View over SA Coast-left.png";
import CoastRight from "@/assets/personalization/theme/Aerial View over SA Coast-right.png";
import CityLeft from "@/assets/personalization/theme/Futuristic African City-left.png";
import CityRight from "@/assets/personalization/theme/Futuristic African City-right.png";
import PowerLeft from "@/assets/personalization/theme/Power Surge Landscape-left.png";
import PowerRight from "@/assets/personalization/theme/Power Surge Landscape-right.png";
import WaterfallLeft from "@/assets/personalization/theme/Secret Waterfall Base-left.png";
import WaterfallRight from "@/assets/personalization/theme/Secret Waterfall Base-right.png";

const PersonalizePreview = () => {
  const navigate = useNavigate();
  const [personalization, setPersonalization] = useState<{ childName: string; gender: string } | null>(null);
  const [fromField, setFromField] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);

  // Character mappings based on letter and theme
  const characterMapping: Record<string, { character: string; theme: string }> = {
    A: { character: AardvarkChar, theme: "animal" },
    B: { character: AntelopeManChar, theme: "superhero" },
    C: { character: AngelChar, theme: "fairytale" },
    D: { character: ElephantChar, theme: "animal" },
    E: { character: ElasticElandChar, theme: "superhero" },
    F: { character: EnchantedElfChar, theme: "fairytale" },
    G: { character: LionChar, theme: "animal" },
    H: { character: MeerkatChar, theme: "animal" },
    I: { character: LightningLeopardChar, theme: "superhero" },
    J: { character: MongooseChar, theme: "animal" },
    K: { character: MermaidChar, theme: "fairytale" },
    L: { character: LeopardChar, theme: "animal" },
    M: { character: MeerkatChar, theme: "animal" },
    N: { character: NguniChar, theme: "superhero" },
    O: { character: OlympicOryxChar, theme: "superhero" },
    P: { character: OstrichChar, theme: "animal" },
    Q: { character: NyalaChar, theme: "animal" },
    R: { character: RocketRhinoChar, theme: "superhero" },
    S: { character: SecretaryBirdChar, theme: "superhero" },
    T: { character: SpringbokChar, theme: "animal" },
    U: { character: RhinoChar, theme: "animal" },
    V: { character: MongooseChar, theme: "animal" },
    W: { character: RhinoChar, theme: "animal" },
    X: { character: RainbowKeeperChar, theme: "fairytale" },
    Y: { character: MongooseChar, theme: "superhero" },
    Z: { character: MeerkatChar, theme: "animal" },
  };

  // Background mappings
  const backgrounds = {
    left: [BedroomLeft, CoastLeft, CityLeft, PowerLeft, WaterfallLeft],
    right: [BedroomRight, CoastRight, CityRight, PowerRight, WaterfallRight],
  };

  // Get child character based on gender
  const getChildCharacter = (gender: string) => {
    return gender === "boy" ? DarkskinnedBoy : DarkskinGirl;
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
    // Save final customizations
    localStorage.setItem("customization", JSON.stringify({ fromField, personalMessage }));
    navigate("/checkout");
  };

  if (!personalization) {
    return null;
  }

  // A-Z Story-Block Engine
  const storyBlocks: Record<string, string[]> = {
    A: [
      "The A was with an Aardvark, digging up ants. 'It's for Awesome!' he said, 'Now, go on! Take a chance!'",
      "An Angel was polishing the letter A bright. 'It stands for Adored! You're a wonderful sight!'",
      "Amazing Antelope-Man, with a zip-zap-ka-cheer! 'This A is for Action! Chase away every fear!'"
    ],
    B: [
      "A Big, Booming Baboon was balancing B. 'It's for Being so Brave! Now, take it from me!'",
      "Bold-Boy with a cape, flew down with a zip! 'This B is for Blessed!' he said with a flip."
    ],
    C: [
      "A Castle of clouds held the letter C high. 'It's for Caring!' a kind, clever pixie flew by.",
      "A Cunning Caracal Crouched on the C-stump. 'It's for Clever!' he purred with a thumpity-thump."
    ],
    D: [
      "A Dassie was Dozing, all snug on the D. 'It's for Dreaming,' he yawned, 'of all you can be!'",
      "A Dragon (a kind one, with sparkly-green scales) was using the D to deliver the mails. 'It's for Daring!' he roared, 'Go on! Never fail!'"
    ],
    E: [
      "An Enormous Elephant, Ever-so-gentle and grand, held E in his trunk, right for your little hand. 'It's for Excellent! Everything just as we planned!'",
      "Elastic-Eland (a hero so tall) was stretching the E to help rescue a ball. 'It's for Effort!' he cheered, 'You're giving your all!'",
      "An Enchanted Elf-friend was singing a tune. 'This E is for Excited, from morning 'til noon!'"
    ],
    F: [
      "A Fennec Fox, fluffy and Fast, hurried past. 'This F is for Faith! Hold it tight, make it last!'",
      "A Fairy-Queen waved her wand with a flick! 'This F is for Friendship, so loyal and quick!'"
    ],
    G: [
      "A Giant Giraffe, with his head in the sky, was nibbling a cloud where the G drifted by. 'It's for Gentle and Good!' he said with a sigh.",
      "Gracious-Gal gave the G with a Grin. 'It's for Giving and Grace! Let the goodness begin!'"
    ],
    H: [
      "A Happy-hippo-hero, named Harry-the-Brave, was using the H to make a big splashy wave! 'It's for Happiness!' he cheered, 'and how you behave!'",
      "A Horned Horse (A Uni-Zebra). 'This H is for Honest! Be truthful all day!'"
    ],
    I: [
      "An Impala was leaping, so nimble and high, 'This I is for Inspire! Like stars in the sky!'",
      "An Iridescent Iris-Fairy, so bright, held the I in her hands, a-glowing with light. 'It's for Imagination! And doing what's right!'",
      "Incredible-Ibis (a hero so smart) was guarding the I, for your Intelligent heart!"
    ],
    J: [
      "A Jumping Jackal juggled the J with great glee. 'It's for Joy!' he yipped, 'It's the best thing to be!'"
    ],
    K: [
      "A Kingfisher, quick! with a click-clack-ka-cheer! dived down for the K and said, 'Keep Kindness right here!'",
      "A King on a throne (made of flowers and moss) declared, 'This K is for Knowledge! You're smart as a boss!'"
    ],
    L: [
      "A Lazy Lion was Lounging on L. 'It's for Love,' he purred softly, 'and Living so well.'",
      "Lightning-Leopard (a hero so bright) was chasing the L, a-glowing with Light!"
    ],
    M: [
      "A Marching Meerkat was holding the M. 'It's for Mercy!' he chirped, 'A most magical gem!'",
      "A Magical Mermaid (in a freshwater spring!) said 'This M is for Music, and the joy that you bring!'"
    ],
    N: [
      "A Nimble Nyala, stepped out from the trees. 'This N is for Nice! You're a breeze-on-a-breeze!'",
      "Nguni-Boy (strong as a bull, but so kind) held the N for your Noble and wonderful mind."
    ],
    O: [
      "An Ostrich, so tall, peeked his head from the ground. 'This O is for Open! To all that's around!'",
      "An Ogre (a nice one!) was guarding the O. 'It's for Only-One-You! Now, where will you go?'",
      "Olympic-Oryx was leaping a hoop. 'This O is for Outstanding!' he yelled with a whoop!"
    ],
    P: [
      "A Pangolin, covered in plates, held the P. 'It's for Patience,' he mumbled, 'as all grown-ups should be.'",
      "A Princess (or Prince!) in a Palace so grand said, 'This P is for Promise, hold it tight in your hand!'"
    ],
    Q: [
      "A Quiet Quelea (a small finch) in a flock found the Q on a Quiver tree, high on a rock. 'It's for Quiet,' she peeped, 'when you listen and pray.'"
    ],
    R: [
      "A Resting Rhino was Resting, right on the R! 'It's for Respect!' he snorted, 'You'll surely go far!'",
      "A Royal Rainbow-Keeper (a keeper of light) said 'R is for Radiant, and all that is bright!'"
    ],
    S: [
      "A Springbok was Sleeping right under the S. 'It's for Strong!' he awoke, 'and for Saying your \"Yes!\"'",
      "Super-Secretary-Bird (with magnificent flair) had the S in his crest, flying high in the air! 'It's for Sunshine and Smiles, which you give everywhere!'"
    ],
    T: [
      "A Tortoise, so slow, was Trudging on T. 'It's for Thoughtful,' he mused, 'and Taking-your-time, you see.'",
      "A Troll with a Treasure of Twinkling things, said 'T is for Thankful, for the blessings life brings.'"
    ],
    U: [
      "A Uni-Zebra (a Unicorn, it's true!) was guarding the U and said, 'It's for Unique-You!'",
      "Up-Up-and-Away-Boy flew down from the blue. 'This U is for Uplifting! It's what good heroes do!'",
      "An Unhurried Umbre-bird, under a tree, said 'U is for Understanding, for you and for me.'"
    ],
    V: [
      "A Vervet monkey, with a voom and a vash, found the V in a Vine in a lightning-quick flash! 'It's for Virtue and Value! Now quick, make a dash!'"
    ],
    W: [
      "A Warthog was Wallowing, Watching the W. 'It's for Wonderful! Worthy! And Wise! (That's no trouble!)'"
    ],
    X: [
      "An 'eXtra' special boX held the X just right. 'It's for eXtra Love! And eXtra bright light!'"
    ],
    Y: [
      "The Y was held by a hero, 'Mega-Yellow-Mongoose!' 'It's for YOU!' he announced, 'Now let's put it to use!'"
    ],
    Z: [
      "A Zebra, all Zig-Zagged and Zippy, you see, was Zooming right past with the letter Z! 'It's for Zeal!' he said, 'for your amazing ener-ZY!'"
    ]
  };

  // Build the 16-page book structure
  const buildBook = (name: string) => {
    const letters = name.toUpperCase().split('');
    const pages: Array<{ type: string; content: string }> = [];

    // Page 1: Title Page
    pages.push({
      type: "title",
      content: `${name}'s Great Name Chase`
    });

    // Pages 2-3: Frame Story - Start
    pages.push({
      type: "frame-start",
      content: `One morning, ${name} woke up with a YELP! The letters that made them, all needed some help! They'd wiggled and jiggled and bounced out the door. ${name.toUpperCase().split('').join('-')} was not there anymore! A zippy Meerkat hero appeared with a flash: 'Your letters are out! We must go, in a dash!'`
    });

    // Pages 4-13: Dynamic A-Z Story Blocks (one page per letter)
    letters.forEach((letter) => {
      const options = storyBlocks[letter];
      if (options && options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        pages.push({
          type: "letter",
          content: options[randomIndex]
        });
      }
    });

    // Pages 14-15: Frame Story - Climax
    pages.push({
      type: "frame-climax",
      content: `The chase was all over! The letters were found. They zipped and they zoomed with a magical sound. They weren't just letters, ${name} saw it was true... Each one was a piece of what makes YOU so you! Your name is a marvel, a joy, and a prize. The person your family once wished for, their wonderful 'Answered Prayer' in their eyes.`
    });

    // Page 16: Dedication Page
    pages.push({
      type: "dedication",
      content: `To ${name}, with love${fromField ? ` from ${fromField}` : ''}.\n\n${personalMessage || 'You are loved beyond measure.'}`
    });

    return pages;
  };

  const book = personalization ? buildBook(personalization.childName) : [];
  const totalSpreads = Math.ceil(book.length / 2);

  const handleNextSpread = () => {
    if (currentSpreadIndex < totalSpreads - 1) {
      setCurrentSpreadIndex(currentSpreadIndex + 1);
    }
  };

  const handlePrevSpread = () => {
    if (currentSpreadIndex > 0) {
      setCurrentSpreadIndex(currentSpreadIndex - 1);
    }
  };

  const leftPageIndex = currentSpreadIndex * 2;
  const rightPageIndex = leftPageIndex + 1;
  const leftPage = book[leftPageIndex];
  const rightPage = book[rightPageIndex];

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
            
            {/* Two-Page Spread */}
            <div className="grid grid-cols-2 gap-2">
              {/* Left Page */}
              {leftPage && (
                <Card className="border-border shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] bg-background overflow-hidden">
                      {/* Layer 1: Background Image */}
                      <img
                        src={backgrounds.left[currentSpreadIndex % backgrounds.left.length]}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Layer 2: Character Images */}
                      {leftPage.type === "letter" && leftPageIndex >= 3 && (
                        <img
                          src={characterMapping[personalization.childName.toUpperCase().split('')[leftPageIndex - 3]]?.character || MeerkatChar}
                          alt="Character"
                          className="absolute bottom-4 right-4 w-32 h-32 object-contain drop-shadow-lg"
                        />
                      )}
                      {leftPage.type === "frame-start" && (
                        <img
                          src={getChildCharacter(personalization.gender)}
                          alt="Child character"
                          className="absolute bottom-4 left-4 w-32 h-32 object-contain drop-shadow-lg"
                        />
                      )}
                      
                      {/* Layer 3: Text Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 w-full max-h-full overflow-y-auto shadow-lg">
                          <p className="font-fredoka text-sm md:text-base text-foreground leading-relaxed whitespace-pre-line">
                            {leftPage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Right Page */}
              {rightPage && (
                <Card className="border-border shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] bg-background overflow-hidden">
                      {/* Layer 1: Background Image */}
                      <img
                        src={backgrounds.right[currentSpreadIndex % backgrounds.right.length]}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Layer 2: Character Images */}
                      {rightPage.type === "letter" && rightPageIndex >= 3 && (
                        <img
                          src={characterMapping[personalization.childName.toUpperCase().split('')[rightPageIndex - 3]]?.character || MeerkatChar}
                          alt="Character"
                          className="absolute bottom-4 left-4 w-32 h-32 object-contain drop-shadow-lg"
                        />
                      )}
                      {rightPage.type === "frame-climax" && (
                        <img
                          src={getChildCharacter(personalization.gender)}
                          alt="Child character"
                          className="absolute bottom-4 right-4 w-32 h-32 object-contain drop-shadow-lg"
                        />
                      )}
                      
                      {/* Layer 3: Text Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 w-full max-h-full overflow-y-auto shadow-lg">
                          <p className="font-fredoka text-sm md:text-base text-foreground leading-relaxed whitespace-pre-line">
                            {rightPage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevSpread}
                disabled={currentSpreadIndex === 0}
                className="font-inter"
              >
                Previous Page
              </Button>
              <p className="font-inter text-sm text-muted-foreground">
                Pages {leftPageIndex + 1}-{rightPageIndex + 1} of {book.length}
              </p>
              <Button
                variant="outline"
                onClick={handleNextSpread}
                disabled={currentSpreadIndex >= totalSpreads - 1}
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
