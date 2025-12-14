import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, LogOut, Book, Search, Filter } from "lucide-react";
import { AdminPanel } from "./AdminPanel";
import Auth from "./Auth";
import ThemeToggle from './ThemeToggle';
import "./admin.css";

const API = "http://localhost:3000/api";

export default function App() {
  const [page, setPage] = useState("auth");
  const [authPage, setAuthPage] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Auth state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Books state
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [myBorrows, setMyBorrows] = useState([]);

  // Wrap functions with useCallback to fix dependencies
  const fetchBooks = useCallback(async () => {
    try {
      let url = `${API}/books`;
      if (searchQuery) {
        url = `${API}/books/search?q=${searchQuery}`;
      } else if (filterCategory) {
        url = `${API}/books/filter?category=${filterCategory}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.data.books) {
        setBooks(data.data.books);
      } else {
        setBooks(data.data || []);
      }

      const allBooks = data.data.books || data.data || [];
      const cats = [...new Set(allBooks.map((b) => b.category))];
      setCategories(cats);
    } catch (err) {
      setMessage("Error loading books");
    }
  }, [searchQuery, filterCategory]);

  const fetchMyBorrows = useCallback(async () => {
    if (!user) return;
    try {
      console.log("Fetching borrows for user:", user.id);
      const res = await fetch(`${API}/history/users/${user.id}`, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Borrows response status:", res.status);
      const data = await res.json();
      console.log("Borrows data:", data);
      console.log("Total history records:", data.data?.history?.length);

      if (data.data?.history) {
        const active = data.data.history.filter((h) => !h.returned);
        console.log("Active borrows (not returned):", active);
        console.log("Active borrows count:", active.length);

        // Check if any are marked as returned
        const returned = data.data.history.filter((h) => h.returned);
        console.log("Returned books:", returned);

        setMyBorrows(active);
      } else {
        console.log("No history found");
        setMyBorrows([]);
      }
    } catch (err) {
      console.error("Error fetching borrows:", err);
      setMyBorrows([]);
    }
  }, [user]);

  useEffect(() => {
    if (page === "books") {
      fetchBooks();
    }
  }, [page, fetchBooks]);

  useEffect(() => {
    if (user) {
      fetchMyBorrows();
    }
  }, [user, fetchMyBorrows]);

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setMessage("Email and password required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.data);
        // Check if admin or member
        if (data.data.role === "admin") {
          setPage("admin");
        } else {
          setPage("books");
        }
        setLoginData({ email: "", password: "" });
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      setMessage("All fields required");
      return;
    }
    if (registerData.password !== registerData.confirm) {
      setMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please login.");
        setAuthPage("login");
        setRegisterData({ name: "", email: "", password: "", confirm: "" });
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    console.log("Attempting to borrow book:", bookId, "for user:", user.id);
    try {
      const res = await fetch(`${API}/borrow/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      console.log("Borrow response:", data);

      if (res.ok) {
        setMessage("Book borrowed successfully!");
        fetchBooks();
        fetchMyBorrows();
      } else {
        // Show the actual error message from backend
        const errorMsg = data.message || data.error || "Failed to borrow";
        setMessage(errorMsg);
        console.error("Borrow failed:", data);
      }
    } catch (err) {
      console.error("Borrow error:", err);
      setMessage("Error borrowing book");
    }
  };

  const handleReturn = async (bookId) => {
    console.log("Attempting to return book:", bookId, "for user:", user.id);
    try {
      const res = await fetch(`${API}/books/${bookId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      console.log("Return response:", data);

      if (res.ok) {
        setMessage("Book returned successfully!");
        fetchBooks();
        fetchMyBorrows();
      } else {
        setMessage(data.message || "Failed to return");
        console.error("Return failed:", data);
      }
    } catch (err) {
      console.error("Return error:", err);
      setMessage("Error returning book");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage("auth");
    setAuthPage("login");
    setBooks([]);
    setMyBorrows([]);
  };

  // ADMIN PAGE
  if (page === "admin" && user) {
    return <AdminPanel user={user} onLogout={handleLogout} />;
  }

  // AUTH PAGE
  if (page === "auth") {
    return (
      <Auth
        authPage={authPage}
        setAuthPage={setAuthPage}
        loginData={loginData}
        setLoginData={setLoginData}
        registerData={registerData}
        setRegisterData={setRegisterData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        loading={loading}
        message={message}
      />
    );
  
  }

  
  // MEMBER BOOKS PAGE

  // MEMBER BOOKS PAGE
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="logo-brand">
              <span className="logo-text">Yalla<span className="logo-accent">Library</span></span>
              <Book size={24} className="logo-svg" aria-hidden />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="admin-user">
              <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="admin-info">
                <div className="admin-name">Welcome, <strong>{user.name}</strong></div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">↪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="bg-green-100 text-green-700 p-4 m-4 rounded">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {myBorrows.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              📚 My Active Borrows ({myBorrows.length}/5)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBorrows.map((borrow) => {
                console.log("Rendering borrow:", borrow);
                return (
                  <div
                    key={borrow.bookId}
                    className="bg-white p-4 rounded-lg border border-blue-200"
                  >
                    <h3 className="font-bold text-gray-900">{borrow.title}</h3>
                    <p className="text-gray-600 text-sm">{borrow.author}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {borrow.dueDate}
                    </p>
                    <button
                      onClick={() => handleReturn(borrow.bookId)}
                      className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Return Book
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📖 Browse Books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const isBorrowed = myBorrows.some((b) => b.bookId === book.id);
              return (
                <div
                  key={book.id}
                  className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-1">{book.author}</p>
                  <p className="text-xs text-gray-500 mb-3">{book.category}</p>
                  <p className="text-sm text-gray-400 mb-4">
                    ISBN: {book.isbn}
                  </p>

                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={
                      !book.available || isBorrowed || myBorrows.length >= 5
                    }
                    className={`w-full py-2 rounded text-sm font-semibold transition ${
                      !book.available || isBorrowed || myBorrows.length >= 5
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {!book.available
                      ? "Unavailable"
                      : isBorrowed
                        ? "Already Borrowed"
                        : myBorrows.length >= 5
                          ? "Max Limit Reached"
                          : "Borrow"}
                  </button>
                </div>
              );
            })}
          </div>

          {books.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No books found. Try adjusting your search or filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
