import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import logo from "@/assets/logo.jpg"; // or .jpg, .svg depending on your file

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="Little Saint Art Logo" 
              className="h-10 w-auto object-contain"
            />
          </button>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/product")}
              variant="ghost"
              className="font-fredoka"
            >
              Collection
            </Button>
            <Button
              onClick={() => navigate("/checkout")}
              className="font-fredoka gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;