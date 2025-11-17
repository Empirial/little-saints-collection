import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import charBoyLight from "@/assets/personalization/whiteboy.png";
import charBoyDark from "@/assets/personalization/Darkskinnedboy.png";
import charGirlLight from "@/assets/personalization/lightskingirl.png";
import charGirlDark from "@/assets/personalization/darkskingirl.png";

const PersonalizeBook = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("boy");
  const [skinTone, setSkinTone] = useState<"light" | "dark" | "">("");

  const handleCreateBook = () => {
    if (!childName.trim() || !skinTone) {
      return;
    }
    // Save selections to localStorage for the preview page
    localStorage.setItem("personalization", JSON.stringify({ childName, gender, skinTone }));
    navigate("/personalize-preview");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
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
                <RadioGroup value={gender} onValueChange={setGender} className="flex flex-col space-y-2">
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

              <Button
                onClick={handleCreateBook}
                disabled={!childName.trim() || !skinTone}
                className="w-full font-inter text-base py-6"
                size="lg"
              >
                Create My Book
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizeBook;
