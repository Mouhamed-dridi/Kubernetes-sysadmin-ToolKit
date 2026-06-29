# HR Internship Platform

A React web application for an HR team to manage internship offers and student applications. The app has two main sections: a public side for students to browse and apply for offers, and a protected admin side for the HR team to manage applications.

## 🚀 Features

### Public (Student Side)
*   **Home Page (`/`)**: Landing page with a hero section, features overview, and statistics.
*   **Offers Listing (`/offers`)**: Browse available internships. Includes search functionality (by title or department) and a dropdown filter for departments.
*   **Offer Details & Application (`/offers/:id`)**: View full details of a specific offer (description, requirements, etc.). Includes a comprehensive application form with validation (name, email, phone, university, year of study, cover letter, and PDF CV upload).

### Admin (HR Team Side)
*   **Admin Login (`/admin`)**: Protected login portal. 
    *   **Demo Credentials**: Username: `admin`, Password: `admin123`.
*   **Admin Dashboard (`/admin/dashboard`)**: Protected dashboard showing:
    *   Summary statistics (Total Applications, Available Offers, Most Applied Offer).
    *   Filters to search applications by applicant name/email or filter by specific offers.
    *   Data table listing all applications with sortable columns and pagination.
    *   Actions to **View** (opens a modal with full application details including cover letter) or **Delete** an application.

## 🛠️ Tech Stack
*   **Frontend Framework**: [React](https://react.dev/) (Bootstrapped with [Vite](https://vitejs.dev/))
*   **Routing**: [React Router v6](https://reactrouter.com/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **State & Data Persistence**: Browser `localStorage` (for applications) and `sessionStorage` (for admin authentication). No external backend required.
*   **Typography**: [Inter Font](https://fonts.google.com/specimen/Inter) from Google Fonts.

## 📂 Project Structure

```text
HR-app/
├── index.html              # Entry HTML file
├── package.json            # Project dependencies and scripts
├── src/
│   ├── App.jsx             # Main application component & Router configuration
│   ├── main.jsx            # React entry point
│   ├── index.css           # Global styles and Tailwind configuration
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   ├── Footer.jsx      # Bottom footer
│   │   └── ProtectedRoute.jsx # Route wrapper for admin authentication
│   ├── data/
│   │   └── offers.js       # Hardcoded seed data for internship offers
│   └── pages/              # Application pages
│       ├── Home.jsx        # Landing page
│       ├── Offers.jsx      # Internship listings
│       ├── OfferDetail.jsx # Offer description & application form
│       ├── AdminLogin.jsx  # HR Login portal
│       └── AdminDashboard.jsx # HR Management dashboard
```

## 💻 Running Locally

1. **Navigate to the project directory:**
   ```bash
   cd HR-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

## 🎨 Design Guidelines Followed
*   Clean, professional, white/light-gray backgrounds.
*   Primary color: Blue (used for buttons, links, and highlights).
*   Subtle shadows and rounded corners on cards.
*   Fully responsive layout for desktop and mobile.
*   Clear form validation feedback.
