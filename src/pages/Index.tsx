import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import HeroCarousel from "@/components/HeroCarousel";

const Index = () => {
  const navigate = useNavigate();

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Little Saint Art Creations",
    "image": "https://littlesaintart.co.za/og-image.png",
    "description": "Beautiful Christian posters and personalized Bible storybooks for children",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA"
    },
    "priceRange": "R40-R270",
    "telephone": "+27791175714",
    "url": "https://littlesaintart.co.za"
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Little Saints - Christian Posters & Personalized Books for Children | South Africa"
        description="Shop beautiful Christian posters and personalized Bible storybooks for children. 9 faith-filled A3 posters featuring Bible stories, perfect for kids' rooms."
        canonicalUrl="https://littlesaintart.co.za/"
        keywords="Christian posters for kids, Bible posters for children, personalized Christian books, religious wall art, South Africa"
        structuredData={homeStructuredData}
      />
      <Navbar />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* About Us Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20" aria-labelledby="about-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="about-heading" className="font-fredoka text-4xl md:text-5xl font-bold mb-6">
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
      <section className="py-24 px-4 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative overflow-hidden" aria-labelledby="products-heading">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 id="products-heading" className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-4">
            What We Offer
          </h2>
          <p className="font-inter text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Transform your child's space with beautiful, faith-filled artwork and personalized stories
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <article>
              <Card className="group relative p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">🎨</div>
                  <h3 className="font-fredoka text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                    Christian Posters
                  </h3>
                  <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-4">
                    Beautiful A3 posters featuring 9 inspiring Bible stories, printed on premium 350gsm paper. 
                    Perfect for decorating your child's room with colorful, faith-filled artwork.
                  </p>
                  <ul className="font-inter text-muted-foreground space-y-2">
                    <li>✓ 9 Biblical stories beautifully illustrated</li>
                    <li>✓ High-quality 350gsm A3 paper</li>
                    <li>✓ Child-friendly, engaging designs</li>
                    <li>✓ Perfect for bedroom walls</li>
                  </ul>
                </div>
              </Card>
            </article>
            
            <article>
              <Card className="group relative p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">📖</div>
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
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/10" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="cta-heading" className="font-fredoka text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
            Start Your Child's Faith Journey Today
          </h2>
          <p className="font-inter text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            Create a space filled with God's love and inspiring Bible stories that will nurture your child's faith
          </p>
          <nav className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center" aria-label="Product navigation">
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
          </nav>
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
    </main>
  );
};

export default Index;
