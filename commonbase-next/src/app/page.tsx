import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Commonbase
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A simple, powerful knowledge management system with semantic search, 
          image processing, and AI-powered synthesis capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📚</span>
              <span>Ledger</span>
            </CardTitle>
            <CardDescription>
              View and manage all your entries in one place with bulk operations and filtering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/ledger">Browse Entries</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔍</span>
              <span>Search</span>
            </CardTitle>
            <CardDescription>
              Find entries using semantic similarity or full-text search with intelligent highlighting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/search">Search Knowledge</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>➕</span>
              <span>Add</span>
            </CardTitle>
            <CardDescription>
              Create new entries from text or images with automatic AI transcription and embedding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/add">Add Content</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📖</span>
              <span>Feed</span>
            </CardTitle>
            <CardDescription>
              Discover and rediscover your content through a randomized, infinite scroll feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/feed">Explore Feed</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔗</span>
              <span>Share</span>
            </CardTitle>
            <CardDescription>
              Synthesize multiple entries into cohesive narratives using AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/share">Synthesize Ideas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🌐</span>
              <span>Graph</span>
            </CardTitle>
            <CardDescription>
              Visualize your knowledge as an interactive 3D network showing connections between entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/graph">Explore Graph</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription>
              New to Commonbase? Start by adding your first entry or exploring the features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/add">Add First Entry</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/ledger">View All Features</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-12">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Semantic search with vector embeddings</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Full-text search with PostgreSQL FTS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Image upload with AI transcription</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Entry linking and backlink tracking</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Cart system for collecting ideas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>AI-powered content synthesis</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Infinite scroll discovery feed</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Rich metadata and tagging support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
