# Library Management System – RESTful API

A complete **Library Management System Backend** built with **Node.js + Express** using JSON files as storage.  
No database required – perfect for learning or small-scale projects.

Live: `http://localhost:3000` (when running locally)  
Author: Abdelrahman Ashraf  
Tech Stack: Node.js, Express.js

---

### Features

| Feature                                | Status |
| -------------------------------------- | ------ |
| User Registration & Login              | Done   |
| Role-based Access (Admin / Member)     | Done   |
| Add / Edit / Delete Books (Admin)      | Done   |
| Borrow & Return Books                  | Done   |
| Max 5 active borrows per user          | Done   |
| Search & Filter Books                  | Done   |
| User & Book Borrowing History          | Done   |
| Export Books & History as CSV          | Done   |
| Full input validation & error handling | Done   |

---

### API Endpoints

#### Public Routes

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| POST   | `/api/users/register`            | Register new user      |
| POST   | `/api/users/login`               | Login (simple check)   |
| GET    | `/api/books`                     | Get all books          |
| GET    | `/api/books/search?q=keyword`    | Search by title/author |
| GET    | `/api/books/filter?category=...` | Filter by category     |
| GET    | `/api/books/:id`                 | Get single book        |

#### Authenticated Routes (send user `id` in body)

| Method | Endpoint                     | Body Example  | Description                     |
| ------ | ---------------------------- | ------------- | ------------------------------- |
| POST   | `/api/borrow/:bookId`        | `{ "id": 2 }` | Borrow a book                   |
| POST   | `/api/books/:bookId/return`  | `{ "id": 2 }` | Return a book                   |
| GET    | `/api/history/users/:userId` | `{ "id": 2 }` | View own or any history (admin) |

#### Admin Only Routes

| Method | Endpoint                     | Body Example                                                                | Description              |
| ------ | ---------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| POST   | `/api/books`                 | `{ "id":1, "title":"...", "author":"...", "category":"...", "isbn":"..." }` | Add book                 |
| PATCH  | `/api/books/:id`             | `{ "id":1, "title":"New Title" }`                                           | Edit book                |
| DELETE | `/api/books/:id`             | `{ "id": 1 }`                                                               | Delete book              |
| GET    | `/api/books/export/books`    | `{ "id": 1 }`                                                               | Download books.csv       |
| GET    | `/api/books/export/history`  | `{ "id": 1 }`                                                               | Download history.csv     |
| GET    | `/api/history/books/:bookId` | `{ "id": 1 }`                                                               | View book borrow history |

> **Authentication**: Send your user `id` in the request body.  
> First registered user → manually change `"role": "member"` → `"role": "admin"` in `dev-data/users.json`

---

### How to Run

```bash
git clone https://github.com/abd66lrahman/lms-project.git
cd lms-project
npm install
npm run dev
```
