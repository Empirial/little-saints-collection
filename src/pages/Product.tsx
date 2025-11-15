import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";
import poster7 from "@/assets/poster-7.jpg";
import poster8 from "@/assets/poster-8.jpg";
import poster9 from "@/assets/poster-9.jpg";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Star, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";

const Product = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState("9posters");

  const posters = [
    { id: 1, image: poster1, title: "The Bible Timeline" },
    { id: 2, image: poster2, title: "Books of the Bible" },
    { id: 3, image: poster3, title: "God's Promises" },
    { id: 4, image: poster4, title: "Armour of God" },
    { id: 5, image: poster5, title: "The Beatitudes" },
    { id: 6, image: poster6, title: "Fruits of the Spirit" },
    { id: 7, image: poster7, title: "The 10 Commandments" },
    { id: 8, image: poster8, title: "Lord's Prayer" },
    { id: 9, image: poster9, title: "Seven Days of Creation" },
  ];

  const bundles = [
    { 
      id: "9posters", 
      label: "Complete Set - 9 Posters", 
      price: 270.00, 
      originalPrice: 270.00, 
      shipping: "Free Delivery in SA",
      badge: "Best Value!" 
    },
    { 
      id: "6posters", 
      label: "Starter Set - 6 Posters", 
      price: 195.00, 
      originalPrice: 210.00, 
      shipping: "Free Delivery in SA" 
    },
    { 
      id: "3posters", 
      label: "Mini Set - 3 Posters", 
      price: 120.00, 
      originalPrice: 135.00, 
      shipping: "Free Delivery in SA" 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-muted/30 py-4 px-4 sticky top-0 z-50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="font-inter"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <p className="font-fredoka text-2xl font-bold text-primary">Little Saints</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Product Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Product Images */}
            <div>
              {/* Main Image */}
              <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-background border-2 mb-4">
                <div className="aspect-[3/4] p-8 flex items-center justify-center">
                  <img 
                    src={posters[selectedImage].image} 
                    alt={posters[selectedImage].title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Card>
              
              {/* Thumbnail Grid - Show first 4 posters */}
              <div className="grid grid-cols-4 gap-3">
                {posters.slice(0, 4).map((poster, idx) => (
                  <button
                    key={poster.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={poster.image} 
                      alt={poster.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <p className="font-inter text-sm text-muted-foreground text-center mt-3">
                Click thumbnails to preview • All 9 posters included
              </p>
            </div>

            {/* Right - Product Details */}
            <div>
              {/* Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-inter text-sm text-muted-foreground">
                  (50+ Happy Families)
                </span>
              </div>

              {/* Title */}
              <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Christian Posters for Children
              </h1>

              {/* Scripture Reference */}
              <p className="font-inter text-lg text-primary mb-4 uppercase tracking-wide">
                Deuteronomy 6:6-9
              </p>

              {/* Description */}
              <p className="font-inter text-muted-foreground mb-6 leading-relaxed text-lg">
                <span className="font-semibold text-foreground">Faith-Filled Décor:</span> Transform your child's space with beautiful Biblical teachings through vibrant, educational posters that inspire learning and love for God's word every single day.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8 bg-muted/20 p-6 rounded-lg">
                <li className="flex items-start gap-3 font-inter">
                  <span className="text-primary text-2xl">✓</span>
                  <span>9 beautifully designed A4 Christian posters</span>
                </li>
                <li className="flex items-start gap-3 font-inter">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Premium 350mg quality paper</span>
                </li>
                <li className="flex items-start gap-3 font-inter">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Vibrant, child-friendly colors</span>
                </li>
                <li className="flex items-start gap-3 font-inter">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Perfect for bedrooms & Sunday school</span>
                </li>
              </ul>

              {/* Bundle & Save */}
              <div className="bg-gradient-to-br from-accent/10 to-background border-2 border-accent/20 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="font-fredoka text-2xl font-bold mb-4 text-center">
                  CHOOSE YOUR SET
                </h3>
                
                <RadioGroup value={selectedBundle} onValueChange={setSelectedBundle}>
                  <div className="space-y-3">
                    {bundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        className={`relative flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedBundle === bundle.id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <RadioGroupItem value={bundle.id} id={bundle.id} className="w-5 h-5" />
                          <Label htmlFor={bundle.id} className="flex flex-col cursor-pointer flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-fredoka font-bold text-lg">{bundle.label}</span>
                              {bundle.badge && (
                                <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-inter font-semibold">
                                  {bundle.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-inter text-sm text-muted-foreground">
                              {bundle.shipping}
                            </span>
                          </Label>
                        </div>
                        <div className="text-right">
                          <p className="font-fredoka text-2xl font-bold text-primary">
                            R{bundle.price.toFixed(0)}
                          </p>
                          {bundle.originalPrice > bundle.price && (
                            <p className="font-inter text-sm text-muted-foreground line-through">
                              R{bundle.originalPrice.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Shipping Notice */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-center">
                <p className="font-inter text-sm font-semibold text-foreground">
                  ✓ Free Delivery Across South Africa
                </p>
                <p className="font-inter text-xs text-muted-foreground mt-1">
                  Same week delivery • Secure WhatsApp confirmation
                </p>
              </div>

              {/* Add to Cart Button */}
              <Button 
                onClick={() => navigate("/checkout")}
                className="w-full font-fredoka text-xl py-7 rounded-full shadow-xl hover:shadow-2xl transition-all mb-4"
                size="lg"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                Get Your Collection Now
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-inter text-xs text-muted-foreground font-medium">
                    Quality Guaranteed
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-accent" />
                  </div>
                  <p className="font-inter text-xs text-muted-foreground font-medium">
                    WhatsApp Support
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-secondary/30 flex items-center justify-center">
                    <Star className="w-7 h-7 text-secondary" />
                  </div>
                  <p className="font-inter text-xs text-muted-foreground font-medium">
                    50+ Reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Posters Preview Grid */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
              All 9 Posters Included
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Each poster features vibrant designs and Biblical teachings perfect for inspiring faith in young hearts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <Card 
                key={poster.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-card border-2 border-primary/20"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={poster.image} 
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-gradient-to-b from-background to-primary/5">
                  <p className="font-fredoka text-sm font-semibold text-center">
                    {poster.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-12">
            Why Parents Love Little Saints
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-primary/5 border-2 border-primary/20 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-muted-foreground italic mb-4 leading-relaxed">
                "These posters are perfect! My kids love looking at them every day and asking questions about the Bible stories."
              </p>
              <p className="font-fredoka font-semibold text-sm">- Sarah M.</p>
            </Card>
            
            <Card className="p-8 bg-secondary/20 border-2 border-secondary hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-muted-foreground italic mb-4 leading-relaxed">
                "Beautiful quality and great value for money. They've really brightened up our children's room!"
              </p>
              <p className="font-fredoka font-semibold text-sm">- John K.</p>
            </Card>

            <Card className="p-8 bg-accent/10 border-2 border-accent/30 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-muted-foreground italic mb-4 leading-relaxed">
                "A wonderful teaching tool that makes learning about faith fun and visual for young ones."
              </p>
              <p className="font-fredoka font-semibold text-sm">- Mary T.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Star className="w-10 h-10 text-accent fill-accent" />
            <Star className="w-10 h-10 text-accent fill-accent" />
            <Star className="w-10 h-10 text-accent fill-accent" />
          </div>

          <h2 className="font-fredoka text-5xl md:text-6xl font-bold mb-6">
            Only R270 For All 9 Posters!
          </h2>
          
          <p className="font-inter text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your child's room into a faith-filled space that inspires learning and love for God's word. Premium quality, vibrant designs, delivered to your door.
          </p>
          
          <Button 
            onClick={() => navigate("/checkout")}
            size="lg" 
            className="font-fredoka text-2xl px-16 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingCart className="w-7 h-7 mr-3" />
            Get Your Collection Now
          </Button>
          
          <p className="font-inter text-sm text-muted-foreground mt-6">
            Secure checkout • Fast WhatsApp confirmation • Same week delivery across SA
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6" />
            <p className="font-inter text-lg">
              Questions? WhatsApp us:{" "}
              <a 
                href="https://wa.me/27791175714" 
                className="font-fredoka font-bold hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                +27 79 117 5714
              </a>
            </p>
          </div>
          <p className="font-fredoka text-2xl font-bold mb-2">Little Saints</p>
          <p className="font-inter text-sm opacity-80">
            © 2024 Little Saints. Inspiring faith in young hearts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Product;
