import { Facebook, Instagram, Mail,MapPin } from 'lucide-react';
import { FaTiktok } from "react-icons/fa";
export const Footer = () => {
  return <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quisells</h3>
            <p className="text-gray-300 mb-4">
              Your one-stop marketplace for services and products. Find what you
              need or sell what you offer.
            </p>
            <div className="flex space-x-4">
              <a href="https://shorturl.at/3jIdt" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://www.tiktok.com/@quisells?is_from_webapp=1&sender_device=pc" className="text-gray-300 hover:text-white">
                <FaTiktok size={20} />
              </a>
              <a href="https://www.instagram.com/quisells?igsh=MW5od285MGdjbWQ1bA==" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/services" className="text-gray-300 hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white">
                  Products
                </a>
              </li>
              <li>
                <a href="/become-seller" className="text-gray-300 hover:text-white">
                  Become a Seller
                </a>
              </li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-300 hover:text-white">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Nairobi,Kenya
                </span>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">ombongidiaz@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Quisells. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};