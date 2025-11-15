import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order received! Redirecting to confirmation...");
    setTimeout(() => navigate("/thank-you"), 1500);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6 h-fit">
            <h2 className="font-fredoka text-2xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-inter font-semibold">Little Saints Poster Collection</h3>
                  <p className="text-sm text-muted-foreground">9 Christian-themed posters</p>
                </div>
                <p className="font-fredoka text-lg font-semibold">R270</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="font-fredoka">Total</span>
                <span className="font-fredoka text-primary">R270</span>
              </div>
            </div>
          </Card>

          {/* Checkout Form */}
          <Card className="p-6">
            <h2 className="font-fredoka text-2xl font-bold mb-6">Your Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (WhatsApp) *</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  required 
                  placeholder="+27 79 117 5714"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea 
                  id="address" 
                  required 
                  placeholder="Street address, City, Province, Postal Code"
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any special instructions or requests"
                  className="mt-1"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full font-fredoka text-lg"
                >
                  Complete Order - R270
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  We'll contact you on WhatsApp to arrange secure payment and delivery
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
