import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import posterCollection from "@/assets/poster-collection.jpg";

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

interface CartData {
  purchaseOption: "complete" | "individual";
  selectedPosters: number[];
  subtotal: number;
  items: CartItem[];
}

const Checkout = () => {
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState("fastway");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Load cart data from localStorage
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    } else {
      // Default to complete set if no cart data
      setCart({
        purchaseOption: "complete",
        selectedPosters: [],
        subtotal: 270,
        items: [{ name: "Complete Poster Set (9 posters)", quantity: 1, price: 270 }],
      });
    }
  }, []);
  
  const deliveryOptions = {
    pickup: { name: "Pickup", price: 0, days: "Arrange via WhatsApp" },
    fastway: { name: "Fastway Courier", price: 95, days: "5-7 days" },
    paxi: { name: "Paxi", price: 110, days: "7-9 days" }
  };
  
  const subtotal = cart?.subtotal || 270;
  const deliveryCost = deliveryOptions[deliveryMethod as keyof typeof deliveryOptions].price;
  const total = subtotal + deliveryCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isPickup = deliveryMethod === "pickup";
    if (!formData.name || !formData.email || !formData.phone || (!isPickup && !formData.address)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const baseUrl = window.location.origin;
      
      // Call edge function to create Yoco checkout
      const { data, error } = await supabase.functions.invoke('create-yoco-checkout', {
        body: {
          amount: total * 100, // Convert to cents
          currency: 'ZAR',
          successUrl: `${baseUrl}/payment-success`,
          cancelUrl: `${baseUrl}/payment-cancelled`,
          metadata: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            deliveryAddress: formData.address,
            deliveryMethod: deliveryMethod,
            orderNotes: formData.notes,
            subtotal: subtotal,
            deliveryCost: deliveryCost,
            total: total,
          },
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout');
      }

      if (data?.redirectUrl) {
        // Store order details in sessionStorage for success page
        sessionStorage.setItem('orderDetails', JSON.stringify({
          ...formData,
          deliveryMethod,
          subtotal,
          deliveryCost,
          total,
          orderNumber: data.orderNumber,
        }));
        
        // Redirect to Yoco payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      {/* Hidden Netlify Form for order notifications */}
      <form name="order-notification" data-netlify="true" netlify-honeypot="bot-field" hidden>
        <input type="hidden" name="form-name" value="order-notification" />
        <input name="bot-field" />
        <input name="order_id" />
        <input name="customer_name" />
        <input name="customer_email" />
        <input name="customer_phone" />
        <input name="delivery_address" />
        <input name="delivery_method" />
        <input name="order_notes" />
        <input name="total" />
        <input name="paid_at" />
      </form>
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            {/* Paxi Point Locator */}
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b">
                <h3 className="font-fredoka font-semibold">Find your nearest Paxi Point</h3>
                <p className="text-sm font-inter text-muted-foreground">
                  Click on a marker to see the store name and code
                </p>
              </div>
              <iframe 
                width="100%" 
                height="600" 
                src="https://map.paxi.co.za?size=l,m,s&status=1,3,4&maxordervalue=1000&output=nc" 
                frameBorder="0" 
                allow="geolocation"
                className="w-full"
                title="Paxi Point Locator"
              />
            </Card>

            {/* Order Details */}
            <Card className="p-6">
              <h2 className="font-fredoka text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart?.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-fredoka font-bold text-lg mb-1">{item.name}</h3>
                      {cart.purchaseOption === "complete" && (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">9 Christian-themed A4 posters</p>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>✓ Premium 350mg paper quality</p>
                            <p>✓ Vibrant, child-friendly colors</p>
                            <p>✓ Reliable courier delivery</p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="font-fredoka text-xl font-bold text-primary">R{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-inter text-muted-foreground">Subtotal</span>
                  <span className="font-inter">R{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-inter text-muted-foreground">Delivery</span>
                  <span className="font-inter">R{deliveryCost}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
                  <span className="font-fredoka">Total</span>
                  <span className="font-fredoka text-primary">R{total}</span>
                </div>
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
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isProcessing}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isProcessing}
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label className="font-inter font-semibold">Delivery Method *</Label>
                <RadioGroup 
                  value={deliveryMethod} 
                  onValueChange={setDeliveryMethod}
                  className="mt-3 space-y-3"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Pickup</p>
                          <p className="text-sm text-muted-foreground">Arrange via WhatsApp</p>
                        </div>
                        <span className="font-bold text-primary">R0</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="fastway" id="fastway" />
                    <Label htmlFor="fastway" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Fastway Courier</p>
                          <p className="text-sm text-muted-foreground">5-7 days delivery</p>
                        </div>
                        <span className="font-bold text-primary">R95</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="paxi" id="paxi" />
                    <Label htmlFor="paxi" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Paxi</p>
                          <p className="text-sm text-muted-foreground">7-9 days delivery</p>
                        </div>
                        <span className="font-bold text-primary">R110</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>


              <div>
                <Label htmlFor="address" className="font-inter font-semibold">
                  {deliveryMethod === "pickup" ? "Pickup Notes (Optional)" : deliveryMethod === "paxi" ? "Paxi Point Details *" : "Delivery Address *"}
                </Label>
                <Textarea 
                  id="address" 
                  required={deliveryMethod !== "pickup"}
                  placeholder={
                    deliveryMethod === "pickup" 
                      ? "Any notes for pickup arrangement" 
                      : deliveryMethod === "paxi"
                        ? "Paxi Point name (e.g., PEP Store Sandton), your full name & phone number"
                        : "Street address, City, Province, Postal Code"
                  }
                  className="mt-1.5 min-h-[100px]"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="font-inter font-semibold">Order Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any special instructions or requests"
                  className="mt-1.5"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full font-fredoka text-lg py-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay Now - R{total}</>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Secure payment powered by Yoco
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
