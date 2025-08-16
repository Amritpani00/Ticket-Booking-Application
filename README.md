# Ticket Booking Application

Full-stack app with Spring Boot (Java 21), React + Vite (TypeScript), MySQL, and Razorpay integration.

## Features
- Search events
- View/select seats
- Book tickets
- Pay with Razorpay (mocked by default; toggle real API via env)

## Prerequisites
- Java 21, Maven 3.9+
- Node 18+ (Node 22 tested), npm
- Docker (optional, for containerized run)

## Backend (Spring Boot)

Environment variables (defaults set in `application.yml`):
- `DB_URL` (default: `jdbc:mysql://localhost:3306/ticketdb?...`)
- `DB_USERNAME` (default: `root`)
- `DB_PASSWORD` (default: `password`)
- `RAZORPAY_ENABLED` (default: `false` for mock)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (required when `RAZORPAY_ENABLED=true`)

Run tests and app:
```bash
cd ticket-booking-backend
mvn test
mvn spring-boot:run
```
API base: `http://localhost:8080`
- `GET /api/events?q=rock`
- `GET /api/events/{eventId}/seats`
- `POST /api/bookings` body: `{ eventId, seatIds, customerName, customerEmail, customerPhone }`
- `POST /api/bookings/verify` body: `{ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`

## Frontend (React + Vite)

Set API base if needed:
- `VITE_API_BASE` (default: `http://localhost:8080`)

Run dev server:
```bash
cd frontend
npm install
npm run dev
```
Run tests and build:
```bash
npm test
npm run build
```

## Docker Compose
Build and run MySQL, backend, frontend:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306` (root/password)

## Notes
- On first backend start, a sample event and seats are seeded.
- Payments are mocked by default (`RAZORPAY_ENABLED=false`). Set to `true` and supply API keys to use live Razorpay.
