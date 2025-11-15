import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/70 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="font-inter text-sm md:text-base text-foreground/70 mb-4 uppercase tracking-widest">
            Deuteronomy 6:6-9
          </p>
          <h1 className="font-fredoka text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight drop-shadow-lg">
            Get It For Your<br />Child Today
          </h1>
          <div className="inline-block bg-primary text-primary-foreground rounded-full px-10 py-5 mb-8 shadow-2xl">
            <p className="font-fredoka text-4xl md:text-5xl font-bold">R270</p>
            <p className="font-inter text-sm md:text-base opacity-90">9 Great Quality A4 Posters (350gsm Paper)</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              onClick={() => navigate("/product")}
              size="lg" 
              className="font-fredoka text-xl px-12 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              View Collection
            </Button>
            <Button 
              onClick={() => navigate("/checkout")}
              variant="secondary"
              size="lg" 
              className="font-fredoka text-xl px-12 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Buy Now - R270
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-16">
            Perfect For Christian Parents
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="font-fredoka text-2xl font-bold mb-3">Beautiful Design</h3>
              <p className="font-inter text-muted-foreground">
                Colorful, child-friendly illustrations that bring Bible stories to life
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="font-fredoka text-2xl font-bold mb-3">Biblical Stories</h3>
              <p className="font-inter text-muted-foreground">
                9 carefully selected stories to inspire faith and teach God's word
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-fredoka text-2xl font-bold mb-3">Premium Quality</h3>
              <p className="font-inter text-muted-foreground">
                Printed on high-quality 350mg A4 paper for lasting beauty
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-4xl md:text-6xl font-bold mb-6">
            Transform Your Child's Room Today
          </h2>
          <p className="font-inter text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create a space filled with God's love and inspiring Bible stories that will nurture your child's faith
          </p>
          <Button 
            onClick={() => navigate("/product")}
            size="lg" 
            className="font-fredoka text-2xl px-16 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            See The Collection
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6" />
            <p className="font-inter text-lg">
              Contact us on WhatsApp:{" "}
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
          <p className="font-inter text-sm text-muted-foreground">
            © 2024 Little Saints. Inspiring faith in young hearts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
