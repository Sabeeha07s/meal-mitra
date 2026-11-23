# Meal Mitra – Food Donation Platform

A full-stack starter implementation of a food donation platform connecting donors, requesters and NGOs. It demonstrates a React frontend, Express REST API, MongoDB persistence, JWT authentication, role-based access, optional Gemini chatbot support and Google Maps link integration.

## Features
- Register and sign in with JWT authentication
- Roles: `DONOR`, `REQUESTER`, `NGO`
- Create, browse and claim food donation listings
- Role-protected API endpoints
- MongoDB/Mongoose data persistence
- Optional Gemini-powered chatbot endpoint
- Map links for pickup locations (no Google Maps key required for basic links)

## Tech stack
React, Vite, JavaScript, Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs.

## Run locally
### 1. Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas connection string

### 2. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Set `MONGO_URI` and a long random `JWT_SECRET` in `server/.env`.

### 3. Frontend
In a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL printed in the terminal.

## Environment variables
See `server/.env.example` and `client/.env.example`. Never commit real secrets or `.env` files.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/donations` (public listing)
- `POST /api/donations` (DONOR or NGO)
- `PATCH /api/donations/:id/claim` (REQUESTER or NGO)
- `GET /api/donations/mine` (authenticated)
- `POST /api/chat` (optional Gemini integration)

## Suggested future improvements
Add email/OTP verification, image uploads, moderation, notifications, audit logs, automated tests, pagination and deployment configuration.

## GitHub upload
Create a public repository named `meal-mitra` and push this folder. Keep `.env` files private.
