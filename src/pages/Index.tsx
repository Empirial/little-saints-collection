import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/poster/hero-image.webp";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16 bg-primary/20">
        <img 
          src={heroImage}
          alt="Christian Bible posters for children"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/70 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="font-fredoka text-2xl md:text-3xl text-foreground mb-2">
            Little Saint Art Creations
          </p>
          <p className="font-inter text-sm md:text-base text-foreground/70 mb-2 uppercase tracking-widest">
            Proverbs 22:6
          </p>
          <p className="font-inter text-base md:text-lg text-foreground/80 mb-6 italic max-w-3xl mx-auto">
            "Train up a child in the way he should go: and when he is old, he will not depart from it."
          </p>
          <h1 className="font-fredoka text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 leading-tight drop-shadow-lg">
            Inspire Faith in Every<br />Child's Room
          </h1>
          <p className="font-inter text-base sm:text-xl md:text-2xl text-foreground/80 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Beautiful Christian posters and personalized books that teach values, joy and God's love
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <Button 
              onClick={() => navigate("/product")}
              size="lg" 
              className="font-fredoka text-base sm:text-xl px-6 sm:px-12 py-5 sm:py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Get Christian Posters
            </Button>
            <Button 
              onClick={() => navigate("/personalize-book")}
              size="lg" 
              className="font-fredoka text-base sm:text-xl px-6 sm:px-12 py-5 sm:py-7 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Get Personalized Book
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold mb-6">
            About Us
          </h2>
          <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            At Little Saint Art Creations, we believe that faith should be woven into every aspect of a child's life. 
            Our mission is to create beautiful, inspiring Christian art and personalized books that help parents nurture 
            their children's spiritual growth. Each piece is thoughtfully designed to bring God's word and love into your 
            child's daily environment, making faith a natural part of their journey.
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-4">
            What We Offer
          </h2>
          <p className="font-inter text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Transform your child's space with beautiful, faith-filled artwork and personalized stories
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="group relative p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🎨</div>
                <h3 className="font-fredoka text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  Christian Posters
                </h3>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-4">
                  Beautiful A4 posters featuring 9 inspiring Bible stories, printed on premium 350gsm paper. 
                  Perfect for decorating your child's room with colorful, faith-filled artwork.
                </p>
                <ul className="font-inter text-muted-foreground space-y-2">
                  <li>✓ 9 Biblical stories beautifully illustrated</li>
                  <li>✓ High-quality 350gsm A4 paper</li>
                  <li>✓ Child-friendly, engaging designs</li>
                  <li>✓ Perfect for bedroom walls</li>
                </ul>
              </div>
            </Card>
            
            <Card className="group relative p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📖</div>
                <h3 className="font-fredoka text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  Personalized Books
                </h3>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-4">
                  Custom-made storybooks where your child becomes the hero of their own faith journey. 
                  Choose their character and watch them come alive in inspiring Biblical adventures.
                </p>
                <ul className="font-inter text-muted-foreground space-y-2">
                  <li>✓ Your child as the main character</li>
                  <li>✓ Choose gender and appearance</li>
                  <li>✓ Engaging Biblical stories</li>
                  <li>✓ Unique keepsake for years to come</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
            Start Your Child's Faith Journey Today
          </h2>
          <p className="font-inter text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            Create a space filled with God's love and inspiring Bible stories that will nurture your child's faith
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={() => navigate("/product")}
              size="lg" 
              className="font-fredoka text-lg sm:text-2xl px-8 sm:px-16 py-6 sm:py-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Get Christian Posters
            </Button>
            <Button 
              onClick={() => navigate("/personalize-book")}
              size="lg" 
              className="font-fredoka text-lg sm:text-2xl px-8 sm:px-16 py-6 sm:py-8 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Get Personalized Book
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <p className="font-inter text-sm sm:text-lg">
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
          <p className="font-fredoka text-xl sm:text-2xl font-bold mb-2">Little Saints</p>
          <p className="font-inter text-xs sm:text-sm text-muted-foreground">
            © 2025 Little Saints. Inspiring faith in young hearts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
