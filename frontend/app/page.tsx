import Hero from "@/components/hero"
import { FeaturedProperties } from "@/components/featured-properties"
import MarketInsights from "@/components/market-insights"
import Portfolio from "@/components/portfolio"
import Testimonials from "@/components/testimonials"
import ChatbaseWidget from "@/components/chatbase-widget"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProperties />
      <MarketInsights />
      <Portfolio />
      <Testimonials />
      <ChatbaseWidget />
    </main>
  )
}

