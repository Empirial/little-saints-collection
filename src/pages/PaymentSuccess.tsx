import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryCost: number;
  total: number;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('orderDetails');
    if (stored) {
      setOrderDetails(JSON.parse(stored));
      // Clear after reading
      sessionStorage.removeItem('orderDetails');
    }
  }, []);

  const deliveryMethodNames: Record<string, string> = {
    fastway: "Fastway Courier (5-7 days)",
    paxi: "Paxi (7-9 days)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-fredoka text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. Your Little Saints posters are on their way!
          </p>
        </div>

        {orderDetails && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-fredoka font-bold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{orderDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{orderDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="font-medium">
                  {deliveryMethodNames[orderDetails.deliveryMethod] || orderDetails.deliveryMethod}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Paid:</span>
                <span className="text-primary">R{orderDetails.total}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="font-fredoka font-bold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>✓ You'll receive a confirmation email shortly</li>
              <li>✓ We'll send tracking details via WhatsApp</li>
              <li>✓ Your posters will arrive within 5-9 business days</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => window.open("https://wa.me/27791175714", "_blank")}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
