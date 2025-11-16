import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const PersonalizePreview = () => {
  const navigate = useNavigate();
  const [personalization, setPersonalization] = useState<{ childName: string; gender: string } | null>(null);
  const [fromField, setFromField] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

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

  // Generate story segments based on child's name
  const generateStory = (name: string) => {
    return `Once upon a time, there was a special child named ${name}. ${name} loved learning about God's amazing love and wonderful stories from the Bible.`;
  };

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
            <Card className="border-border shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[16/9] bg-secondary/20">
                  {/* Layer 1: Background Image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10" />
                  
                  {/* Layer 2: Character Image (based on gender) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${
                      personalization.gender === "boy" 
                        ? "bg-primary/30" 
                        : "bg-accent/30"
                    } flex items-center justify-center`}>
                      <span className="font-fredoka text-4xl md:text-6xl">
                        {personalization.gender === "boy" ? "👦" : "👧"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Layer 3: Dynamic Story Text */}
                  <div className="absolute inset-0 flex items-end p-4 md:p-6">
                    <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 w-full">
                      <p className="font-inter text-sm md:text-base text-foreground leading-relaxed">
                        {generateStory(personalization.childName)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="font-inter text-sm text-muted-foreground text-center">
              This is a preview of your personalized book spread
            </p>
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
