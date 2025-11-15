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
      <section className="py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-4">
            Perfect For Christian Parents
          </h2>
          <p className="font-inter text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Transform your child's space with beautiful, faith-filled artwork
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group relative p-8 text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform duration-300">🎨</div>
                <h3 className="font-fredoka text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  Beautiful Design
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  Colorful, child-friendly illustrations that bring Bible stories to life
                </p>
              </div>
            </Card>
            
            <Card className="group relative p-8 text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform duration-300">📖</div>
                <h3 className="font-fredoka text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  Biblical Stories
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  9 carefully selected stories to inspire faith and teach God's word
                </p>
              </div>
            </Card>
            
            <Card className="group relative p-8 text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform duration-300">⭐</div>
                <h3 className="font-fredoka text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  Premium Quality
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  Printed on high-quality 350gsm A4 paper for lasting beauty
                </p>
              </div>
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
