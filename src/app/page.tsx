import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { Showcase } from '@/components/landing/Showcase'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Problems } from '@/components/landing/Problems'
import { Features } from '@/components/landing/Features'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'
import './landing.css'

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased overflow-x-hidden min-h-screen">
      <Navbar />
      {/* Use 'isolate' to ensure -z-10 stays above the body background but behind the content */}
      <div className="relative pt-0 isolate bg-white dark:bg-gray-900">
        {/* Unified Mesh Gradient Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Center-concentrated purple/indigo sweep */}
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-gradient-to-b from-indigo-500/50 to-purple-500/40 rounded-full blur-[120px] opacity-40 md:opacity-100"></div>
          
          {/* Core intense spot directly in the center of the Hero */}
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-indigo-600/30 rounded-full blur-[100px] opacity-40 md:opacity-100"></div>
          
          {/* Cyan/Blue splash at the bottom-center descending into SocialProof */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-gradient-to-t from-cyan-400/50 via-blue-500/40 to-transparent rounded-full blur-[120px] opacity-40 md:opacity-100"></div>
          
          {/* Subtle blue wash on the right */}
          <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-blue-400/10 rounded-full blur-[120px] opacity-40 md:opacity-100"></div>
          
          {/* Smooth fade out at the bottom to blend with the rest of the page */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white dark:to-gray-900"></div>
        </div>
        
        <Hero />
        <SocialProof />
      </div>
      <Showcase />
      <HowItWorks />
      <Problems />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
