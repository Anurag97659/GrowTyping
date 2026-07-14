# GrowTyping

GrowTyping is a full-stack typing practice application for improving typing speed, accuracy, and key-level consistency. It combines timed exercises with saved performance analytics, replayable tests, and a responsive dashboard.
### **Live Demo:** [GrowTyping Demo](https://growtyping-1.onrender.com/) || **Demo username and password = Avasanam && 123456789**

## Features

- Timed typing tests: 15 seconds, 30 seconds, 60 seconds, and custom tests.
- Text modes: Normal, Punctuation, Numbers, Symbols, and All.
- Live WPM and accuracy feedback while typing.
- Per-key mistake tracking with a keyboard heatmap and weak-key analysis.
- Replay a saved test using its original passage and duration.
- Dashboard charts for WPM, accuracy, daily progress, history, streaks, and best records.
- History pagination with a Load More action.
- User accounts, email verification, profile management, and password reset.
- Follow users and view public typing profiles.
- Dashboard light/current theme switch and persisted typing-page themes.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT-based API authentication |
| Email | Nodemailer |


## Local Setup

### Prerequisites

- Node.js 20 or later
- MongoDB database or MongoDB Atlas connection string

### 1. Configure and run the backend

```bash
cd Backend
npm install 
```

Create `Backend/.env` with the required values:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=GrowTyping
ACCESS_TOKEN_SECRET=replace_with_a_secure_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace_with_a_secure_secret
REFRESH_TOKEN_EXPIRY=8d
FRONTEND_URL=http://localhost:5173 
SMTP_HOST= enter_smtp_host
SMTP_PORT= enter_port_number
SMTP_SECURE=false
SMTP_USER= xyz
SMTP_PASS= your_app_password
MAIL_FROM= xyz
```

Add SMTP variables only when email verification and password reset emails are required. Then start the API:

```bash
npm run dev
```

### 2. Configure and run the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_REACT_APP_API=http://localhost:8000/
```

Start the standard client:

```bash
npm run dev:5173
```

To run two accounts independently during local development, start a second client in another terminal:

```bash
npm run dev:5174
```

Open `http://localhost:5173` or `http://localhost:5174` in your browser.

## Available Scripts

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on its default port |
| `npm run dev:5173` | Start the first local frontend instance |
| `npm run dev:5174` | Start the second local frontend instance |
| `npm run build` | Create a production build |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |

## Usage

1. Create and verify an account, then sign in.
2. Choose a test duration and text mode on the typing page.
3. Start typing to begin the timer and record live metrics.
4. Review the dashboard for trend charts, keyboard heatmap, weak keys, and history.
5. Use Replay from typing history to retake a saved test.

## Security Notes

- Do not commit `.env` files, database connection strings, SMTP credentials, or JWT secrets.
- Use strong secrets and secure HTTPS settings for production deployments.
