import React from "react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

const PageFooter = () => {
  return (
    <footer className="bg-[#0A0F18] text-neutral-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <BrandLogo />
            </div>
            <p className="mb-4">
              Empowering the next generation of drone experts with cutting-edge
              education and certification.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://flytbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  FlytBase.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Contact Us",
                "FAQs",
                "System Requirements",
                "Privacy Policy",
              ].map((item, i) => (
                <li key={i}>
                  <a 
                    href={item === "Contact Us" ? "https://www.flytbase.com/contact" : "#"} 
                    className="hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#1A1F2C] text-white px-4 py-2 rounded-l-md focus:outline-none flex-1"
              />
              <Button className="rounded-l-none bg-flytbase-secondary hover:bg-flytbase-secondary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8 mt-8 text-center">
          <p>
            © {new Date().getFullYear()} FlytBase Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
