import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { HomePage } from "./components/HomePage";
import { BookDetailsPage } from "./components/BookDetailsPage";
import { MyBorrowsPage } from "./components/MyBorrowsPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { ManageBooksPage } from "./components/ManageBooksPage";
import { Toaster } from "./components/ui/sonner";

export type User = {
  id: string;
  username: string;
  role: "member" | "admin";
};

export type Page =
  | "login"
  | "register"
  | "home"
  | "book-details"
  | "my-borrows"
  | "admin-dashboard"
  | "manage-books";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === "admin") {
      setCurrentPage("admin-dashboard");
    } else {
      setCurrentPage("home");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
  };

  const navigateTo = (page: Page, bookId?: string) => {
    if (bookId) setSelectedBookId(bookId);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => navigateTo("register")}
          />
        );
      case "register":
        return <RegisterPage onNavigateToLogin={() => navigateTo("login")} />;
      case "home":
        return (
          <HomePage
            user={user!}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case "book-details":
        return (
          <BookDetailsPage
            bookId={selectedBookId!}
            user={user!}
            onBack={() => navigateTo("home")}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case "my-borrows":
        return (
          <MyBorrowsPage
            user={user!}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case "admin-dashboard":
        return (
          <AdminDashboard
            user={user!}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      case "manage-books":
        return (
          <ManageBooksPage
            user={user!}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        );
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => navigateTo("register")}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}
