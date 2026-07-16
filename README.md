# ⚡ StuGig

The ultimate gig and internship matching platform tailored specifically for students. StuGig bridges the gap between ambitious student talent and companies looking for agile, skilled contributors.

**🔗 Live Website:** [stugig-frontend-delta.vercel.app](https://stugig-frontend-delta.vercel.app)  
**⚙️ Live Backend API:** [stugig-backend-kx9n.onrender.com](https://stugig-backend-kx9n.onrender.com)

---

## ✨ Key Features

### 1. ⚡ Flash Matcher (Main Feature)
Stop filling out endless forms. Upload your resume PDF, and our parser will automatically analyze your skills and background to match you instantly with customized internship and gig listings using a clean, interactive card-swipe layout.

### 2. 🎯 Dynamic Opportunities Board
A sleek, filterable feed inspired by premium job boards. Find listings based on your preference:
* **Newly Listed** (fresh opportunities)
* **Remote** (work from anywhere)
* **Research** (academic and lab positions)

### 3. 💬 Real-Time Inbox
A dedicated messaging interface for students to view, manage, and reply to messages from potential recruiters or clients. Features a live notification counter for unread messages.

### 4. ⌨️ Gamified Typing Challenge
Test and showcase your skills! An interactive, real-time typing challenge component built directly into the homepage allowing students to practice and demonstrate their speed and accuracy to clients.

### 5. 🌓 Tactile 3D Theme Switcher
Includes a beautiful, custom-built 3D toggle button in the navigation bar. Featuring satisfying press-down animations, gradient face shifts, and glowing theme-aware drop shadows.

---

## 🛠️ Tech Stack

| Frontend | Backend | Database & Deploy |
| :--- | :--- | :--- |
| React (Vite) | Node.js | MongoDB Atlas |
| TailwindCSS | Express | Vercel (Frontend) |
| Axios & Lucide Icons | Multer & PDF-Parse | Render (Backend) |

---

## 🚀 Quick Local Setup

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/Shaurya12334/StuGig.git
   cd StuGig
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   npm install
   # Add your MONGODB_URI and JWT_SECRET to .env
   npm run dev
   ```

3. **Start the Frontend:**
   ```bash
   cd ../frontend
   npm install
   # Add VITE_API_URL=http://localhost:5000 to .env
   npm run dev
   ```
