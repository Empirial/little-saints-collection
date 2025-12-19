import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => handleNavigation("/")}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="Little Saint Art Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            <Button
              onClick={() => navigate("/product")}
              variant="ghost"
              className="font-fredoka text-sm md:text-base"
            >
              Collection
            </Button>
            <Button
              onClick={() => navigate("/checkout")}
              className="font-fredoka gap-2 text-sm md:text-base"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">View Cart</span>
              <span className="md:hidden">Cart</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border py-4 pb-safe space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Button
              onClick={() => handleNavigation("/product")}
              variant="ghost"
              className="w-full justify-start font-fredoka"
            >
              Collection
            </Button>
            <Button
              onClick={() => handleNavigation("/personalize-book")}
              variant="ghost"
              className="w-full justify-start font-fredoka"
            >
              Personalized Books
            </Button>
            <Button
              onClick={() => handleNavigation("/checkout")}
              className="w-full font-fredoka gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;