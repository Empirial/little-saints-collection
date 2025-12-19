import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import poster1 from "@/assets/poster/poster-1.webp";
import poster2 from "@/assets/poster/poster-2.webp";
import poster3 from "@/assets/poster/poster-3.webp";
import poster4 from "@/assets/poster/poster-4.webp";
import poster5 from "@/assets/poster/poster-5.webp";
import poster6 from "@/assets/poster/poster-6.webp";
import poster7 from "@/assets/poster/poster-7.webp";
import poster8 from "@/assets/poster/poster-8.webp";
import poster9 from "@/assets/poster/poster-9.webp";
import bedroomImage from "@/assets/poster/BEDROOM (2).webp";
import classroomImage from "@/assets/poster/CLassroom.webp";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Star, Package, ShoppingCart, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const Product = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [purchaseOption, setPurchaseOption] = useState<"complete" | "individual">("complete");
  const [selectedPosters, setSelectedPosters] = useState<number[]>([]);
  const [showPosterSelector, setShowPosterSelector] = useState(false);

  const carouselImages = [
    { image: bedroomImage, title: "Bedroom Display" },
    { image: classroomImage, title: "Classroom Display" },
  ];

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

  const POSTER_PRICE = 10;
  const COMPLETE_SET_PRICE = 270;

  // Calculate individual poster total
  const individualTotal = selectedPosters.length * POSTER_PRICE;

  // Auto-slide effect for main image
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Navigate main carousel
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Navigate thumbnail carousel
  const nextThumbnails = () => {
    if (thumbnailStartIndex + 4 < posters.length) {
      setThumbnailStartIndex(thumbnailStartIndex + 1);
    }
  };

  const prevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex(thumbnailStartIndex - 1);
    }
  };

  // Get visible thumbnails
  const visibleThumbnails = posters.slice(thumbnailStartIndex, thumbnailStartIndex + 4);

  // Handle poster selection
  const togglePosterSelection = (posterId: number) => {
    setSelectedPosters((prev) =>
      prev.includes(posterId)
        ? prev.filter((id) => id !== posterId)
        : [...prev, posterId]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (purchaseOption === "individual" && selectedPosters.length === 0) {
      alert("Please select at least one poster");
      return;
    }
    
    // Store cart data for checkout
    const cartData = {
      purchaseOption,
      selectedPosters: purchaseOption === "individual" ? selectedPosters : [],
      subtotal: purchaseOption === "complete" ? COMPLETE_SET_PRICE : individualTotal,
      items: purchaseOption === "complete" 
        ? [{ name: "Complete Poster Set (9 posters)", quantity: 1, price: COMPLETE_SET_PRICE }]
        : selectedPosters.map(id => {
            const poster = posters.find(p => p.id === id);
            return { name: poster?.title || `Poster ${id}`, quantity: 1, price: POSTER_PRICE };
          }),
    };
    localStorage.setItem("cart", JSON.stringify(cartData));
    
    navigate("/checkout");
  };

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Christian Posters for Children - Complete Set of 9",
    "image": "https://littlesaintart.co.za/og-image.png",
    "description": "Beautiful set of 9 A4 Christian posters for children featuring Bible stories including The Bible Timeline, Books of the Bible, God's Promises, Armour of God, The Beatitudes, Fruits of the Spirit, The 10 Commandments, Lord's Prayer, and Seven Days of Creation.",
    "brand": {
      "@type": "Brand",
      "name": "Little Saint Art Creations"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://littlesaintart.co.za/product",
      "priceCurrency": "ZAR",
      "price": "270",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Little Saint Art Creations"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "50"
    }
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title="Christian Posters for Children - 9 Bible Story Posters | Little Saints"
        description="Buy beautiful Christian posters for kids. Set of 9 A4 Bible story posters including The 10 Commandments, Lord's Prayer, Fruits of the Spirit. Premium 350gsm paper. R270 for complete set."
        canonicalUrl="https://littlesaintart.co.za/product"
        keywords="Christian posters, Bible posters for kids, religious wall art, Sunday school posters, 10 commandments poster, Lord's prayer poster, fruits of the spirit"
        structuredData={productStructuredData}
      />
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Product Section */}
      <section className="py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Left - Product Images with Carousel */}
            <div>
              {/* Main Image Carousel */}
              <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-background border-2 mb-3 sm:mb-4 relative group">
                <div className="aspect-[3/4] p-4 sm:p-6 md:p-8 flex items-center justify-center">
                  <img 
                    src={carouselImages[selectedImage].image} 
                    alt={carouselImages[selectedImage].title}
                    className="w-full h-full object-contain transition-all duration-500"
                    loading="eager"
                    width="1200"
                    height="1600"
                  />
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 sm:p-2 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 sm:p-2 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-2 rounded-full transition-all ${
                        selectedImage === idx 
                          ? 'w-8 bg-primary' 
                          : 'w-2 bg-primary/30 hover:bg-primary/50'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-background/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <p className="font-inter text-xs sm:text-sm font-semibold">
                    {selectedImage + 1} / {carouselImages.length}
                  </p>
                </div>
              </Card>
              
              {/* Thumbnail Carousel */}
              <div className="relative px-8 sm:px-0">
                {/* Left Arrow */}
                <button
                  onClick={prevThumbnails}
                  disabled={thumbnailStartIndex === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border-2 border-border p-1 sm:p-2 rounded-full shadow-lg transition-all ${
                    thumbnailStartIndex === 0 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                  aria-label="Previous thumbnails"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </button>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
                  {visibleThumbnails.map((poster, idx) => {
                    const actualIndex = thumbnailStartIndex + idx;
                    return (
                      <button
                        key={poster.id}
                        onClick={() => setSelectedImage(actualIndex)}
                        className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === actualIndex
                            ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img 
                          src={poster.image} 
                          alt={poster.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width="200"
                          height="267"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={nextThumbnails}
                  disabled={thumbnailStartIndex + 4 >= posters.length}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border-2 border-border p-1 sm:p-2 rounded-full shadow-lg transition-all ${
                    thumbnailStartIndex + 4 >= posters.length 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                  aria-label="Next thumbnails"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </button>
              </div>

              <p className="font-inter text-sm text-muted-foreground text-center mt-3">
                {posters[selectedImage].title} • {thumbnailStartIndex + 1}-{Math.min(thumbnailStartIndex + 4, posters.length)} of {posters.length} posters
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

              {/* Purchase Options */}
              <div className="bg-gradient-to-br from-accent/10 to-background border-2 border-accent/20 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="font-fredoka text-2xl font-bold mb-4 text-center">
                  CHOOSE YOUR OPTION
                </h3>
                
                <RadioGroup value={purchaseOption} onValueChange={(value) => {
                  setPurchaseOption(value as "complete" | "individual");
                  if (value === "complete") {
                    setSelectedPosters([]);
                  }
                }}>
                  <div className="space-y-3">
                    {/* Complete Set Option */}
                    <div
                      className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                        purchaseOption === "complete"
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 mb-3 sm:mb-0">
                        <RadioGroupItem value="complete" id="complete" className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-0" />
                        <Label htmlFor="complete" className="flex flex-col cursor-pointer flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <span className="font-fredoka font-bold text-base sm:text-lg">Complete Set - All 9 Posters</span>
                            <span className="bg-accent text-accent-foreground text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-inter font-semibold w-fit">
                              Best Value!
                            </span>
                          </div>
                          <span className="font-inter text-xs sm:text-sm text-muted-foreground">
                            Save R90 • Best Value
                          </span>
                        </Label>
                      </div>
                      <div className="text-left sm:text-right ml-7 sm:ml-0">
                        <p className="font-fredoka text-xl sm:text-2xl font-bold text-primary">
                          R270
                        </p>
                        <p className="font-inter text-xs sm:text-sm text-muted-foreground line-through">
                          R360
                        </p>
                      </div>
                    </div>

                    {/* Individual Posters Option */}
                    <div
                      className={`relative flex flex-col p-3 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                        purchaseOption === "individual"
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 mb-3 sm:mb-0">
                          <RadioGroupItem value="individual" id="individual" className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-0" />
                          <Label htmlFor="individual" className="flex flex-col cursor-pointer flex-1">
                            <span className="font-fredoka font-bold text-base sm:text-lg">Individual Posters</span>
                            <span className="font-inter text-xs sm:text-sm text-muted-foreground">
                              R40 per poster
                            </span>
                          </Label>
                        </div>
                        <div className="text-left sm:text-right ml-7 sm:ml-0">
                          <p className="font-fredoka text-xl sm:text-2xl font-bold text-primary">
                            R40
                          </p>
                          <p className="font-inter text-xs text-muted-foreground">
                            each
                          </p>
                        </div>
                      </div>

                      {/* Poster Selection Dropdown */}
                      {purchaseOption === "individual" && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <button
                            type="button"
                            onClick={() => setShowPosterSelector(!showPosterSelector)}
                            className="w-full flex items-center justify-between p-3 bg-background rounded-lg border-2 border-primary/30 hover:border-primary transition-all"
                          >
                            <span className="font-inter font-semibold">
                              {selectedPosters.length === 0 
                                ? "Select Posters" 
                                : `${selectedPosters.length} Poster${selectedPosters.length > 1 ? 's' : ''} Selected`}
                            </span>
                            {showPosterSelector ? (
                              <ChevronUp className="w-5 h-5 text-primary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-primary" />
                            )}
                          </button>

                          {/* Poster Checkboxes */}
                          {showPosterSelector && (
                            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto bg-background rounded-lg border border-border p-3">
                              {posters.map((poster) => (
                                <div
                                  key={poster.id}
                                  className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-all"
                                >
                                  <Checkbox
                                    id={`poster-${poster.id}`}
                                    checked={selectedPosters.includes(poster.id)}
                                    onCheckedChange={() => togglePosterSelection(poster.id)}
                                  />
                                  <Label
                                    htmlFor={`poster-${poster.id}`}
                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                  >
                                    <div className="w-12 h-16 rounded border overflow-hidden">
                                      <img
                                        src={poster.image}
                                        alt={poster.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        width="48"
                                        height="64"
                                      />
                                    </div>
                                    <span className="font-inter text-sm">{poster.title}</span>
                                  </Label>
                                  <span className="font-inter text-sm text-muted-foreground">
                                    R40
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Individual Total */}
                          {selectedPosters.length > 0 && (
                            <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/30">
                              <div className="flex justify-between items-center">
                                <span className="font-inter font-semibold">Total:</span>
                                <span className="font-fredoka text-xl font-bold text-primary">
                                  R{individualTotal}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Shipping Notice */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-center">
                <p className="font-inter text-sm font-semibold text-foreground">
                  ✓ Fast Delivery Across South Africa
                </p>
                <p className="font-inter text-xs text-muted-foreground mt-1">
                  Same week delivery • Secure WhatsApp confirmation
                </p>
              </div>

              {/* Add to Cart Button */}
              <Button 
                onClick={handleCheckout}
                className="w-full font-fredoka text-xl py-7 rounded-full shadow-xl hover:shadow-2xl transition-all mb-4"
                size="lg"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                {purchaseOption === "complete" 
                  ? "Get Your Collection Now - R270" 
                  : selectedPosters.length > 0 
                    ? `Add to Cart - R${individualTotal}`
                    : "Select Posters to Continue"}
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-16">
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
                    loading="lazy"
                    width="400"
                    height="533"
                  />
                </div>
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-b from-background to-primary/5">
                  <p className="font-fredoka text-xs sm:text-sm font-semibold text-center">
                    {poster.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Real-Life Preview Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">
                See How They Look In Real Spaces
              </h3>
              <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform bedrooms and classrooms into inspiring faith-filled environments
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="overflow-hidden border-2 border-primary/20 hover:shadow-2xl transition-all">
                <img 
                  src={bedroomImage} 
                  alt="Christian posters displayed in a child's bedroom"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-6 bg-gradient-to-b from-background to-primary/5">
                  <p className="font-fredoka text-xl font-semibold text-center">
                    Perfect for Bedrooms
                  </p>
                  <p className="font-inter text-sm text-muted-foreground text-center mt-2">
                    Create an inspiring space for daily learning and prayer
                  </p>
                </div>
              </Card>

              <Card className="overflow-hidden border-2 border-primary/20 hover:shadow-2xl transition-all">
                <img 
                  src={classroomImage} 
                  alt="Christian posters displayed in a classroom setting"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-6 bg-gradient-to-b from-background to-primary/5">
                  <p className="font-fredoka text-xl font-semibold text-center">
                    Ideal for Sunday School
                  </p>
                  <p className="font-inter text-sm text-muted-foreground text-center mt-2">
                    Enhance your teaching with vibrant visual aids
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fredoka text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12">
            Why Parents Love Little Saints
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="p-4 sm:p-6 md:p-8 bg-primary/5 border-2 border-primary/20 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-sm sm:text-base text-muted-foreground italic mb-3 sm:mb-4 leading-relaxed">
                "These posters are perfect! My kids love looking at them every day and asking questions about the Bible stories."
              </p>
              <p className="font-fredoka font-semibold text-xs sm:text-sm">- Sarah M.</p>
            </Card>
            
            <Card className="p-4 sm:p-6 md:p-8 bg-secondary/20 border-2 border-secondary hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-sm sm:text-base text-muted-foreground italic mb-3 sm:mb-4 leading-relaxed">
                "Beautiful quality and great value for money. They've really brightened up our children's room!"
              </p>
              <p className="font-fredoka font-semibold text-xs sm:text-sm">- John K.</p>
            </Card>

            <Card className="p-4 sm:p-6 md:p-8 bg-accent/10 border-2 border-accent/30 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-inter text-sm sm:text-base text-muted-foreground italic mb-3 sm:mb-4 leading-relaxed">
                "A wonderful teaching tool that makes learning about faith fun and visual for young ones."
              </p>
              <p className="font-fredoka font-semibold text-xs sm:text-sm">- Mary T.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-4 bg-gradient-to-t from-primary/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-accent fill-accent" />
            <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-accent fill-accent" />
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
    </main>
  );
};

export default Product;