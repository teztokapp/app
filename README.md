<div align="center">

<img src="./public/logo-black.png" alt="TezTok Logo" width="120" />

### *scroll theses instead of reels.*

**Mobile-first academic thesis browsing with a social media style vertical feed.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

---
</div>

## 🚀 Overview

TezTok transforms the often mundane task of browsing academic theses into an engaging, immersive experience. Combining a TikTok-style vertical feed with powerful scraping and AI summary capabilities, it brings academic research to your fingertips.

---

<div>
  <h2>📸 App Gallery</h2>
  <br />
  <table border="0">
    <tr>
      <td><img src="./public/screenshots/screenshot-mobile-2.png" width="250" /></td>
      <td><img src="./public/screenshots/screenshot-mobile-3.png" width="250" /></td>
      <td><img src="./public/screenshots/screenshot-mobile-4.png" width="250" /></td>
    </tr>
  </table>
  <br />
  <img src="./public/screenshots/screenshot-desktop-1.png" width="85%" style="border-radius: 10px;" />
  <p><i>Desktop view optimized for widescreen research sessions.</i></p>
</div>

---

<div>
  <h2>🏗️ Architecture</h2>
</div>

```mermaid
graph TD
    A[React / Vite Frontend] --> B[YOKTez API Gateway]
    B --> C[YOKTez Adapter Layer]
    C --> D[YOKTez/Playwright Scraper]
    B --> E[OpenAI Summary Gen]
    A --> F[Wikimedia / Unsplash Imagery]
```

---

<div align="center">
  <h2>🛠️ Setup & Development</h2>
</div>

### Prerequisites
- Node.js (>= 20.x)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/yoktez-tiktok.git

# Install dependencies
npm install

# Run in development mode (Simultaneous Client & Server)
npm run dev
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_YOKTEZ_API_BASE_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_key
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

---

<div>
  <h2>🚢 Deployment</h2>
</div>

### Frontend (Vercel)
The client is ready for Vercel deployment with included `vercel.json` configurations.

### Mobile (Capacitor)
```bash
# Sync with native platforms
npm run cap:sync

# Open in IDE
npm run cap:open:ios
npm run cap:open:android
```

---

<div align="center">
  <p>Developed with ❤️ for the academic community.</p>
</div>
