import express from "express";
import { borrowBook } from "./../controllers/borrowController.js";
import { restrictTo } from "./../middleware/auth.js";

const Router = express.Router();

// Borrow book - Members and Admins can borrow
Router.route("/:id").post(
  restrictTo("admin", "member"), // ✅ Added authentication
  borrowBook
);

export default Router;
