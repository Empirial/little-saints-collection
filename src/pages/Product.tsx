import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, MessageCircle, Star } from "lucide-react";

const Product = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-muted/30 py-6 px-4 sticky top-0 z-50 backdrop-blur-sm border-b border-border">
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
          <Button 
            onClick={() => navigate("/checkout")}
            className="font-fredoka"
          >
            Buy Now - R270
          </Button>
        </div>
      </header>

      {/* Hero Product Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Star className="w-8 h-8 text-accent fill-accent" />
            <Star className="w-8 h-8 text-accent fill-accent" />
            <Star className="w-8 h-8 text-accent fill-accent" />
          </div>
          
          <p className="font-inter text-lg text-muted-foreground mb-4 uppercase tracking-widest">
            Deuteronomy 6:6-9
          </p>
          
          <h1 className="font-fredoka text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Get It For Your<br />Child Today
          </h1>
          
          <div className="inline-block bg-accent text-accent-foreground rounded-full px-10 py-6 mb-8 shadow-2xl">
            <p className="font-fredoka text-4xl md:text-5xl font-bold mb-1">R270</p>
            <p className="font-inter text-base md:text-lg font-medium">9 Great Quality A4 Poster</p>
            <p className="font-inter text-sm">(350mg Paper)</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Star className="w-8 h-8 text-accent fill-accent" />
            <Star className="w-8 h-8 text-accent fill-accent" />
            <Star className="w-8 h-8 text-accent fill-accent" />
          </div>
        </div>
      </section>

      {/* Poster Grid - Styled like the image */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <Card 
                key={poster.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-card border-2"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={poster.image} 
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-fredoka text-4xl font-bold mb-6">
                What's Included
              </h2>
              <ul className="space-y-4 font-inter text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>9 beautifully designed A4 Christian posters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Premium 350mg paper quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Vibrant, child-friendly colors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Educational Biblical content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Perfect for bedrooms, playrooms & Sunday school</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-2xl">✓</span>
                  <span>Easy to frame or display</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-fredoka text-4xl font-bold mb-6">
                Why Parents Love This
              </h2>
              <div className="space-y-6">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="font-inter text-muted-foreground italic mb-2">
                    "These posters are perfect! My kids love looking at them every day and asking questions about the Bible stories."
                  </p>
                  <p className="font-fredoka font-semibold text-sm">- Sarah M.</p>
                </Card>
                
                <Card className="p-6 bg-secondary/30 border-secondary">
                  <p className="font-inter text-muted-foreground italic mb-2">
                    "Beautiful quality and great value for money. They've really brightened up our children's room!"
                  </p>
                  <p className="font-fredoka font-semibold text-sm">- John K.</p>
                </Card>

                <Card className="p-6 bg-accent/20 border-accent/40">
                  <p className="font-inter text-muted-foreground italic mb-2">
                    "A wonderful teaching tool that makes learning about faith fun and visual for young ones."
                  </p>
                  <p className="font-fredoka font-semibold text-sm">- Mary T.</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-5xl md:text-6xl font-bold mb-6">
            Only R270 For All 9 Posters!
          </h2>
          <p className="font-inter text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Transform your child's room into a faith-filled space that inspires learning and love for God's word
          </p>
          <Button 
            onClick={() => navigate("/checkout")}
            size="lg" 
            className="font-fredoka text-2xl px-16 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            Get Your Collection Now
          </Button>
          <p className="font-inter text-sm text-muted-foreground mt-6">
            Secure checkout • Fast WhatsApp confirmation • Same week delivery
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
