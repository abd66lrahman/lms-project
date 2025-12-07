import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import type { User, Page } from "../App";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  coverUrl?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
};

type HomePageProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page, bookId?: string) => void;
};

export function HomePage({ user, onLogout, onNavigate }: HomePageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedCategory, books]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/books");
      const data = await response.json();

      if (response.ok) {
        setBooks(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((book: Book) => book.category))
        );
        setCategories(uniqueCategories as string[]);
      } else {
        toast.error("Failed to load books");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl mb-2">Browse Books</h1>
            <p className="text-gray-600">
              {filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "book" : "books"} available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Filter by category:</span>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No books found</p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate("book-details", book.id)}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl opacity-30">📚</span>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600">{book.author}</p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        book.availableCopies > 0 ? "default" : "secondary"
                      }
                    >
                      {book.category}
                    </Badge>
                    <span
                      className={`text-sm ${book.availableCopies > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} available`
                        : "Unavailable"}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={book.availableCopies > 0 ? "default" : "secondary"}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onNavigate("book-details", book.id);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
