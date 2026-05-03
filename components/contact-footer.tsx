import { Mail, Phone, MapPin } from "lucide-react"

export function ContactFooter() {
  return (
    <footer className="border-t border-[#2C2C2C] bg-[#141414] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-[#E8E8E8]">Contact Us</h4>
            <div className="space-y-2 text-[#9CA3AF]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FE5102]" />
                <a href="mailto:memecoin100@proton.me" className="hover:text-[#FE5102] transition-colors">
                  memecoin100@proton.me
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FE5102]" />
                <span>+254759900002</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-[#E8E8E8]">Location</h4>
            <div className="flex items-start gap-2 text-[#9CA3AF]">
              <MapPin className="w-4 h-4 mt-0.5 text-[#FE5102]" />
              <span>
                Nairobi, Kenya<br />
                Westlands Business District
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-[#E8E8E8]">Hours</h4>
            <p className="text-[#9CA3AF]">
              Monday - Friday<br />
              8:00 AM - 6:00 PM EAT
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-[#2C2C2C] text-center text-xs text-[#666]">
          © {new Date().getFullYear()} Afrifutures. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
