import { EventShowcase } from "@/components/event-showcase";
import { FeaturedEventsRail } from "@/components/featured-events-rail";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { EventBlog } from "@/components/event-blog";
import { EventInsights } from "@/components/event-insights";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900 overflow-x-hidden">
      <main className="overflow-x-hidden">
        <div className="relative border-y border-slate-100 bg-white overflow-x-hidden">
          <FeaturedEventsRail />
          <Hero />
        </div>
        <div className="bg-white">
          <EventShowcase />
          <EventBlog />
          <EventInsights />
        </div>
      </main>
      <Footer />
    </div>
  );
}
