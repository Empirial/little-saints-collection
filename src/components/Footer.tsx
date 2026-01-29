import { MessageCircle } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-foreground text-background py-8 px-4 mt-auto">
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
                    © {new Date().getFullYear()} Little Saints. Inspiring faith in young hearts.
                </p>
                <p className="font-inter text-xs opacity-60 mt-3">
                    Made by{" "}
                    <a
                        href="https://www.empirialdesigns.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors underline"
                    >
                        www.empirialdesigns.com
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
