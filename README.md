# Assessment Management Application — Backend

A RESTful Node.js/Express backend for creating and managing structured assessments with Categories, Factors, and Questions. Supports JWT-based authentication, assessment building, a launch pad for taking assessments, and a reporting layer to view scored responses.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js                             |
| Framework    | Express 5                           |
| Database     | MongoDB (via Mongoose 8)            |
| Auth         | JSON Web Tokens (jsonwebtoken)      |
| Password     | bcrypt                              |
| Environment  | dotenv                              |
| Validation   | validator                           |
| CORS         | cors                                |

---

## Project Structure

```
backend/
├── index.js                  # Entry point — Express app, DB connection, route registration
├── .env                      # Environment variables (not committed to source control)
├── package.json
├── middleware/
│   └── auth.js               # JWT verification middleware
├── models/
│   ├── User.js               # User schema
│   ├── Assessment.js         # Assessment → Category → Factor → Question schema
│   ├── Response.js           # Submitted response with auto-scoring
│   └── SavedCategory.js      # Reusable category library
└── routes/
    ├── auth.js               # Register, login, profile, password, /me
    ├── assessments.js        # CRUD for assessments
    ├── responses.js          # Submit & retrieve scored responses
    └── categories.js         # Saved category library
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB instance)

### Installation

```bash
git clone <repo-url>
cd backend
npm install
```

### Running the Server

```bash
node index.js
```

## Data Models

### User
| Field      | Type   | Notes              |
|------------|--------|--------------------|
| name       | String | Required           |
| email      | String | Required, unique   |
| password   | String | bcrypt-hashed      |
| createdAt  | Date   | Auto               |

### Assessment
Hierarchical structure: **Assessment → Categories → Factors → Questions**

| Field       | Type     | Notes                        |
|-------------|----------|------------------------------|
| title       | String   | Required                     |
| description | String   |                              |
| passPercent | Number   | Default 60                   |
| createdBy   | ObjectId | Ref: User                    |
| categories  | Array    | Nested Category sub-docs     |
| createdAt   | Date     | Auto                         |

**Question types:** `multiple_choice`, `rating`, `text`, `yes_no`, `scale`

### Response
Stores a user's submission with auto-calculated scores.

| Field           | Type     | Notes                               |
|-----------------|----------|-------------------------------------|
| assessmentId    | ObjectId | Ref: Assessment                     |
| submittedBy     | ObjectId | Ref: User                           |
| answers         | Array    | Per-question result with isCorrect  |
| totalScore      | Number   | Auto-calculated                     |
| maxScore        | Number   | Auto-calculated                     |
| percentage      | Number   | Auto-calculated                     |
| passed          | Boolean  | Based on assessment's passPercent   |
| categoryScores  | Array    | Per-category breakdown              |

**Scoring rules:**
- `multiple_choice` / `yes_no` — exact string match (case-insensitive)
- `rating` — exact numeric match
- `scale` — match within ±1
- `text` — not auto-evaluated (`isCorrect: null`)

### SavedCategory
Reusable category templates a user builds up over time, auto-saved whenever an assessment is created.

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Auth — `/api/auth`

| Method | Endpoint           | Auth | Description                        |
|--------|--------------------|------|------------------------------------|
| POST   | `/register`        | ✗    | Register a new user, returns token |
| POST   | `/login`           | ✗    | Login, returns token               |
| GET    | `/me`              | ✓    | Get the logged-in user's profile   |
| PUT    | `/profile`         | ✓    | Update name / email                |
| PUT    | `/password`        | ✓    | Change password                    |

### Assessments — `/api/assessments`

| Method | Endpoint       | Auth | Description                                      |
|--------|----------------|------|--------------------------------------------------|
| GET    | `/`            | ✓    | List assessments created by the logged-in user   |
| GET    | `/all`         | ✓    | List all assessments (launch pad view)           |
| GET    | `/:id`         | ✓    | Get a single assessment by ID                    |
| POST   | `/create`      | ✓    | Create a new assessment                          |
| PUT    | `/:id`         | ✓    | Update an assessment (owner only)                |
| DELETE | `/:id`         | ✓    | Delete an assessment (owner only)                |

### Responses — `/api/responses`

| Method | Endpoint                  | Auth | Description                              |
|--------|---------------------------|------|------------------------------------------|
| POST   | `/`                       | ✓    | Submit answers; scores are auto-computed |
| GET    | `/`                       | ✓    | List all responses (reports view)        |
| GET    | `/assessment/:id`         | ✓    | Responses for a specific assessment      |
| GET    | `/:id`                    | ✓    | Get a single response by ID              |

### Categories — `/api/categories`

| Method | Endpoint  | Auth | Description                        |
|--------|-----------|------|------------------------------------|
| GET    | `/`       | ✓    | List saved categories for the user |
| POST   | `/`       | ✓    | Save a new category                |
| DELETE | `/:id`    | ✓    | Delete a saved category            |

---

## Authentication Flow

1. User registers via `POST /api/auth/register` → receives a JWT (7-day expiry).
2. All subsequent requests include the token in the `Authorization` header.
3. The `auth` middleware verifies the token and attaches `req.user` to the request.

---

## Notes

- Categories are automatically saved to the reusable library the first time they appear in a new assessment.
- The `GET /api/assessments/` endpoint strips question details (for performance); use `GET /api/assessments/:id` for the full structure.
