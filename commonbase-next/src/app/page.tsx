import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black tracking-tight text-black">
          Welcome to Commonbase
        </h1>
        <p className="text-xl text-black font-semibold max-w-2xl mx-auto">
          A simple, powerful knowledge management system with semantic search, 
          image processing, and AI-powered synthesis capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <Card className="neo-violet">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>📚</span>
              <span>Ledger</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              View and manage all your entries in one place with bulk operations and filtering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/ledger">Browse Entries</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-pink">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>🔍</span>
              <span>Search</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              Find entries using semantic similarity or full-text search with intelligent highlighting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="pink" className="w-full">
              <Link href="/search">Search Knowledge</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-lime">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>➕</span>
              <span>Add</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              Create new entries from text or images with automatic AI transcription and embedding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent" className="w-full">
              <Link href="/add">Add Content</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-orange">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>📖</span>
              <span>Feed</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              Discover and rediscover your content through a randomized, infinite scroll feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="orange" className="w-full">
              <Link href="/feed">Explore Feed</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-cyan">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>🔗</span>
              <span>Share</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              Synthesize multiple entries into cohesive narratives using AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="w-full">
              <Link href="/share">Synthesize Ideas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-red">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>🌐</span>
              <span>Graph</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              Visualize your knowledge as an interactive 2D network showing connections between entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="destructive" className="w-full">
              <Link href="/graph">Explore Graph</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="neo-yellow border-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <span>🚀</span>
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription className="text-black font-semibold">
              New to Commonbase? Start by adding your first entry or exploring the features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild size="sm" variant="accent" className="w-full">
                <Link href="/add">Add First Entry</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/ledger">View All Features</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="neo-card neo-lime border-4 mt-12">
        <h2 className="text-3xl font-black mb-6 text-black">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Semantic search with vector embeddings</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Full-text search with PostgreSQL FTS</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Image upload with AI transcription</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Entry linking and backlink tracking</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Cart system for collecting ideas</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">AI-powered content synthesis</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Infinite scroll discovery feed</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-black">✓</span>
              <span className="font-semibold text-black">Rich metadata and tagging support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
