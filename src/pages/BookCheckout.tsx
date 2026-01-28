import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Book, Truck, MapPin, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface Personalization {
  childName: string;
  gender: string;
  skinTone: string;
}

interface Customization {
  fromField: string;
  personalMessage: string;
  dedicationMessage: string;
}

const BOOK_PRICE = 35000; // R350 in cents

const BookCheckout = () => {
  const navigate = useNavigate();
  const [personalization, setPersonalization] = useState<Personalization | null>(null);
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [deliveryMethod, setDeliveryMethod] = useState("pickup");

  const deliveryOptions = [
    { id: "pickup", label: "Pickup (Free)", price: 0, description: "Arrange via WhatsApp" },
    { id: "fastway", label: "Fastway Courier", price: 9500, description: "5-7 business days" },
    { id: "paxi", label: "Paxi", price: 11000, description: "7-9 business days" }
  ];

  const getDeliveryCost = () => {
    const option = deliveryOptions.find(o => o.id === deliveryMethod);
    return option?.price || 0;
  };

  const total = BOOK_PRICE + getDeliveryCost();

  useEffect(() => {
    const savedPersonalization = localStorage.getItem("personalization");
    const savedCustomization = localStorage.getItem("customization");

    if (savedPersonalization) {
      setPersonalization(JSON.parse(savedPersonalization));
    } else {
      navigate("/personalize-book");
      return;
    }

    if (savedCustomization) {
      setCustomization(JSON.parse(savedCustomization));
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (deliveryMethod !== "pickup" && !formData.address) {
      toast.error("Please provide a delivery address");
      return;
    }

    setIsLoading(true);

    try {
      const bookData = {
        childName: personalization?.childName,
        gender: personalization?.gender,
        skinTone: personalization?.skinTone,
        fromField: customization?.fromField || "",
        personalMessage: customization?.personalMessage || "",
        dedicationMessage: customization?.dedicationMessage || "",
        pageCount: personalization?.childName ? (personalization.childName.replace(/[^a-zA-Z]/g, '').length + 6) * 2 : 0
      };

      const { data, error } = await supabase.functions.invoke('submit-book-order', {
        body: {
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          deliveryAddress: deliveryMethod === "pickup" ? "Pickup" : formData.address,
          deliveryMethod: deliveryMethod,
          deliveryCost: getDeliveryCost(),
          subtotal: BOOK_PRICE,
          orderNotes: formData.notes,
          bookData: bookData
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Store order details for success page
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          total: total,
          bookData: bookData
        }));

        navigate('/book-success');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!personalization) {
    return null;
  }

  const letterCount = personalization.childName.replace(/[^a-zA-Z]/g, '').length;
  // Breakdown: Cover(1 spread) + Intro(2 spreads) + Letters(L spreads) + Ending(2 spreads) + Dedication(1 spread)
  // Total Spreads = L + 6
  // Physical Pages = (L + 6) * 2
  const totalPages = (letterCount + 6) * 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-8 md:pt-24 md:pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/personalize-preview")}
          className="mb-4 font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Preview
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-border shadow-lg h-fit">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl text-primary flex items-center gap-2">
                <Book className="w-6 h-6" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-fredoka text-lg text-foreground">
                  {personalization.childName}'s Great Name Chase
                </h3>
                <p className="text-sm text-muted-foreground font-inter">
                  Personalized Book • {totalPages} pages
                </p>
                <p className="text-sm text-muted-foreground font-inter">
                  Character: {personalization.gender === "boy" ? "Boy" : "Girl"} ({personalization.skinTone} skin tone)
                </p>
                {customization?.fromField && (
                  <p className="text-sm text-muted-foreground font-inter">
                    From: {customization.fromField}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm font-inter">
                  <span>Book Price</span>
                  <span>R{(BOOK_PRICE / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-inter">
                  <span>Delivery</span>
                  <span>R{(getDeliveryCost() / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-fredoka border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">R{(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="font-fredoka text-2xl text-primary">
                Checkout
              </CardTitle>
              <CardDescription className="font-inter">
                Enter your details to complete your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-fredoka text-lg text-foreground">Contact Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-inter">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="font-inter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-inter">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="font-inter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-inter">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="font-inter"
                    />
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="space-y-4">
                  <h3 className="font-fredoka text-lg text-foreground">Delivery Method</h3>

                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    {deliveryOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${deliveryMethod === option.id ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        onClick={() => setDeliveryMethod(option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="font-inter font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground font-inter">{option.description}</p>
                        </div>
                        <span className="font-inter text-sm">
                          {option.price === 0 ? "Free" : `R${(option.price / 100).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Delivery Address */}
                {deliveryMethod !== "pickup" && (
                  <div className="space-y-4">
                    <h3 className="font-fredoka text-lg text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-inter">Full Address *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address, suburb, city, postal code"
                        required={deliveryMethod !== "pickup"}
                        className="font-inter"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-inter">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions..."
                    className="font-inter"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-inter text-base py-6"
                  size="lg"
                >
                  {isLoading ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookCheckout;
