import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import logo from "../../../public/Images/NavBar/logo.webp";

function Footer() {
  return (
    <footer className="bg-event-navy text-event-white">
      <div className="max-w-[1920px] mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <img src={logo} alt="EventPro" className="h-12 w-auto" />
            <p className="text-event-gray text-sm mt-4 max-w-[300px]">
              Creating unforgettable experiences with world-class facilities and
              expert support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-event-gray hover:text-white transition-colors hover:text-underline"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-event-gray hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/events"
                  className="text-event-gray hover:text-white transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-event-gray hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-event-gray">
              <li>123 Event Street</li>
              <li>Colombo, Sri Lanka</li>
              <li>Phone: +94 123 456 789</li>
              <li>Email: info@eventpro.com</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-event-white/10 p-2 rounded-full hover:bg-event-red transition-colors"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-event-white/10 p-2 rounded-full hover:bg-event-red transition-colors"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-event-white/10 p-2 rounded-full hover:bg-event-red transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-event-white/10 p-2 rounded-full hover:bg-event-red transition-colors"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-event-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-event-gray text-sm">
              © {new Date().getFullYear()} EventPro. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-event-gray hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-event-gray hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
