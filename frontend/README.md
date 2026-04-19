# FinanceHub Modern Frontend

A premium, modern fintech interface built with React, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Existing FinanceHub Backend running on `http://localhost:8080`

### Installation

1. Navigate to the `frontend-modern` directory:
   ```bash
   cd frontend-modern
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## 🛠 Tech Stack

- **React + Vite**: Fast development and build process.
- **TypeScript**: Type safety and better developer experience.
- **Tailwind CSS**: Premium utility-first styling.
- **Lucide React**: Beautiful icons.
- **Axios**: API communication with the backend.
- **React Router**: Client-side routing.
- **React Hot Toast**: Beautiful notifications.

## 📁 Project Structure

- `src/components`: Reusable UI components (Sidebar, Layout, Input, Button, etc.)
- `src/context`: Authentication and global state management.
- `src/services`: API client configuration.
- `src/pages`: Individual page views (Dashboard, Login, Transactions, etc.)

## 🔒 Security Features

- JWT-ready authentication flow (using localStorage as requested).
- Role-based navigation (Admin/Employee vs User).
- Protected routes for secure pages.
- Secure password reset flow.

---
*Developed for FinanceHub Modernization*
