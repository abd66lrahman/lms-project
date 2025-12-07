import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { ReturnModal } from "./ReturnModal";
import { AlertCircle, BookMarked } from "lucide-react";
import { toast } from "sonner";
import type { User, Page } from "../App";
import type { Book } from "./HomePage";

type MyBorrowsPageProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page, bookId?: string) => void;
};

type BorrowRecord = {
  id: string;
  bookId: string;
  borrowDate: string;
  returnDate?: string;
  status: "active" | "returned";
};

type EnrichedBorrowRecord = BorrowRecord & {
  bookTitle?: string;
  bookAuthor?: string;
  dueDate?: string;
};

export function MyBorrowsPage({
  user,
  onLogout,
  onNavigate,
}: MyBorrowsPageProps) {
  const [borrowHistory, setBorrowHistory] = useState<EnrichedBorrowRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    fetchBorrowHistory();
  }, []);

  const fetchBorrowHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/history/users/${user.id}`
      );
      if (response.ok) {
        const data: BorrowRecord[] = await response.json();

        // Fetch book details for each borrow record
        const enrichedData = await Promise.all(
          data.map(async (record) => {
            try {
              const bookResponse = await fetch(
                `http://localhost:3000/api/books/${record.bookId}`
              );
              if (bookResponse.ok) {
                const book = await bookResponse.json();
                const dueDate = new Date(record.borrowDate);
                dueDate.setDate(dueDate.getDate() + 14);

                return {
                  ...record,
                  bookTitle: book.title,
                  bookAuthor: book.author,
                  dueDate: dueDate.toISOString(),
                };
              }
            } catch (error) {
              console.error("Failed to fetch book details");
            }
            return {
              ...record,
              bookTitle: "Unknown",
              bookAuthor: "Unknown",
            };
          })
        );

        setBorrowHistory(enrichedData);
      } else {
        toast.error("Failed to load borrow history");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnClick = async (record: BorrowRecord) => {
    // Fetch book details for the modal
    try {
      const response = await fetch(
        `http://localhost:3000/api/books/${record.bookId}`
      );
      if (response.ok) {
        const book = await response.json();
        setSelectedBook(book);
        setShowReturnModal(true);
      }
    } catch (error) {
      toast.error("Failed to load book details");
    }
  };

  const handleReturnSuccess = () => {
    fetchBorrowHistory();
    setSelectedBook(null);
  };

  const activeBorrows = borrowHistory.filter((b) => b.status === "active");
  const returnedBorrows = borrowHistory.filter((b) => b.status === "returned");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Borrows</h1>
          <p className="text-gray-600">Manage your borrowed books</p>
        </div>

        {/* Warning if nearing limit */}
        {activeBorrows.length >= 4 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="size-5 text-orange-600" />
              <div>
                <p className="text-orange-900">
                  You have {activeBorrows.length} active borrow(s).
                  {activeBorrows.length >= 5
                    ? " You've reached the maximum limit of 5 borrows."
                    : ` You can borrow ${5 - activeBorrows.length} more book(s).`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : borrowHistory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookMarked className="size-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500 mb-2">No borrows yet</p>
              <p className="text-gray-400 mb-6">Browse books to get started!</p>
              <Button onClick={() => onNavigate("home")}>Browse Books</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                Active Borrows ({activeBorrows.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History ({returnedBorrows.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Borrows</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeBorrows.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No active borrows
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Borrow Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeBorrows.map((record) => {
                          const dueDate = record.dueDate
                            ? new Date(record.dueDate)
                            : new Date();
                          const isOverdue = dueDate < new Date();

                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <button
                                  onClick={() =>
                                    onNavigate("book-details", record.bookId)
                                  }
                                  className="hover:underline text-purple-600"
                                >
                                  {record.bookTitle}
                                </button>
                              </TableCell>
                              <TableCell>{record.bookAuthor}</TableCell>
                              <TableCell>
                                {new Date(
                                  record.borrowDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell
                                className={isOverdue ? "text-red-600" : ""}
                              >
                                {dueDate.toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    isOverdue ? "destructive" : "default"
                                  }
                                >
                                  {isOverdue ? "Overdue" : "Active"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturnClick(record)}
                                >
                                  Return
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Borrow History</CardTitle>
                </CardHeader>
                <CardContent>
                  {returnedBorrows.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No history yet
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Borrowed</TableHead>
                          <TableHead>Returned</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnedBorrows.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <button
                                onClick={() =>
                                  onNavigate("book-details", record.bookId)
                                }
                                className="hover:underline text-purple-600"
                              >
                                {record.bookTitle}
                              </button>
                            </TableCell>
                            <TableCell>{record.bookAuthor}</TableCell>
                            <TableCell>
                              {new Date(record.borrowDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {record.returnDate
                                ? new Date(
                                    record.returnDate
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Return Modal */}
      {selectedBook && (
        <ReturnModal
          open={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          userId={user.id}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
