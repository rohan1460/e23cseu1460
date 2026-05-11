# Notification Center Platform

A modern, priority-aware notification ecosystem designed for high-stakes campus recruitment environments. This repository implements a full-stack solution including a centralized logging audit trail, an optimized ranking backend, and a high-fidelity dark-mode frontend.

## 🚀 Features

-   **Priority Ranking Algorithm**: Implements a custom Min-Heap based scoring system to ensure critical placement updates surface first.
-   **Reusable Logging Middleware**: A standalone TypeScript package providing cross-stack audit trails with validation and caching.
-   **Modern Dark UI**: Built with React, Vite, and Material UI, featuring a sleek, responsive design with interactive states.
-   **Optimized Performance**: Backend implements efficient upstream token caching and $O(K \log N)$ ranking.

## 📁 Repository Structure

-   [`logging_middleware/`](file:///Users/rohansharma/Desktop/E23CSEU1460/logging_middleware) - TypeScript logging package with authentication caching.
-   [`notification_app_be/`](file:///Users/rohansharma/Desktop/E23CSEU1460/notification_app_be) - Express.js backend implementing the ranking service.
-   [`notification_app_fe/`](file:///Users/rohansharma/Desktop/E23CSEU1460/notification_app_fe) - React/Vite frontend with Material UI integration.
-   [`notification_system_design.md`](file:///Users/rohansharma/Desktop/E23CSEU1460/notification_system_design.md) - Comprehensive technical documentation for Stages 1-6.

## 🛠️ Setup & Execution

### 1. Logging Middleware
```bash
cd logging_middleware
npm install
npm run build
```

### 2. Backend Service
Configure `.env` using `.env.example`, then:
```bash
cd notification_app_be
npm install
npm run dev
```

### 3. Frontend Application
```bash
cd notification_app_fe
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

## 📈 Technical Highlights
- **Stack**: TypeScript, Node.js, Express, React, MUI.
- **Algorithm**: Custom Min-Heap for Top-N selection.
- **Design**: Dark-mode aesthetic with 12px blur AppBar and motion-enabled cards.
