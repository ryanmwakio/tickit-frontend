import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Heart,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Star,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
} from "lucide-react";
import { Footer } from "@/components/footer";

// Blog post data structure
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  author: {
    name: string;
    bio: string;
    avatar: string;
    role: string;
  };
  readTime: string;
  tags: string[];
  featured?: boolean;
  likes?: number;
  views?: number;
}

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title:
      "The Rise of Afro House: How Nairobi Became East Africa's Electronic Music Capital",
    excerpt:
      "From underground warehouse parties to sold-out stadium events, discover how Nairobi's electronic music scene is shaping the future of African nightlife.",
    content: `
      <p>In the heart of East Africa, a musical revolution has been quietly brewing. Nairobi, Kenya's bustling capital, has emerged as the undisputed epicenter of electronic music in the region, with Afro House leading the charge. This genre, which seamlessly blends traditional African rhythms with modern electronic beats, has not only captured the hearts of local music lovers but has also begun to make waves on the international stage.</p>

      <h2>The Underground Beginnings</h2>
      <p>The story of Nairobi's electronic music scene begins in the early 2000s, in dimly lit warehouses and converted industrial spaces on the outskirts of the city. Pioneer DJs like DJ Creme de la Creme and DJ Crème began experimenting with electronic sounds, initially importing genres from Europe and America before gradually incorporating local elements.</p>

      <blockquote>"We started by mimicking what we heard from abroad, but we quickly realized that our music needed to reflect our own stories, our own rhythms," recalls DJ Kym Nickdee, one of the early adopters of the electronic scene in Nairobi.</blockquote>

      <p>These early events were small, intimate affairs, often attended by a tight-knit community of music enthusiasts who were hungry for something different from the mainstream Kenyan music scene dominated by gospel, hip-hop, and traditional music.</p>

      <h2>The Afro House Movement</h2>
      <p>As the scene matured, a distinctly African flavor began to emerge. Local producers started incorporating traditional Kenyan instruments like the nyatiti, orutu, and various percussion instruments into their electronic compositions. This fusion gave birth to what is now known as Afro House – a genre that maintains the four-on-the-floor beat structure of house music while infusing it with African musical sensibilities.</p>

      <p>Artists like Blinky Bill, part of the collective Just a Band, began gaining recognition for their innovative approach to electronic music. Their track "Ha-He" became a local anthem, proving that Kenyan electronic music could resonate with mainstream audiences.</p>

      <h2>From Warehouses to Stadiums</h2>
      <p>The transformation from underground movement to mainstream phenomenon has been remarkable. What started as gatherings of 50-100 people in converted warehouses has evolved into massive festivals attracting thousands of attendees.</p>

      <p>Events like Nyege Nyege Festival (which started in Uganda but heavily features Kenyan artists) and local festivals like Blankets and Wine have provided platforms for electronic music artists to reach broader audiences. The success of these events has encouraged venue owners and event organizers to invest more in electronic music events.</p>

      <h2>The Digital Revolution</h2>
      <p>The rise of streaming platforms and social media has played a crucial role in the growth of Nairobi's electronic music scene. Artists can now reach global audiences without traditional gatekeepers, and the African diaspora around the world has become an important market for Afro House music.</p>

      <p>Platforms like SoundCloud and YouTube have allowed local DJs and producers to build international followings. DJ sets from Nairobi clubs are now being streamed by listeners in London, New York, and beyond.</p>

      <h2>Economic Impact</h2>
      <p>The growth of the electronic music scene has had significant economic implications for Nairobi. New venues have opened specifically to cater to electronic music events, creating jobs for sound engineers, lighting technicians, security personnel, and hospitality workers.</p>

      <p>The events industry has also benefited, with specialized event management companies emerging to handle the technical and logistical challenges of electronic music events. Equipment rental companies have expanded their inventories to include specialized sound systems and lighting equipment.</p>

      <h2>Challenges and Opportunities</h2>
      <p>Despite its growth, the electronic music scene in Nairobi still faces several challenges. Licensing and regulatory issues can make it difficult to organize large-scale events. Noise complaints from neighbors have led to the closure of several popular venues.</p>

      <p>However, these challenges also present opportunities. The growing recognition of the economic potential of the creative industries by the government has led to more supportive policies. The establishment of creative hubs and incubators has provided resources for emerging artists and producers.</p>

      <h2>International Recognition</h2>
      <p>Nairobi's electronic music scene is increasingly gaining international attention. Kenyan DJs are being booked for festivals in Europe and North America, and international record labels are signing Kenyan electronic music artists.</p>

      <p>The genre has also caught the attention of music critics and cultural commentators worldwide, who see Afro House as part of a broader movement of African artists reclaiming and redefining global music genres.</p>

      <h2>The Future</h2>
      <p>As we look to the future, the prospects for Nairobi's electronic music scene appear bright. The next generation of artists is more technically sophisticated and business-savvy than their predecessors. Music production education is becoming more accessible, and the quality of locally produced music continues to improve.</p>

      <p>The scene is also becoming more inclusive, with more female DJs and producers gaining prominence and LGBTQ+ friendly events becoming more common.</p>

      <h2>Conclusion</h2>
      <p>Nairobi's transformation into East Africa's electronic music capital is a testament to the creativity, perseverance, and entrepreneurial spirit of its music community. From humble beginnings in underground warehouses to sold-out stadium events, the journey has been remarkable.</p>

      <p>As Afro House continues to evolve and gain international recognition, Nairobi is well-positioned to become not just a regional leader but a global hub for innovative electronic music that proudly celebrates its African roots while embracing the possibilities of the future.</p>
    `,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
    category: "Music & Culture",
    date: "December 15, 2024",
    author: {
      name: "Grace Wanjiku",
      bio: "Music journalist and cultural critic based in Nairobi. Grace has covered East Africa's music scene for over a decade.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
      role: "Music Journalist",
    },
    readTime: "6 min read",
    tags: [
      "Electronic Music",
      "Afro House",
      "Nairobi",
      "Music Culture",
      "Entertainment",
    ],
    featured: true,
    likes: 247,
    views: 3420,
  },
  {
    id: "2",
    title:
      "Corporate Events That Actually Matter: Building Team Culture in Kenya",
    excerpt:
      "Why forward-thinking Kenyan companies are moving beyond boring boardrooms to create memorable experiences that boost employee engagement.",
    content: `
      <p>In boardrooms across Nairobi, a quiet revolution is taking place. Forward-thinking Kenyan companies are abandoning the traditional model of corporate events – stuffy conferences and mandatory team-building exercises – in favor of experiences that genuinely engage employees and build lasting company culture.</p>

      <h2>The Problem with Traditional Corporate Events</h2>
      <p>For too long, corporate events in Kenya have followed a predictable formula: rent a conference room, hire a motivational speaker, serve lunch, and call it team building. The result? Employees who attend out of obligation, check their phones throughout presentations, and return to work unchanged.</p>

      <p>"We were spending hundreds of thousands of shillings on events that no one talked about a week later," says Sarah Kiprotich, HR Director at a major Nairobi-based financial services firm. "We realized we needed to completely rethink our approach."</p>

      <h2>The New Paradigm</h2>
      <p>The companies leading this transformation understand that memorable corporate events should accomplish three key objectives: strengthen relationships between team members, reinforce company values in tangible ways, and create shared experiences that employees actually want to participate in.</p>

      <blockquote>"The best corporate events don't feel corporate at all," explains James Mwangi, founder of Nairobi-based event planning company Culture Builders. "They feel like experiences you'd choose to attend in your personal time."</blockquote>

      <h2>Real-World Examples</h2>
      <p>Several Kenyan companies are pioneering innovative approaches to corporate events:</p>

      <p><strong>Safaricom's Innovation Days:</strong> Instead of traditional workshops, the telecommunications giant organizes quarterly "innovation days" where employees form cross-departmental teams to solve real company challenges. The winning ideas are actually implemented, giving employees genuine ownership over company direction.</p>

      <p><strong>Equity Bank's Community Impact Events:</strong> The bank organizes volunteer events where employees work together on community projects. Recent events have included building water tanks for schools and organizing financial literacy workshops for small business owners. These events reinforce the company's mission while creating meaningful team bonding experiences.</p>

      <p><strong>Jumia's Food Festival:</strong> The e-commerce company's annual food festival features cooking competitions between departments, with ingredients sourced from vendors on their platform. It's fun, competitive, and directly related to their business model.</p>

      <h2>The Role of Technology</h2>
      <p>Kenyan companies are also leveraging technology to enhance their corporate events. Mobile apps allow for real-time feedback, photo sharing, and networking. Virtual reality experiences are being used for team challenges and training simulations.</p>

      <p>Live polling and interactive presentations keep audiences engaged, while social media integration helps extend the impact of events beyond the day itself.</p>

      <h2>Measuring Success</h2>
      <p>The companies seeing the best results from their reimagined corporate events have developed new metrics for success. Instead of just counting attendance, they track:</p>

      <ul>
        <li>Employee engagement scores in post-event surveys</li>
        <li>Cross-departmental collaboration in the months following events</li>
        <li>Employee retention rates</li>
        <li>Social media engagement and user-generated content</li>
        <li>Implementation of ideas generated during events</li>
      </ul>

      <h2>Budget Considerations</h2>
      <p>Contrary to what many might expect, these innovative corporate events don't necessarily cost more than traditional alternatives. The key is shifting budget allocation from expensive venues and speakers to experiences and activities that directly engage participants.</p>

      <p>"We actually reduced our per-person event budget by 30% while dramatically increasing satisfaction scores," reports Michael Kiplagat, Operations Manager at a Nairobi tech startup. "The secret was focusing on creativity over luxury."</p>

      <h2>Implementation Tips</h2>
      <p>For companies looking to transform their corporate events, experts recommend:</p>

      <ul>
        <li><strong>Start with employee input:</strong> Survey your team about what kinds of experiences they'd find valuable</li>
        <li><strong>Align with company values:</strong> Ensure events reinforce what your company stands for</li>
        <li><strong>Make it voluntary:</strong> The best engagement comes from people who choose to participate</li>
        <li><strong>Follow up:</strong> Create opportunities for continued engagement after the event</li>
        <li><strong>Iterate:</strong> Use feedback to continuously improve future events</li>
      </ul>

      <h2>The Future of Corporate Events in Kenya</h2>
      <p>As the Kenyan business landscape becomes increasingly competitive, companies that invest in genuine employee engagement will have a significant advantage. Corporate events that build real relationships and reinforce shared purpose will be a key differentiator in attracting and retaining top talent.</p>

      <p>The transformation is already underway. Companies that embrace this new approach to corporate events are seeing measurable improvements in employee satisfaction, team cohesion, and overall company culture. In Kenya's dynamic business environment, that could make all the difference.</p>
    `,
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop",
    category: "Corporate",
    date: "December 12, 2024",
    author: {
      name: "David Kamau",
      bio: "Corporate culture consultant and organizational development specialist with 15 years of experience in the Kenyan market.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Culture Consultant",
    },
    readTime: "4 min read",
    tags: [
      "Corporate Events",
      "Team Building",
      "Employee Engagement",
      "Company Culture",
      "HR",
    ],
    likes: 156,
    views: 2180,
  },
  // Add more posts as needed...
];

