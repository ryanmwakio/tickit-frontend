"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, ArrowRight, Heart, Star } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title:
      "The Rise of Afro House: How Nairobi Became East Africa's Electronic Music Capital",
    excerpt:
      "From underground warehouse parties to sold-out stadium events, discover how Nairobi's electronic music scene is shaping the future of African nightlife.",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    category: "Music & Culture",
    date: "December 15, 2024",
    author: "Grace Wanjiku",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: "2",
    title:
      "Corporate Events That Actually Matter: Building Team Culture in Kenya",
    excerpt:
      "Why forward-thinking Kenyan companies are moving beyond boring boardrooms to create memorable experiences that boost employee engagement.",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
    category: "Corporate",
    date: "December 12, 2024",
    author: "David Kamau",
    readTime: "4 min read",
  },
  {
    id: "3",
    title:
      "Food Festivals and Cultural Celebrations: Preserving Heritage Through Events",
    excerpt:
      "How modern event organizers are blending traditional Kenyan culture with contemporary festival experiences to celebrate our rich heritage.",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop",
    category: "Culture & Heritage",
    date: "December 10, 2024",
    author: "Amina Hassan",
    readTime: "5 min read",
  },
  {
    id: "4",
    title:
      "The Digital Revolution: How Mobile Payments Changed Kenya's Event Industry",
    excerpt:
      "MPesa and digital wallets have transformed how Kenyans buy tickets, making events more accessible than ever before.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    category: "Technology",
    date: "December 8, 2024",
    author: "Michael Otieno",
    readTime: "3 min read",
  },
  {
    id: "5",
    title:
      "From Campus to Career: University Events That Shape Kenya's Future Leaders",
    excerpt:
      "Exploring how campus events, conferences, and student-led initiatives are nurturing the next generation of Kenyan innovators.",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
    category: "Education",
    date: "December 5, 2024",
    author: "Sarah Mwangi",
    readTime: "7 min read",
  },
  {
    id: "6",
    title:
      "Weekend Escapes: The Growing Trend of Experiential Travel Events in Kenya",
    excerpt:
      "Why more Kenyans are choosing curated experiences over traditional tourism, and how event organizers are responding.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    category: "Travel & Lifestyle",
    date: "December 3, 2024",
    author: "James Kiplagat",
    readTime: "4 min read",
  },
];

function BlogCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  return (
    <article
      className={`group cursor-pointer ${featured ? "md:col-span-2" : ""}`}
    >
      <Link href={`/blog/${post.id}`}>
        <div className="tix-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div
            className={`relative overflow-hidden ${featured ? "h-80" : "h-48"}`}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10" />
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700">
                <Star className="h-3 w-3" />
                {post.category}
              </span>
            </div>
            {featured && (
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white">
                  <Heart className="h-3 w-3" />
                  Featured
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {post.author}
              </div>
              <span>{post.readTime}</span>
            </div>

            <h3
              className={`font-semibold text-slate-900 transition-colors group-hover:text-slate-700 ${
                featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"
              }`}
            >
              {post.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              Read more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function EventBlog() {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 text-slate-900">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">
          Stories & Insights
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Celebrating Kenya&apos;s Vibrant Event Culture
        </h2>
        <p className="max-w-3xl mx-auto text-slate-600 leading-relaxed">
          From traditional celebrations to cutting-edge conferences, discover
          the stories, trends, and innovations shaping Kenya&apos;s dynamic
          events landscape.
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-16">
          <BlogCard post={featuredPost} featured={true} />
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {regularPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-12 text-center">
        <Link href="/blog">
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 font-medium text-white transition-colors hover:bg-slate-700">
            View All Stories
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="mt-16 rounded-2xl bg-slate-50 p-8">
        <div className="grid gap-8 md:grid-cols-3 text-center">
          <div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">
              500+
            </div>
            <div className="text-sm text-slate-600">Events Featured</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">
              50K+
            </div>
            <div className="text-sm text-slate-600">Stories Read Monthly</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">
              200+
            </div>
            <div className="text-sm text-slate-600">
              Event Organizers Featured
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
