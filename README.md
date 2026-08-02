# 💖 Our Little Universe — Luxury Couple Website & Journal

Welcome to **Our Little Universe**, a premium, romantic web application designed for two people in a relationship to preserve their sweetest memories, notes, photo albums, video clips, music playlists, and anniversary milestones.

---

## 1. Project Overview

**Our Little Universe** is crafted with an elegant blush-pink aesthetic, floating particles, glassmorphism cards, and smooth Framer Motion animations.

### Key Features
* **Landing Page**: Couple hero showcase, live relationship duration ticker, floating heart particles, and background music toggle.
* **Love Timeline**: Interactive memory log with category filters, date badges, locations, photo/video attachments, and custom memory creator.
* **Photo Gallery**: Masonry photo wall, album tabs, Lightbox zoom preview, and direct image uploads to Supabase Storage (`photos` bucket).
* **Video Memories**: Dedicated video reel gallery with custom popup player and Supabase Storage (`videos` bucket) uploader.
* **Music Corner**: Global persistent audio player that continues playing while navigating across pages, custom playlist manager, and MP3 uploader (`music` bucket).
* **Love Notes Wall**: Interactive sticky notes wall with customizable pastel card themes (rose, blush, lavender, mint, gold), sender/receiver selection, pin to top feature, and attachment uploader (`notes-attachments` bucket).
* **Daily Journal**: Shared couple diary with mood tracking (😊 Joy, 🥰 Love, ☕ Cozy, 🥺 Missing, ✈️ Adventure, 🙏 Grateful), author tag, and search filtering.
* **Anniversary Countdown**: Real-time ticker counting down years, months, days, hours, minutes, and seconds, interactive confetti celebration button, and milestone tracker.
* **Love Letter**: Interactive 3D envelope hover & opening animation, smooth paper foldout, and custom formatted letter editor.
* **Favorites Collection**: Store favorite movies, songs, foods, places, dreams, and future goals with 5-star rating badges.
* **Universe Settings**: Customize couple names, avatars, relationship start date, hero title, animated particle style, and inspect Supabase connection status.

---