// Get related posts (excluding current post)
function getRelatedPosts(
  currentPostId: string,
  category: string,
  limit: number = 3,
): BlogPost[] {
  return blogPosts
    .filter((post) => post.id !== currentPostId && post.category === category)
    .slice(0, limit);
}

// Share component
function ShareButtons({
  post,
  className = "",
}: {
  post: BlogPost;
  className?: string;
}) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${post.title} - ${post.excerpt}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-slate-600">Share:</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
              "_blank",
            )
          }
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
              "_blank",
            )
          }
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
              "_blank",
            )
          }
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Related post card component
function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.id}`}>
        <div className="tix-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">
                <Star className="h-3 w-3" />
                {post.category}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {post.date}
              </div>
              <span>{post.readTime}</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">
              {post.excerpt}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.id, post.category);

  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Navigation back */}
          <div className="absolute top-6 left-6 z-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Hero content */}
          <div className="absolute inset-0 z-10 flex items-end">
            <div className="w-full max-w-4xl mx-auto px-6 pb-12">
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white">
                  <Star className="h-3 w-3" />
                  {post.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                {post.excerpt}
              </p>

              {/* Author and meta info */}
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-white">
                      {post.author.name}
                    </div>
                    <div className="text-sm text-white/70">
                      {post.author.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {post.views?.toLocaleString()} views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="lg:flex lg:gap-12">
              {/* Article content */}
              <article className="lg:flex-1">
                {/* Interaction bar */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      Discuss
                    </button>
                  </div>
                  <ShareButtons post={post} />
                </div>

                {/* Article text */}
                <div
                  className="prose prose-slate max-w-none prose-lg prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-slate-900 prose-a:font-medium prose-strong:text-slate-900 prose-blockquote:border-slate-200 prose-blockquote:bg-slate-50 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-blockquote:not-italic prose-blockquote:text-slate-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author bio */}
                <div className="mt-12 p-6 bg-slate-50 rounded-2xl">
                  <h4 className="font-semibold text-slate-900 mb-4">
                    About the Author
                  </h4>
                  <div className="flex gap-4">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={60}
                      height={60}
                      className="rounded-full shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">
                        {post.author.name}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {post.author.role}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {post.author.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:w-80 mt-12 lg:mt-0">
                <div className="sticky top-6">
                  {/* Table of contents placeholder */}
                  <div className="tix-card p-6 mb-8">
                    <h4 className="font-semibold text-slate-900 mb-4">
                      In this article
                    </h4>
                    <nav className="space-y-2">
                      <a
                        href="#"
                        className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        The Underground Beginnings
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        The Afro House Movement
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        From Warehouses to Stadiums
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        Economic Impact
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        International Recognition
                      </a>
                    </nav>
                  </div>

                  {/* Newsletter signup */}
                  <div className="tix-card p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Stay Updated
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Get the latest insights on Kenya's event culture delivered
                      to your inbox.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                      />
                      <button className="w-full bg-slate-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
                  More {post.category} Stories
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Continue exploring insights and stories from Kenya's vibrant
                  event culture.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/">
                  <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 transition-colors">
                    View All Stories
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
