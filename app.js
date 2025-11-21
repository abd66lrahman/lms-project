import express from "express";
import morgan from "morgan";
import bookRouter from "./routes/booksRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import borrowRouter from "./routes/borrowRoutes.js";
import historyRouter from "./routes/historyRoutes.js";

export const app = express();


app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", usersRouter); // User routes
app.use("/api/books", bookRouter); // Book routes
app.use("/api/borrow", borrowRouter); // Changed from /api/books
app.use("/api/history", historyRouter); // History routes

export default app;
