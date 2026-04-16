# UserVault — Node.js + MongoDB User Management System

A full-stack User Management System built with **Node.js**, **Express**, **Mongoose**, and **MongoDB**, featuring a polished frontend UI and comprehensive index testing.

---

## 📁 Project Structure

```
user-management/
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   └── User.js             # Mongoose schema + all 6 indexes
├── routes/
│   └── users.js            # RESTful API routes
├── public/
│   └── index.html          # Frontend UI (served statically)
├── server.js               # Express app entry point
├── index-test.js           # Index testing with explain()
├── .env.example            # Environment variable template
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally on port `27017` (or a MongoDB Atlas URI)

### 2. Install Dependencies
```bash
cd user-management
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI if different
```

**.env contents:**
```env
MONGODB_URI=mongodb://localhost:27017/userManagementDB
PORT=5000
```

### 4. Start the Server
```bash
npm start          # Production
npm run dev        # Development (with nodemon auto-reload)
```

### 5. Open the App
Visit: **http://localhost:5000**

---

## 🗄️ MongoDB Schema (Mongoose)

```js
{
  name:      String    // required, minLength: 3
  email:     String    // required, unique, valid email
  age:       Number    // min: 0, max: 120
  hobbies:   [String]  // array (multikey index)
  bio:       String    // text search index
  userId:    String    // unique, auto UUID (hashed index)
  createdAt: Date      // default: now (TTL index)
}
```

### Indexes Created:
| Index Type     | Field(s)          | Purpose                            |
|----------------|-------------------|------------------------------------|
| Single Field   | `name`            | Fast name lookups                  |
| Compound       | `email + age`     | Combined email/age queries         |
| Multikey       | `hobbies`         | Array element queries              |
| Text           | `bio`             | Full-text search                   |
| Hashed         | `userId`          | Sharding-ready unique ID lookups   |
| TTL            | `createdAt`       | Auto-expire docs after 1 year      |

---

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api/users`

### Create User
```
POST /api/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "hobbies": ["coding", "reading"],
  "bio": "Software engineer passionate about open-source"
}
```

### Get All Users (with filtering, sorting, pagination)
```
GET /api/users
GET /api/users?name=alice
GET /api/users?email=alice&age=28
GET /api/users?hobby=coding
GET /api/users?minAge=20&maxAge=40
GET /api/users?sortBy=name&order=asc
GET /api/users?page=2&limit=5
```

### Get Single User
```
GET /api/users/:id
```

### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Alice Smith",
  "age": 29
}
```

### Delete User
```
DELETE /api/users/:id
```

### Text Search on Bio
```
GET /api/users/search/bio?q=engineer
```

### Search by Hobbies
```
GET /api/users/search/hobbies?hobbies=coding,reading
```

### Health Check
```
GET /api/health
```

---

## 🧪 Index Testing

Run the index test script:
```bash
npm run test-indexes
# or
node index-test.js
```

This script:
1. Connects to MongoDB
2. Inserts 8 sample users
3. Runs `.explain("executionStats")` on each index type
4. Prints: **stage used**, **keys examined**, **docs examined**, **execution time**, **index name**
5. Lists all indexes on the collection

### Sample Output:
```
────────────────────────────────────────────────────────────
🔍  Single Field Index — name: 'Alice Johnson'
────────────────────────────────────────────────────────────
  Stage used        : IXSCAN
  Keys examined     : 1
  Documents examined: 1
  Docs returned     : 1
  Execution time    : 0 ms
  Index used        : name_1
```

---

## 🧪 Postman Testing Guide

Import these requests into Postman:

| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| POST   | `/api/users`                    | Create user         |
| GET    | `/api/users`                    | Get all users       |
| GET    | `/api/users/:id`                | Get single user     |
| PUT    | `/api/users/:id`                | Update user         |
| DELETE | `/api/users/:id`                | Delete user         |
| GET    | `/api/users?name=alice`         | Search by name      |
| GET    | `/api/users?hobby=coding`       | Filter by hobby     |
| GET    | `/api/users?minAge=20&maxAge=40`| Filter by age range |
| GET    | `/api/users/search/bio?q=dev`   | Text search on bio  |
| GET    | `/api/users/search/hobbies?hobbies=coding,yoga` | Hobby search |

---

## 🖥️ Frontend Features

- **Add User Form** — with validation feedback
- **User Table** — paginated with 8 users per page
- **Search & Filter** — name, email, age range, hobby (live search)
- **Sort** — by date, name, or age
- **Edit Modal** — update any field inline
- **Delete** — with confirmation prompt
- **Toast Notifications** — success/error/info feedback
- **Responsive** — works on mobile and desktop

---

## 📦 Dependencies

```json
{
  "express":  "^4.18.3",   // Web framework
  "mongoose": "^8.2.4",    // MongoDB ODM + schema validation
  "dotenv":   "^16.4.5",   // Environment variables
  "cors":     "^2.8.5",    // Cross-origin requests
  "uuid":     "^9.0.1"     // Auto-generate userId
}
```
