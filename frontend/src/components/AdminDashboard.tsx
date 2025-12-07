import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  BookOpen,
  BookMarked,
  AlertCircle,
  Download,
  Library,
} from "lucide-react";
import { toast } from 'sonner';
import type { User, Page } from "../App";

type AdminDashboardProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
};

type Stats = {
  totalBooks: number;
  activeBorrows: number;
  overdueBorrows: number;
  totalUsers: number;
};

export function AdminDashboard({
  user,
  onLogout,
  onNavigate,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch books
      const booksResponse = await fetch("http://localhost:3000/api/books");
      const books = await booksResponse.json();

      // Fetch all history to calculate stats
      const historyResponse = await fetch(
        `http://localhost:3000/api/history/users/${user.id}`
      );
      let activeBorrows = 0;
      let overdueBorrows = 0;

      if (historyResponse.ok) {
        const history = await historyResponse.json();
        activeBorrows = history.filter(
          (h: any) => h.status === "active"
        ).length;

        // Calculate overdue (14 days past borrow date)
        history.forEach((h: any) => {
          if (h.status === "active") {
            const dueDate = new Date(h.borrowDate);
            dueDate.setDate(dueDate.getDate() + 14);
            if (dueDate < new Date()) {
              overdueBorrows++;
            }
          }
        });
      }

      setStats({
        totalBooks: books.length,
        activeBorrows,
        overdueBorrows,
        totalUsers: 0, // Would need a users endpoint
      });
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: "books" | "history") => {
    setIsExporting(type);
    try {
      const endpoint =
        type === "books"
          ? "http://localhost:3000/api/books/export/books"
          : "http://localhost:3000/api/books/export/history";
      const response = await fetch(endpoint);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(
          `${type === "books" ? "Books" : "History"} exported successfully`
        );
      } else {
        toast.error("Export failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsExporting(null);
    }
  };

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Active Borrows",
      value: stats.activeBorrows,
      icon: BookMarked,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Overdue Borrows",
      value: stats.overdueBorrows,
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Manage Books",
      value: "→",
      icon: Library,
      color: "from-green-500 to-emerald-500",
      onClick: () => onNavigate("manage-books"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.username}! Here's your library overview.
          </p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const CardWrapper = stat.onClick ? "button" : "div";

              return (
                <CardWrapper
                  key={index}
                  onClick={stat.onClick}
                  className={
                    stat.onClick
                      ? "text-left w-full hover:shadow-lg transition-shadow"
                      : ""
                  }
                >
                  <Card className="overflow-hidden h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                        >
                          <Icon className="size-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-3xl">{stat.value}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{stat.title}</p>
                    </CardContent>
                  </Card>
                </CardWrapper>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => onNavigate("manage-books")}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Library className="size-5" />
                Manage Books (Add, Edit, Delete)
              </Button>
              <Button
                onClick={() => onNavigate("home")}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <BookOpen className="size-5" />
                Browse Library
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleExport("books")}
                className="w-full justify-start gap-3"
                variant="outline"
                disabled={isExporting === "books"}
              >
                <Download className="size-5" />
                {isExporting === "books"
                  ? "Exporting..."
                  : "Export Books (CSV)"}
              </Button>
              <Button
                onClick={() => handleExport("history")}
                className="w-full justify-start gap-3"
                variant="outline"
                disabled={isExporting === "history"}
              >
                <Download className="size-5" />
                {isExporting === "history"
                  ? "Exporting..."
                  : "Export Borrow History (CSV)"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
