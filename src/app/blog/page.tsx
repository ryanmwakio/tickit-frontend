"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Users,
  Search,
  Filter,
  Star,
  Heart,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Grid3X3,
  List,
} from "lucide-react";
import { Footer } from "@/components/footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
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
    author: {
      name: "Grace Wanjiku",
      bio: "Music journalist and cultural critic based in Nairobi.",
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
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
    category: "Corporate",
    date: "December 12, 2024",
    author: {
      name: "David Kamau",
      bio: "Corporate culture consultant and organizational development specialist.",
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
    author: {
      name: "Amina Hassan",
      bio: "Cultural anthropologist and event curator specializing in East African traditions.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "Cultural Curator",
    },
    readTime: "5 min read",
    tags: [
      "Food Festivals",
      "Cultural Heritage",
      "Traditional Events",
      "Community",
      "Preservation",
    ],
    likes: 203,
    views: 1890,
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
    author: {
      name: "Michael Otieno",
      bio: "Fintech analyst and digital payments expert with focus on East African markets.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Fintech Analyst",
    },
    readTime: "3 min read",
    tags: [
      "Digital Payments",
      "MPesa",
      "Technology",
      "Innovation",
      "Accessibility",
    ],
    likes: 89,
    views: 1540,
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
    author: {
      name: "Sarah Mwangi",
      bio: "Education policy researcher and former university administrator.",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
      role: "Education Researcher",
    },
    readTime: "7 min read",
    tags: [
      "Education",
      "University",
      "Leadership",
      "Student Events",
      "Career Development",
    ],
    likes: 134,
    views: 2230,
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
    author: {
      name: "James Kiplagat",
      bio: "Travel journalist and adventure tourism specialist covering East Africa.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      role: "Travel Writer",
    },
    readTime: "4 min read",
    tags: [
      "Travel",
      "Tourism",
      "Experiential Events",
      "Adventure",
      "Weekend Getaways",
    ],
    likes: 178,
    views: 1670,
  },
  {
    id: "7",
    title:
      "Women in Events: Breaking Barriers in Kenya's Event Management Industry",
    excerpt:
      "Meet the female leaders revolutionizing Kenya's event industry and creating opportunities for the next generation.",
    image:
      "https://images.unsplash.com/photo-1559223607-4c0b5ca6b4a8?w=800&h=600&fit=crop",
    category: "Leadership",
    date: "November 28, 2024",
    author: {
      name: "Patricia Nyong",
      bio: "Business journalist covering women's entrepreneurship in East Africa.",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      role: "Business Journalist",
    },
    readTime: "5 min read",
    tags: [
      "Women Leadership",
      "Event Management",
      "Entrepreneurship",
      "Gender Equality",
      "Industry",
    ],
    likes: 267,
    views: 3110,
  },
  {
    id: "8",
    title: "Sustainable Events: Kenya's Green Revolution in Event Planning",
    excerpt:
      "How Kenyan event organizers are leading the charge in sustainable practices, from zero-waste festivals to carbon-neutral conferences.",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    category: "Sustainability",
    date: "November 25, 2024",
    author: {
      name: "Dr. Elizabeth Wambui",
      bio: "Environmental scientist and sustainable development consultant.",
      avatar:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
      role: "Environmental Scientist",
    },
    readTime: "6 min read",
    tags: [
      "Sustainability",
      "Green Events",
      "Environment",
      "Zero Waste",
      "Climate",
    ],
    likes: 195,
    views: 2450,
  },
];

const categories = [
  "All Categories",
  "Music & Culture",
  "Corporate",
  "Culture & Heritage",
  "Technology",
  "Education",
  "Travel & Lifestyle",
  "Leadership",
  "Sustainability",
];

function BlogCard({
  post,
  variant = "grid",
}: {
  post: BlogPost;
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <article className="group">
        <Link href={`/blog/${post.id}`}>
          <div className="tix-card overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="md:flex">
              <div className="relative md:w-80 h-48 md:h-auto overflow-hidden md:shrink-0">
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
              <div className="p-6 md:flex-1">
                <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {post.author.name}
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {post.likes && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </div>
                    )}
                    {post.views && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {post.views.toLocaleString()} views
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

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
            {post.featured && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-1 text-xs font-medium text-white">
                  <TrendingUp className="h-3 w-3" />
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
                {post.author.name}
              </div>
              <span>{post.readTime}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
              {post.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {post.likes && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </div>
                )}
                {post.views && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {post.views.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                Read more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogListingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Filter posts based on category and search
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All Categories" ||
      post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + postsPerPage,
  );

  // Reset pagination when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const featuredPost = blogPosts.find((post) => post.featured);

  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900">
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-16">
            {/* Navigation back */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Home
              </Link>
            </div>

            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">
                Event Culture Blog
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Stories & Insights
              </h1>
              <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Dive deep into Kenya&apos;s vibrant event culture with expert
                insights, behind-the-scenes stories, and trends shaping the
                future of events across the country.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {blogPosts.length}+
                </div>
                <div className="text-sm text-slate-600">Articles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  50K+
                </div>
                <div className="text-sm text-slate-600">Monthly Readers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  200+
                </div>
                <div className="text-sm text-slate-600">
                  Expert Contributors
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  15+
                </div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="bg-slate-50 py-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Featured Story
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Our editors&apos; pick for this week&apos;s must-read story.
                </p>
              </div>

              <article className="group max-w-4xl mx-auto">
                <Link href={`/blog/${featuredPost.id}`}>
                  <div className="tix-card overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="md:flex md:items-center">
                      <div className="relative md:w-1/2 h-80 md:h-96 overflow-hidden">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-700">
                            <Star className="h-4 w-4" />
                            {featuredPost.category}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-sm font-medium text-white">
                            <TrendingUp className="h-4 w-4" />
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="p-8 md:w-1/2">
                        <div className="mb-4 flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {featuredPost.date}
                          </div>
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                          {featuredPost.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Image
                              src={featuredPost.author.avatar}
                              alt={featuredPost.author.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <div className="font-medium text-slate-900">
                                {featuredPost.author.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {featuredPost.author.role}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            Read full story
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            </div>
          </section>
        )}

        {/* Filters and Controls */}
        <section className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-600" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-slate-600">
              {filteredPosts.length === 0
                ? "No articles found"
                : `Showing ${startIndex + 1}-${Math.min(startIndex + postsPerPage, filteredPosts.length)} of ${filteredPosts.length} articles`}
            </div>
          </div>
        </section>

        {/* Articles Grid/List */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No articles found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search terms or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Clear filters
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-8"
                  }
                >
                  {paginatedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} variant={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Get the latest stories, insights, and event trends delivered to
              your inbox. Join thousands of event enthusiasts staying informed
              about Kenya&apos;s vibrant event culture.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              No spam, unsubscribe anytime. Privacy policy applies.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
