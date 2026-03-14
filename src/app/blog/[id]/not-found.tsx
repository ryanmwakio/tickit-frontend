import Link from "next/link";
import { ArrowLeft, BookOpen, Search } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <BookOpen className="h-24 w-24 text-slate-300 mx-auto mb-4" />
          <div className="text-6xl font-bold text-slate-900 mb-2">404</div>
          <div className="text-slate-400 text-sm uppercase tracking-wider">
            Article not found
          </div>
        </div>

        {/* Main content */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          This Story Doesn&apos;t Exist
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          The article you&apos;re looking for might have been moved, deleted, or never existed. 
          Let&apos;s get you back to discovering amazing stories about Kenya&apos;s event culture.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 transition-colors">
              <Search className="h-4 w-4" />
              Browse All Stories
            </button>
          </Link>
          <Link href="/">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </Link>
        </div>

        {/* Suggested actions */}
        <div className="tix-card p-6 text-left">
          <h3 className="font-semibold text-slate-900 mb-4">What you can do:</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>Check the URL for typos or missing characters</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>Browse our latest articles on Kenya&apos;s vibrant event culture</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>Use the search function to find specific topics or authors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
              <span>Explore different categories like Music & Culture, Corporate Events, or Technology</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}