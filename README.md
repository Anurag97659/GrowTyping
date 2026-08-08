# GrowTyping

GrowTyping is a full-stack typing practice platform designed to improve typing speed, accuracy, and key-level consistency. What sets GrowTyping apart is its **per-key performance analysis**: it tracks every keystroke error, generates an interactive visual keyboard heatmap, and pinpoints your **Top 5 Weak Keys** so you can focus practice where it matters most. It also features **Real-Time Multiplayer Races**, customizable timed exercises, performance analytics, replayable tests, friend stats, global leaderboards, high-performance Redis caching, and custom theme engines.

### Live Demo
[GrowTyping Demo](https://growtyping-1.onrender.com/)  
**Demo Credentials:** Username: `Avasanam` | Password: `123456789`

---

## Features

- **Real-Time Multiplayer Race Mode**: Create or join typing race rooms with 6-character room codes. Host controls race duration, text mode (Words, Punctuation, Numbers, Symbols, All), and participant management via a resizable settings sidebar. Send instant in-app race invitations to online friends with global toast notifications, race with live WPM and progress bars, and view real-time final leaderboards.
- **Typing Engine**: Timed tests (15s, 30s, 60s, custom), text modes (Normal, Punctuation, Numbers, Symbols), live WPM/accuracy tracking, smooth caret positioning, and test replay.
- **Key Analysis & Heatmap (Unique Feature)**: Deep key-level mistake tracking that pinpoints your **Top 5 Weak Keys** and visualizes keystroke accuracy with an interactive **Keyboard Heatmap**.
-  **Authentication & Security**: JWT-based auth (Access & Refresh tokens), email verification, password reset, and **Google OAuth 2.0** single sign-on.
- **Social & Leaderboards**: Global leaderboards, public user profiles, user follow system, and friend stats comparison.
-  **Analytics & Insights**: Interactive charts for WPM/accuracy trends, daily activity, streaks, best records, and paginated test history.
- **Performance & Themes**: High-performance Redis caching with automatic database fallback, plus instant persistent theme switching.

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, Axios, Chart.js, Socket.io-client |
| **Backend** | Node.js, Express.js |
| **Real-time Engine** | Socket.IO (WebSockets with fallback polling) |
| **Database** | MongoDB with Mongoose ORM |
| **Caching** | Redis (`ioredis`) with graceful MongoDB fallback |
| **Authentication** | JWT (JSON Web Tokens), Google OAuth 2.0 |
| **Email Service** | Nodemailer (SMTP) |

---

##  Local Setup

### Prerequisites

- **Node.js**: v20 or later
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI
- **Redis Server**: Optional (gracefully falls back to direct database queries if offline)

---

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=GrowTyping
REDIS_URL=redis://127.0.0.1:6379
ACCESS_TOKEN_SECRET=replace_with_a_secure_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace_with_a_secure_secret
REFRESH_TOKEN_EXPIRY=8d
FRONTEND_URL=http://localhost:5173

# Email Settings (Optional for verification & reset)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email
SMTP_PASS=your_app_password
MAIL_FROM=your_email

# Google OAuth Setup (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/GrowTyping/v1/users/oauth/google/callback
```

Start the backend development server:

```bash
npm run dev
```

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env` file:

```env
VITE_REACT_APP_API=http://localhost:8000/
```

Start the frontend development server:

```bash
npm run dev:5173
```

> **Tip:** To test two user accounts concurrently during local development, start a second client instance in another terminal:
> ```bash
> npm run dev:5174
> ```

Open `http://localhost:5173` or `http://localhost:5174` in your browser.

---

## Available Scripts

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on default port |
| `npm run dev:5173` | Start first local frontend client |
| `npm run dev:5174` | Start second local frontend client |
| `npm run build` | Generate production build |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start API server with Nodemon |
| `npm start` | Start API server with Node.js |

---

## Google OAuth Configuration

To enable Google Sign-In:
1. Create OAuth 2.0 Credentials in the [Google Cloud Console](https://console.cloud.google.com/).
2. Add the authorized redirect URI:
   ```text
   http://localhost:8000/GrowTyping/v1/users/oauth/google/callback
   ```
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `Backend/.env`.

---

