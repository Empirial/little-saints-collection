import { useState, useCallback, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import heroImage from "@/assets/poster/hero-image.webp";
import posterCollection from "@/assets/poster/poster-collection.webp";
import Cover from "@/assets/Cover.jpg";

// Preload critical first image
const preloadImage = (src: string) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
};

// Preload hero image immediately
if (typeof window !== "undefined") {
  preloadImage(heroImage);
}

interface CarouselSlide {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  buttonPath: string;
}

const slides: CarouselSlide[] = [
  {
    image: heroImage,
    subtitle: "Little Saint Art Creations",
    title: "Inspire & Delight Every Child",
    description: "Beautiful Christian posters and personalized adventure books for children",
    buttonText: "SHOP NOW",
    buttonPath: "/product",
  },
  {
    image: posterCollection,
    subtitle: "Premium Collection",
    title: "9 Beautiful Bible Story Posters",
    description: "High-quality A3 posters printed on 350gsm paper, perfect for any child's space",
    buttonText: "VIEW COLLECTION",
    buttonPath: "/product",
  },
  {
    image: Cover,
    subtitle: "The Magic in My Name",
    title: "Your Child as the Hero",
    description: "A magical adventure where your child discovers each letter of their name. Sparks reading, confidence, and self-love.",
    buttonText: "CREATE BOOK",
    buttonPath: "/personalize-book",
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Auto-scroll every 10 seconds
    const autoScroll = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 10000);

    return () => {
      clearInterval(autoScroll);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative min-h-svh pt-16 overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full will-change-transform">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide flex-[0_0_100%] min-w-0 relative min-h-svh"
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                decoding={index === 0 ? "sync" : "async"}
                fetchPriority={index === 0 ? "high" : "low"}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/70 to-background" />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center h-full px-4">
                <div className="text-center max-w-5xl mx-auto">
                  <p className="font-fredoka text-xl md:text-2xl text-foreground mb-2">
                    {slide.subtitle}
                  </p>
                  <h2 className="font-fredoka text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="font-inter text-base sm:text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
                    {slide.description}
                  </p>
                  <Button
                    onClick={() => navigate(slide.buttonPath)}
                    size="lg"
                    className="font-fredoka text-lg sm:text-xl px-8 sm:px-12 py-6 sm:py-7 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${index === selectedIndex
              ? "bg-primary w-6 sm:w-8"
              : "bg-foreground/30 hover:bg-foreground/50"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default memo(HeroCarousel);
