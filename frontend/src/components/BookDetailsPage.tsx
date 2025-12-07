import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BorrowModal } from "./BorrowModal";
import { ReturnModal } from "./ReturnModal";
import { toast } from 'sonner';
import type { User, Page } from "../App";
import type { Book } from "./HomePage";

type BookDetailsPageProps = {
  bookId: string;
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
};

type BorrowHistory = {
  id: string;
  userId: string;
  borrowDate: string;
  returnDate?: string;
  status: "active" | "returned";
};

type EnrichedBorrowHistory = BorrowHistory & {
  username?: string;
};

export function BookDetailsPage({
  bookId,
  user,
  onBack,
  onLogout,
  onNavigate,
}: BookDetailsPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [borrowHistory, setBorrowHistory] = useState<EnrichedBorrowHistory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [userBorrowCount, setUserBorrowCount] = useState(0);
  const [userHasBorrowed, setUserHasBorrowed] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    fetchBorrowHistory();
    checkUserBorrowStatus();
  }, [bookId]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
      const data = await response.json();

      if (response.ok) {
        setBook(data);
      } else {
        toast.error("Failed to load book details");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBorrowHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/history/books/${bookId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBorrowHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history");
    }
  };

  const checkUserBorrowStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/history/users/${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        const activeBorrows = data.filter(
          (h: BorrowHistory) => h.status === "active"
        );
        setUserBorrowCount(activeBorrows.length);

        const hasBorrowedThisBook = activeBorrows.some(
          (h: any) => h.bookId === bookId
        );
        setUserHasBorrowed(hasBorrowedThisBook);
      }
    } catch (error) {
      console.error("Failed to check borrow status");
    }
  };

  const handleBorrowSuccess = () => {
    fetchBookDetails();
    fetchBorrowHistory();
    checkUserBorrowStatus();
  };

  const handleReturnSuccess = () => {
    fetchBookDetails();
    fetchBorrowHistory();
    checkUserBorrowStatus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-xl text-gray-500">Book not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const canBorrow =
    book.availableCopies > 0 && userBorrowCount < 5 && !userHasBorrowed;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="size-4" />
          Back to Books
        </Button>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="size-24 text-gray-400" />
                )}
              </div>
            </Card>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{book.author}</p>

              <div className="flex gap-3 mb-4">
                <Badge>{book.category}</Badge>
                <Badge
                  variant={book.availableCopies > 0 ? "default" : "secondary"}
                >
                  {book.availableCopies > 0 ? "Available" : "Unavailable"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ISBN:</span>
                  <p>{book.isbn}</p>
                </div>
                <div>
                  <span className="text-gray-600">Available Copies:</span>
                  <p>
                    {book.availableCopies} of {book.totalCopies}
                  </p>
                </div>
              </div>
            </div>

            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{book.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {userHasBorrowed ? (
                <Button
                  onClick={() => setShowReturnModal(true)}
                  variant="outline"
                  className="gap-2"
                >
                  Return Book
                </Button>
              ) : (
                <Button
                  onClick={() => setShowBorrowModal(true)}
                  disabled={!canBorrow}
                  className="gap-2"
                >
                  {book.availableCopies === 0
                    ? "Unavailable"
                    : userBorrowCount >= 5
                      ? "Borrow Limit Reached"
                      : "Borrow Book"}
                </Button>
              )}

              {userBorrowCount >= 5 && !userHasBorrowed && (
                <p className="text-sm text-red-600 flex items-center">
                  You've reached the maximum of 5 active borrows
                </p>
              )}
            </div>

            {/* Tabs for History */}
            {user.role === "admin" && (
              <Tabs defaultValue="history" className="w-full">
                <TabsList>
                  <TabsTrigger value="history">Borrow History</TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                  <Card>
                    <CardContent className="pt-6">
                      {borrowHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No borrow history
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {borrowHistory.map((record) => (
                            <div
                              key={record.id}
                              className="flex justify-between items-center border-b pb-3 last:border-0"
                            >
                              <div>
                                <p>{record.username}</p>
                                <p className="text-sm text-gray-600">
                                  Borrowed:{" "}
                                  {new Date(
                                    record.borrowDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  record.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {record.status === "active"
                                  ? "Active"
                                  : `Returned ${new Date(record.returnDate!).toLocaleDateString()}`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BorrowModal
        open={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        book={book}
        userId={user.id}
        onSuccess={handleBorrowSuccess}
      />

      <ReturnModal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        book={book}
        userId={user.id}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
}
