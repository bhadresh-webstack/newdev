"use client"
import Link from "next/link"
import { Layers } from "lucide-react"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Webstack
              </span>
            </div>
            <p className="text-muted-foreground font-light">
              Streamlined website development workflow for businesses of all sizes.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Features", "Pricing", "Testimonials", "Blog"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              {["About Us", "Careers", "Contact", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground font-light">123 Web Street, Digital City</li>
              <li className="text-muted-foreground font-light">contact@webstack.com</li>
              <li className="text-muted-foreground font-light">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-muted-foreground font-light">
          <p>© {new Date().getFullYear()} Webstack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
