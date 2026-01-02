import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Clock, Shield, Sparkles, PawPrint } from "lucide-react";
import Navbar from "@/components/Navbar";
import charBoyLight from "@/assets/personalization/whiteboy/whiteboy.png";
import charBoyDark from "@/assets/personalization/Blackboy/Blackboy.png";
import charGirlLight from "@/assets/personalization/whitegirl/whitegirl.png";
import charGirlDark from "@/assets/personalization/Blackgirl/Blackgirl.png";

type Theme = "superhero" | "fairytale" | "animal" | "";

const PersonalizeBook = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("boy");
  const [skinTone, setSkinTone] = useState<"light" | "dark" | "">("");
  const [theme, setTheme] = useState<Theme>("");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const handleCreateBook = () => {
    if (!childName.trim() || !skinTone || !theme) {
      return;
    }
    
    // Check for secret access code
    if (accessCode === "12345") {
      localStorage.setItem("personalization", JSON.stringify({ childName, gender, skinTone, theme }));
      navigate("/personalize-preview");
      return;
    }
    
    // Show coming soon for regular users
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8 md:pt-24 md:pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
          {showComingSoon ? (
            <Card className="border-border shadow-lg text-center">
              <CardContent className="py-12 space-y-6">
                <Clock className="w-16 h-16 mx-auto text-primary" />
                <h2 className="font-fredoka text-3xl md:text-4xl text-primary">
                  Coming Soon!
                </h2>
                <p className="font-inter text-muted-foreground text-lg max-w-md mx-auto">
                  We're still putting the finishing touches on our personalized books. Check back soon!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowComingSoon(false)}
                  className="font-inter"
                >
                  Go Back
                </Button>
                
                {/* Secret access code input */}
                <div className="pt-8 border-t border-border/50">
                  <Input
                    type="text"
                    placeholder="Access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="max-w-[120px] mx-auto text-center text-xs h-8 text-muted-foreground/50"
                  />
                  {accessCode === "12345" && (
                    <Button
                      onClick={() => {
                        localStorage.setItem("personalization", JSON.stringify({ childName, gender, skinTone, theme }));
                        navigate("/personalize-preview");
                      }}
                      className="mt-2 text-xs"
                      size="sm"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-lg">
              <CardHeader className="space-y-2">
                <CardTitle className="font-fredoka text-3xl md:text-4xl text-primary">
                  Personalize Your Book
                </CardTitle>
                <CardDescription className="font-inter text-base text-muted-foreground">
                  Create a unique Bible story book tailored just for your child
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="childName" className="font-inter text-foreground">
                    Child's Name
                  </Label>
                  <Input
                    id="childName"
                    placeholder="Enter your child's name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="font-inter"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-inter text-foreground">Gender</Label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="boy" id="boy" />
                      <Label htmlFor="boy" className="font-inter font-normal cursor-pointer">
                        Boy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="girl" id="girl" />
                      <Label htmlFor="girl" className="font-inter font-normal cursor-pointer">
                        Girl
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="font-inter text-foreground">Choose Your Character</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {gender === "boy" ? (
                      <>
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            skinTone === "light" ? "border-primary border-4" : "border-border"
                          }`}
                          onClick={() => setSkinTone("light")}
                        >
                          <CardContent className="p-4">
                            <img
                              src={charBoyLight}
                              alt="Lighter skin tone boy"
                              className="w-full h-auto rounded-lg"
                            />
                          </CardContent>
                        </Card>
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            skinTone === "dark" ? "border-primary border-4" : "border-border"
                          }`}
                          onClick={() => setSkinTone("dark")}
                        >
                          <CardContent className="p-4">
                            <img
                              src={charBoyDark}
                              alt="Darker skin tone boy"
                              className="w-full h-auto rounded-lg"
                            />
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <>
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            skinTone === "light" ? "border-primary border-4" : "border-border"
                          }`}
                          onClick={() => setSkinTone("light")}
                        >
                          <CardContent className="p-4">
                            <img
                              src={charGirlLight}
                              alt="Lighter skin tone girl"
                              className="w-full h-auto rounded-lg"
                            />
                          </CardContent>
                        </Card>
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            skinTone === "dark" ? "border-primary border-4" : "border-border"
                          }`}
                          onClick={() => setSkinTone("dark")}
                        >
                          <CardContent className="p-4">
                            <img
                              src={charGirlDark}
                              alt="Darker skin tone girl"
                              className="w-full h-auto rounded-lg"
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label className="font-inter text-foreground">Choose Your Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        theme === "superhero" ? "border-primary border-4" : "border-border"
                      }`}
                      onClick={() => setTheme("superhero")}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <Shield className="w-10 h-10 text-primary" />
                        <span className="font-inter text-sm text-center">Superhero</span>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        theme === "fairytale" ? "border-primary border-4" : "border-border"
                      }`}
                      onClick={() => setTheme("fairytale")}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <Sparkles className="w-10 h-10 text-primary" />
                        <span className="font-inter text-sm text-center">Fairytale</span>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        theme === "animal" ? "border-primary border-4" : "border-border"
                      }`}
                      onClick={() => setTheme("animal")}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <PawPrint className="w-10 h-10 text-primary" />
                        <span className="font-inter text-sm text-center">Wild Animal</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Secret access code input - subtle at bottom */}
                <div className="pt-4">
                  <Input
                    type="text"
                    placeholder=""
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="max-w-[80px] text-center text-xs h-6 border-transparent focus:border-border text-muted-foreground/30"
                  />
                </div>

                <Button
                  onClick={handleCreateBook}
                  disabled={!childName.trim() || !skinTone || !theme}
                  className="w-full font-inter text-base py-6"
                  size="lg"
                >
                  Create My Book
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizeBook;
