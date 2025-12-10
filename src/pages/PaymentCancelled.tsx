import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="font-fredoka text-3xl font-bold text-foreground mb-2">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground">
            Your payment was cancelled. Don't worry, no charges were made.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h3 className="font-fredoka font-bold mb-2">Need help?</h3>
          <p className="text-sm text-muted-foreground">
            If you experienced any issues during checkout, please don't hesitate to reach out. 
            We're here to help make your purchase smooth and easy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate("/checkout")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={() => window.open("https://wa.me/27791175714", "_blank")}
            variant="outline"
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
