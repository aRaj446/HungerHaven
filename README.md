# HungerHaven

A MERN-stack web app to order food online from your personal account. Supports user
authentication, browsing the food catalog, cart management, checkout, and order history.

## Project structure

```
HungerHaven/
├── backend/   Express + MongoDB API (Node.js)
└── frontend/  React app (Create React App)
```

## Getting started

### Backend

```
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in your own values (MongoDB URI, JWT
secret, OpenCage API key). Then start the server:

```
npm run dev    # with nodemon
# or
npm start
```

The API runs on `http://localhost:5000` by default.

### Frontend

```
cd frontend
npm install
npm start
```

The app runs on `http://localhost:3000` by default and expects the backend to be reachable at
the URL configured in `frontend/src/config.js` (defaults to `http://localhost:5000`, override
with the `REACT_APP_API_BASE_URL` environment variable).