## 2. Tech Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling & Layout**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations**: [Framer Motion (`motion`)](https://motion.dev/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Database & Storage Backend**: [Supabase](https://supabase.com/) (PostgreSQL Database + Storage Buckets + Realtime)
* **Confetti Animations**: [Canvas Confetti](https://github.com/catdad/canvas-confetti)
* **Deployment Platform**: [Vercel](https://vercel.com/)

---

## 3. Prerequisites

Before setting up the project, make sure you have:
1. **Node.js** (v18.0.0 or higher) installed on your computer.
2. **Git** installed on your system.
3. A free **[Supabase Account](https://supabase.com/)**.
4. A free **[Vercel Account](https://vercel.com/)** connected to GitHub.

---

## 4. Supabase Setup

Follow these steps to set up your free Supabase database and storage buckets:

1. **Create Account**: Go to [supabase.com](https://supabase.com/) and sign up.
2. **Create Organization**: Click **New Organization** and give it a name (e.g. *Our Little Universe*).
3. **Create Project**:
   * Click **New Project**.
   * Project Name: `our-little-universe`
   * Database Password: Create a strong password and save it safely.
   * Region: Select the region closest to you or your partner.
   * Pricing Plan: Free Tier.
4. **Wait for Provisioning**: Supabase will take 1-2 minutes to set up your PostgreSQL database.
5. **Get Credentials**:
   * Go to **Project Settings** -> **API**.
   * Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`).
   * Copy the **anon / public key** (`eyJhbGciOiJIUzI1NiIsInR5cCI6...`).
   * Copy the **service_role key** (keep this secret!).

---

## 5. Database Setup (Running SQL Migrations)

1. In your Supabase Dashboard, click on **SQL Editor** in the left menu.
2. Click **New Query**.
3. Copy the entire contents of `supabase_schema.sql` (found in the root directory of this repository) or from the **Settings** page inside the website.
4. Paste the SQL script into the SQL Editor.
5. Click **Run** (or press `Ctrl + Enter`).
6. You will see `Success. No rows returned`.
7. Go to **Table Editor** in the left menu and verify that these 6 tables exist:
   * `settings`
   * `memories`
   * `notes`
   * `journal_entries`
   * `songs`
   * `favorites`

---

## 6. Storage Setup (Creating Buckets)

1. In Supabase Dashboard, click **Storage** in the left sidebar.
2. Click **New Bucket** and create the following 4 public buckets:

   * **Bucket 1 Name**: `photos` -> Toggle **Public Bucket** ON -> Click Save.
   * **Bucket 2 Name**: `videos` -> Toggle **Public Bucket** ON -> Click Save.
   * **Bucket 3 Name**: `music` -> Toggle **Public Bucket** ON -> Click Save.
   * **Bucket 4 Name**: `notes-attachments` -> Toggle **Public Bucket** ON -> Click Save.

> **Note on Public vs Private**: Setting the buckets as **Public** allows the website to display uploaded couple photos, videos, and music files via public CDN URLs.

---

## 7. Row Level Security (RLS) & Storage Policies

The `supabase_schema.sql` script automatically enables Row Level Security (RLS) and attaches open policies for public select, insert, update, and delete access.

If you wish to configure Storage Policies manually in Supabase:
1. Go to **Storage** -> **Policies**.
2. Select your bucket (`photos`, `videos`, etc.).
3. Click **New Policy** -> **For full customization**.
4. Set policy name: `Public Access`.
5. Select operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
6. Target roles: `anon`, `authenticated`.
7. Check expression: `true`.

---

## 8. Environment Variables Setup

Create a `.env.local` file in the root directory of your project:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://YOUR_SUPABASE_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Explanation of Variables:
* `VITE_SUPABASE_URL`: Your Supabase project endpoint.
* `VITE_SUPABASE_ANON_KEY`: The public API key that allows the browser app to query your database and upload media.

---

## 9. Local Development

To run the application locally on your computer:

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/our-little-universe.git
cd our-little-universe

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:3000` to preview the app!

---

## 10. Deploying to Vercel

This app is 100% ready to deploy on **Vercel** without any server build scripts:

1. **Push Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Our Little Universe"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/our-little-universe.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   * Log in to [Vercel](https://vercel.com/).
   * Click **Add New** -> **Project**.
   * Import your `our-little-universe` GitHub repository.

3. **Configure Project Settings on Vercel**:
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`

4. **Add Environment Variables in Vercel**:
   * Add `VITE_SUPABASE_URL` = `https://xyz.supabase.co`
   * Add `VITE_SUPABASE_ANON_KEY` = `your_anon_key`

5. **Deploy**:
   * Click **Deploy**.
   * Vercel will build and deploy your live website in under 60 seconds!

---

## 11. Updating the Website

Whenever you make changes or add new features:

```bash
git add .
git commit -m "Updated couple timeline & styling"
git push origin main
```

Vercel will automatically detect the push and redeploy your live website!

---

## 12. Uploading Media

* **Photos**: Uploaded from Gallery, Timeline, or Settings. Saved to `photos` bucket.
* **Videos**: Uploaded from Video Memories. Saved to `videos` bucket.
* **Music MP3s**: Uploaded from Music Corner. Saved to `music` bucket.
* **Note Attachments**: Uploaded from Love Notes. Saved to `notes-attachments` bucket.

---

## 13. Troubleshooting & FAQs

### 🔴 Error: `Invalid API Key` or `401 Unauthorized`
* **Cause**: Incorrect `VITE_SUPABASE_ANON_KEY` in environment variables.
* **Fix**: Verify your key in Supabase Dashboard -> Settings -> API and update Vercel environment variables.

### 🔴 Error: `Storage Permission Denied`
* **Cause**: Storage bucket is set to Private or RLS policy is blocking uploads.
* **Fix**: Ensure the bucket is set to **Public Bucket** in Supabase Storage settings.

### 🔴 Build Failed on Vercel
* **Cause**: TypeScript type checking error or missing dependencies.
* **Fix**: Run `npm run build` locally to identify any missing type declarations before pushing to GitHub.

---

## 14. Folder Structure

```
our-little-universe/
├── public/
├── src/
│   ├── components/
│   │   ├── Footer.tsx            # Footer with days counter & couple info
│   │   ├── Lightbox.tsx          # Fullscreen zoom photo/video viewer
│   │   ├── MediaUploader.tsx     # Drag & drop upload component with progress
│   │   ├── Navbar.tsx            # Sticky glassmorphism navbar with music player
│   │   └── ParticleCanvas.tsx    # Animated hearts, sakura, stars, bubbles canvas
│   ├── context/
│   │   ├── CoupleContext.tsx     # State for couple names, dates & live timer
│   │   └── MusicContext.tsx      # Global persistent background audio player
│   ├── lib/
│   │   └── supabase.ts           # Supabase client initialization
│   ├── pages/
│   │   ├── Countdown.tsx         # Anniversary live ticker & confetti
│   │   ├── Favorites.tsx         # Categorized favorites grid
│   │   ├── Gallery.tsx           # Masonry photo wall & album filters
│   │   ├── Journal.tsx           # Shared daily couple diary & mood tracker
│   │   ├── Landing.tsx           # Hero section & interactive portal
│   │   ├── Letter.tsx            # 3D envelope opening animation & letter
│   │   ├── Music.tsx             # Romantic music corner & MP3 player
│   │   ├── Notes.tsx             # Love notes wall with custom card themes
│   │   ├── Settings.tsx          # Couple customization & SQL schema copy
│   │   ├── Timeline.tsx          # Interactive love memory timeline
│   │   └── Videos.tsx            # Video reel gallery
│   ├── services/
│   │   └── dataService.ts        # Data layer with Supabase + local fallback
│   ├── types/
│   │   └── index.ts              # TypeScript interface definitions
│   ├── App.tsx                   # Main router layout
│   ├── index.css                 # Glassmorphic Tailwind styles & keyframes
│   └── main.tsx                  # Application entry point
├── .env.example                  # Environment variable template
├── metadata.json                 # AI Studio applet metadata
├── package.json                  # NPM dependencies & scripts
├── supabase_schema.sql           # PostgreSQL database migration script
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler configuration
```

---

## 15. Future Improvements

* 🔐 Two-user private authentication (Partner 1 and Partner 2 pin code or login)
* 💬 Realtime instant chat room with push notifications
* 🗺️ Interactive map showing locations of all memories
* 🤖 AI Love Letter generator for anniversaries
* 📅 Shared couple calendar for upcoming date nights
* 📱 Progressive Web App (PWA) support with home screen installation

---

<p align="center">
  Made with endless love for couples everywhere 💕✨
</p>
