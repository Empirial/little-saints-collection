import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Search, X, Home, Image, Layers, BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const scrollToFooter = () => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/", action: "navigate" },
    { icon: Image, label: "Poster Full Collection", path: "/product", action: "navigate" },
    { icon: Layers, label: "Individual Poster", path: "/product", action: "navigate" },
    { icon: BookOpen, label: "Personalised Books", path: "/personalize-book", action: "navigate" },
    { icon: MessageCircle, label: "Contact Us", path: "#footer", action: "scroll" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-fredoka text-lg font-bold">Menu</span>
                  <SheetClose asChild>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </SheetClose>
                </div>

                {/* Menu Items */}
                <div className="flex-1 py-4">
                  {menuItems.map((item, index) => (
                    <SheetClose key={`${item.path}-${index}`} asChild>
                      <button
                        onClick={() => {
                          if (item.action === "scroll") {
                            scrollToFooter();
                          } else {
                            handleNavigation(item.path);
                          }
                        }}
                        className="flex items-center gap-4 w-full px-6 py-4 hover:bg-muted transition-colors text-left"
                      >
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-fredoka text-base">{item.label}</span>
                      </button>
                    </SheetClose>
                  ))}
                </div>

                {/* Menu Footer - WhatsApp Contact */}
                <div className="border-t border-border p-4">
                  <a
                    href="https://wa.me/27791175714"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-inter text-sm">WhatsApp: +27 79 117 5714</span>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Center - Logo */}
          <button 
            onClick={() => handleNavigation("/")}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="Little Saint Art Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </button>
          
          {/* Right - Search & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
