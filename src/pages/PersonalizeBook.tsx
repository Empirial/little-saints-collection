import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const PersonalizeBook = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("boy");

  const handleCreateBook = () => {
    if (!childName.trim()) {
      return;
    }
    // Save selections to localStorage for the preview page
    localStorage.setItem("personalization", JSON.stringify({ childName, gender }));
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

              <Button
                onClick={handleCreateBook}
                disabled={!childName.trim()}
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
