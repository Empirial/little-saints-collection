import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";
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
import { MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const posters = [
    { id: 1, image: poster1, title: "Noah's Ark" },
    { id: 2, image: poster2, title: "David & Goliath" },
    { id: 3, image: poster3, title: "Nativity Scene" },
    { id: 4, image: poster4, title: "Jesus & Children" },
    { id: 5, image: poster5, title: "Daniel & Lions" },
    { id: 6, image: poster6, title: "Good Shepherd" },
    { id: 7, image: poster7, title: "Moses & Red Sea" },
    { id: 8, image: poster8, title: "Jonah & Whale" },
    { id: 9, image: poster9, title: "Creation Story" },
  ];

  const handleBuyNow = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-fredoka text-5xl md:text-7xl font-bold text-foreground mb-6">
            Inspire Faith & Joy in Your Little Saints
          </h1>
          <p className="font-inter text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A beautiful collection of 9 Christian-themed posters designed to bring God's love into your child's room
          </p>
          <Button 
            onClick={handleBuyNow}
            size="lg" 
            className="font-fredoka text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Buy Now - R270
          </Button>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-center mb-4">
            9 Beautiful Bible Stories
          </h2>
          <p className="font-inter text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Each poster brings a beloved Bible story to life with gentle colors and child-friendly illustrations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <Card 
                key={poster.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-card"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={poster.image} 
                    alt={poster.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-fredoka text-xl font-semibold">{poster.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-fredoka text-4xl font-bold mb-6">
                Perfect for Your Child's Room
              </h2>
              <ul className="font-inter space-y-4 text-lg">
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>High Quality Prints:</strong> Beautiful, vibrant colors that last</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>9 Complete Set:</strong> All major Bible stories in one collection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>Child-Friendly Design:</strong> Gentle, non-scary illustrations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>Educational & Faith-Building:</strong> Teach God's word through art</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>Perfect Size:</strong> Ideal for nurseries and children's rooms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-2xl">✓</span>
                  <span><strong>Made with Love:</strong> Created by Christian parents for Christian families</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={poster4} 
                alt="Jesus with Children"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold mb-6">
            Complete Collection - Only R270
          </h2>
          <p className="font-inter text-xl text-muted-foreground mb-8">
            All 9 posters delivered to your door. Transform your child's room into a place of faith and inspiration.
          </p>
          <Button 
            onClick={handleBuyNow}
            size="lg"
            className="font-fredoka text-xl px-12 py-7 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Buy Now - R270
          </Button>
          <p className="font-inter text-sm text-muted-foreground mt-6">
            Secure checkout • Fast delivery across South Africa
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="font-fredoka text-2xl font-bold mb-4">Little Saints</h3>
          <p className="font-inter text-muted-foreground mb-4">
            Bringing faith and joy to children's lives through beautiful Christian art
          </p>
          <a 
            href="https://wa.me/27791175714"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-inter"
          >
            <MessageCircle className="w-5 h-5" />
            Contact us on WhatsApp
          </a>
          <p className="font-inter text-sm text-muted-foreground mt-6">
            © 2024 Little Saints. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
