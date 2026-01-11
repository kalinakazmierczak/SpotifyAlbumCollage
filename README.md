Spindle - Spotify Vinyl Wall Collage
- https://spindlevinyl.netlify.app/
- Spindle is a Next.js web application that transforms your Spotify listening history into a shareable vinyl record wall display. Create personalized collages featuring your top albums or songs displayed as vintage vinyl records, optimized for Instagram Stories and social media.



Features
- Spotify Integration: Secure authentication with Spotify using NextAuth.js
- Customizable Time Periods: View your top music from the last 4 weeks, 6 months, or year
- Dual Content Modes: Display either your top albums or top songs
- Vintage Vinyl Aesthetic: Music displayed as authentic-looking vinyl records with album artwork
- Interactive Records: Click any vinyl to open the album or song directly in Spotify
- Social Media Ready: Optimized 1080x1920px canvas perfect for Instagram Stories
- Responsive Design: Modern UI built with Tailwind CSS


Tech Stack
- Framework: Next.js 15 (React 19)
- Authentication: NextAuth.js with Spotify OAuth
- Styling: Tailwind CSS 4
- Canvas Export: html2canvas for image generation
- Deployment: Netlify with Next.js plugin
- API: Spotify Web API for fetching user listening data
- Design Philosophy
- Spindle combines modern web technologies with nostalgic vinyl aesthetics, allowing music lovers to showcase their unique taste in a shareable, visually striking format. The application respects user privacy by using Spotify's official OAuth flow and only requesting minimal permissions (user-top-read).

Getting Started
- Clone the repository
- Install dependencies: npm install
- Set up environment variables for Spotify OAuth credentials
- Run the development server: npm run dev
- Open http://localhost:3000
  
Deployment
- Configured for deployment on Netlify (https://spindlevinyl.netlify.app/) with automatic builds and optimized caching for the proxy image API.
