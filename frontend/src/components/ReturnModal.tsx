import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from 'sonner';
import type { Book } from "./HomePage";

type ReturnModalProps = {
  open: boolean;
  onClose: () => void;
  book: Book;
  userId: string;
  onSuccess: () => void;
};

export function ReturnModal({
  open,
  onClose,
  book,
  userId,
  onSuccess,
}: ReturnModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/books/${book.id}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Book returned successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Failed to return book");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Return</DialogTitle>
          <DialogDescription>
            Are you sure you want to return this book?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-600">Book Title:</p>
            <p>{book.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Author:</p>
            <p>{book.author}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
