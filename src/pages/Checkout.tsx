import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import posterCollection from "@/assets/poster-collection.jpg"; // Add your collection image

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
          <div className="space-y-6">
            {/* Collection Image Card */}
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-background">
                <img 
                  src={posterCollection} 
                  alt="Little Saints Poster Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Order Details */}
            <Card className="p-6">
              <h2 className="font-fredoka text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-fredoka font-bold text-lg mb-1">Little Saints Poster Collection</h3>
                    <p className="text-sm text-muted-foreground mb-2">9 Christian-themed A4 posters</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>✓ Premium 350mg paper quality</p>
                      <p>✓ Vibrant, child-friendly colors</p>
                      <p>✓ Free delivery across SA</p>
                    </div>
                  </div>
                  <p className="font-fredoka text-xl font-bold text-primary">R270</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-inter text-muted-foreground">Subtotal</span>
                  <span className="font-inter">R270</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-inter text-muted-foreground">Delivery</span>
                  <span className="font-inter text-accent font-semibold">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
                  <span className="font-fredoka">Total</span>
                  <span className="font-fredoka text-primary">R270</span>
                </div>
              </div>

              <div className="mt-6 bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="font-inter text-sm text-center font-medium">
                  🎉 Free delivery included!
                </p>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <Card className="p-6 h-fit">
            <h2 className="font-fredoka text-2xl font-bold mb-6">Your Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-inter font-semibold">Full Name *</Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-inter font-semibold">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="john@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-inter font-semibold">Phone Number (WhatsApp) *</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  required 
                  placeholder="+27 79 117 5714"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="address" className="font-inter font-semibold">Delivery Address *</Label>
                <Textarea 
                  id="address" 
                  required 
                  placeholder="Street address, City, Province, Postal Code"
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="font-inter font-semibold">Order Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any special instructions or requests"
                  className="mt-1.5"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full font-fredoka text-lg py-6"
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
