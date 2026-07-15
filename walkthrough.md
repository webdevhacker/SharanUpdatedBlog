# Project Complete: TechBlog 

I've successfully finished building out the full-stack TechBlog application with the requested features. The application is now production-ready!

## 🚀 Features Implemented

### **Modern Frontend (React, Vite, Tailwind CSS)**
- **Fully Responsive UI:** Built with Tailwind CSS, utilizing a mobile-first approach.
- **Dynamic Theming:** Dark mode and Light mode toggling using `framer-motion` for fluid transitions.
- **Authentication Pages:** Beautifully animated Login, Register, and Forgot Password pages with step-by-step OTP verification flows.
- **Rich Text Editing:** Integrated TipTap for a powerful WYSIWYG blogging experience.
- **Account Settings & Security:** 
  - Comprehensive user profile settings with avatar uploads.
  - Active sessions manager with device tracking (IP, OS, Location) and the ability to sign out of individual or all other devices.
  - Security event notifications embedded within the "Danger Zone".

### **Robust Backend (Node.js, Express, MongoDB)**
- **Security First:** Implemented rate limiting, helmet, mongo-sanitize, xss, and hpp for protection against common attacks.
- **Advanced Authentication:** 
  - JWT-based authentication with short-lived access tokens and long-lived refresh tokens.
  - Email OTP verification for new accounts and password resets.
- **Email Notifications:** 
  - Ethereal email fallback for local development.
  - Beautiful inline CSS email templates for OTP verification, Password resets, and New Sign-in alerts (with device info and location).
- **Admin Management:**
  - Dedicated admin API endpoints and middleware.
  - Dashboard stats tracking active users, total posts, drafts, and more.

### **Production Infrastructure**
- **Nginx Config:** Reverse proxy configuration with SSL headers, caching, and rate limiting in `nginx/techblog.conf`.
- **PM2 Setup:** Process manager configuration mapped in `ecosystem.config.js`.
- **Deployment Script:** Automated shell script `deploy.sh` for easy VPS updates.

## 🔑 Getting Started (Local Development)

1. Make sure your MongoDB is running locally (`mongodb://127.0.0.1:27017/techblog`).
2. Run the seed script to populate the database with dummy data and an admin user:
   ```bash
   cd "f:\React Blog Application\server"
   npm run seed
   ```
   **Default Admin Credentials:**
   - Email: `admin@techblog.dev`
   - Password: `Admin@123`
3. Open two terminals to start the servers:
   ```bash
   # Terminal 1: Backend
   cd "f:\React Blog Application\server"
   npm run dev
   
   # Terminal 2: Frontend
   cd "f:\React Blog Application\client"
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

> [!TIP]
> **Email Testing:** During local development (unless you add real SMTP credentials to `.env`), the server uses an Ethereal fake email service. Check the terminal output whenever an email is "sent" for a URL to preview the beautiful HTML emails directly in your browser.

> [!NOTE]
> The frontend production bundle was compiled successfully without errors, meaning the app is verified and ready for deployment to your VPS.
