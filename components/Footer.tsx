'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-white via-blue-50/30 to-white mt-20 border-blue-200/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/images/gostarthublogo.png" 
                alt="Go Start Hub Logo" 
                className="h-12 w-auto flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<h3 class="text-2xl font-medium tracking-wider bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">Go Start Hub</h3>';
                  }
                }}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Empowering young innovators to showcase their startups and connect with mentors and funding opportunities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Innovators</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/startups" className="hover:text-primary transition-colors">
                  Showcase Startups
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-primary transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link href="/funding" className="hover:text-primary transition-colors">
                  Funding Opportunities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/businesses" className="hover:text-primary transition-colors">
                  Connect with Innovators
                </Link>
              </li>
              <li>
                <Link href="/funding" className="hover:text-primary transition-colors">
                  Offer Funding
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-primary transition-colors">
                  Become a Mentor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Go Start Hub. All rights reserved.</p>
          <p className="mt-2">An initiative to support young innovators in Malaysia</p>
        </div>
      </div>
    </footer>
  );
}

