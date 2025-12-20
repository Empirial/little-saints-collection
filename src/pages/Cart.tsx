import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Store cart data for checkout page
    const cartData = {
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: totalPrice
    };
    localStorage.setItem("cart", JSON.stringify(cartData));
    navigate("/checkout");
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead 
        title="Your Cart | Little Saints Art Creations" 
        description="Review your cart items and proceed to checkout."
        canonicalUrl="https://littlesaintart.co.za/cart"
      />
      
      <Navbar />

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="font-inter">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-fredoka text-3xl md:text-4xl font-bold">Your Cart</h1>
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-fredoka text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="font-inter text-muted-foreground mb-6">
                Looks like you haven't added any items yet.
              </p>
              <Button onClick={() => navigate("/product")} className="font-fredoka">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Posters
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <Card key={item.id} className="p-4 flex gap-4">
                    {item.image && (
                      <div className="w-20 h-28 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-fredoka text-lg font-bold truncate">{item.name}</h3>
                      <p className="font-inter text-primary font-semibold">R{item.price}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-inter font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Total & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <p className="font-fredoka text-lg font-bold">
                        R{item.price * item.quantity}
                      </p>
                    </div>
                  </Card>
                ))}

                {/* Clear Cart Button */}
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="w-full font-inter text-muted-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h2 className="font-fredoka text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex justify-between font-inter">
                      <span className="text-muted-foreground">Items ({totalItems})</span>
                      <span>R{totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-inter">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 font-fredoka text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">R{totalPrice}</span>
                  </div>

                  <Button 
                    onClick={handleCheckout}
                    className="w-full font-fredoka text-lg py-6 rounded-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <p className="font-inter text-xs text-muted-foreground text-center mt-4">
                    Secure checkout • Fast delivery across SA
                  </p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Cart;
