import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-emerald-50 bg-white">
    <div className="container-lux grid gap-10 py-14 md:grid-cols-3">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white-600 text-white shadow-lux">
           <img
          src="/logo.png"            // public assets are referenced from root
          alt="Logo"
          className="h-8 w-auto object-contain"
        />
          </div>
          <div>
            <h3 className="font-playfair text-2xl text-gray-900">Aurora Auctions</h3>
            <p className="text-sm text-gray-500">Luxury Gem Auction Experiences</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Bid on rare gemstones curated for discerning collectors. Every auction is an invitation to own a piece of brilliance.
        </p>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Quick Links</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
          <Link to="/">Home</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Contact</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-emerald-600" />
            support@auroraauctions.com
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-emerald-600" />
            +94 77 123 4567
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Pitipana - Thalagala Rd, Homagama
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-emerald-50 py-6 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} Aurora Auctions. Crafted for brilliance.
    </div>
  </footer>
);

export default Footer;
