
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, MessageCircle, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderDetails {
    customerName: string;
    customerEmail: string;
    total: number;
    orderNumber?: string;
}

const BookSuccess = () => {
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('lastOrder');
        if (stored) {
            setOrderDetails(JSON.parse(stored));
            // Clear after reading
            sessionStorage.removeItem('lastOrder');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="font-fredoka text-3xl font-bold text-foreground mb-2">
                        Order Successful!
                    </h1>
                    <p className="text-muted-foreground">
                        Thank you for creating a magical journey! Your personalized book is being crafted with love.
                    </p>
                </div>

                {orderDetails && (
                    <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-fredoka font-bold mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Order Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            {orderDetails.orderNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Number:</span>
                                    <span className="font-bold text-primary">{orderDetails.orderNumber}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{orderDetails.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{orderDetails.customerEmail}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total Paid:</span>
                                <span className="text-primary">R{(orderDetails.total / 100).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div className="bg-primary/5 rounded-lg p-4">
                        <h3 className="font-fredoka font-bold mb-2">Delivery Information</h3>
                        <div className="text-sm text-center">
                            <p className="font-bold text-lg text-primary mb-1">15-20 Business Days</p>
                            <p className="text-muted-foreground">
                                Your unique book takes time to print and bind perfectly. We appreciate your patience!
                            </p>
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 text-left">
                        <h3 className="font-fredoka font-bold mb-2 text-sm">What happens next?</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>✓ You'll receive a confirmation email shortly</li>
                            <li>✓ We'll update you when printing begins</li>
                            <li>✓ Tracking details will be sent via WhatsApp</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => navigate("/")}
                        variant="outline"
                        className="flex-1 font-inter"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                    <Button
                        onClick={() => window.open("https://wa.me/27791175714", "_blank")}
                        className="flex-1 font-inter"
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Us
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default BookSuccess;
