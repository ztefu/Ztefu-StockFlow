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
      <Hero />
      <SocialProof />
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
