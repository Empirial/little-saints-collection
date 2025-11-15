import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Package, MessageCircle, Home } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-primary/10 rounded-full mb-6">
            <CheckCircle className="w-24 h-24 text-primary" />
          </div>
          <h1 className="font-fredoka text-5xl md:text-6xl font-bold text-foreground mb-4">
            Thank You!
          </h1>
          <p className="font-inter text-2xl text-muted-foreground">
            Your order has been received
          </p>
        </div>

        {/* Order Confirmation Card */}
        <Card className="p-8 mb-8 shadow-xl">
          <div className="text-center mb-6">
            <Package className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="font-fredoka text-3xl font-bold mb-2">
              Your Collection Is On The Way!
            </h2>
            <p className="font-inter text-lg text-muted-foreground">
              Order Confirmation for Little Saints Poster Collection
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-inter text-lg">9 Christian Posters (A4)</span>
              <span className="font-fredoka text-2xl font-bold text-primary">R270</span>
            </div>
            <p className="font-inter text-sm text-muted-foreground">
              Premium 350mg paper • High-quality prints
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-fredoka font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-fredoka text-lg font-bold mb-1">
                  WhatsApp Confirmation
                </h3>
                <p className="font-inter text-muted-foreground">
                  We'll contact you shortly on WhatsApp to confirm your order details and arrange payment
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-fredoka font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-fredoka text-lg font-bold mb-1">
                  Secure Payment
                </h3>
                <p className="font-inter text-muted-foreground">
                  Complete your payment securely through our verified payment options
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-fredoka font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-fredoka text-lg font-bold mb-1">
                  Courier Notification
                </h3>
                <p className="font-inter text-muted-foreground">
                  Once shipped, you'll receive a notification with your tracking details via WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-fredoka font-bold text-accent-foreground">✓</span>
              </div>
              <div>
                <h3 className="font-fredoka text-lg font-bold mb-1">
                  Delivery
                </h3>
                <p className="font-inter text-muted-foreground">
                  Your beautiful poster collection will arrive within 3-5 business days
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Card */}
        <Card className="p-6 mb-8 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-4">
            <MessageCircle className="w-12 h-12 text-accent" />
            <div className="flex-1">
              <h3 className="font-fredoka text-xl font-bold mb-1">
                Questions or Issues?
              </h3>
              <p className="font-inter text-muted-foreground mb-2">
                Contact us anytime on WhatsApp
              </p>
              <a 
                href="https://wa.me/27791175714" 
                className="font-fredoka text-lg font-bold text-primary hover:text-primary/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                +27 79 117 5714
              </a>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")}
            size="lg"
            className="font-fredoka text-lg px-8"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate("/product")}
            variant="outline"
            size="lg"
            className="font-fredoka text-lg px-8"
          >
            View Collection Again
          </Button>
        </div>

        {/* Trust Message */}
        <div className="text-center mt-12">
          <p className="font-fredoka text-3xl font-bold text-primary mb-2">
            Little Saints
          </p>
          <p className="font-inter text-muted-foreground">
            Thank you for choosing us to inspire faith in your little ones! 🙏✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
