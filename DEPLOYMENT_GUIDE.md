# 🚀 NostrQuizAndVote Deployment Guide

Your MVP is **complete and ready to deploy**! Here are the easiest ways to get it live:

## 🎯 Quick Deploy Options

### Option 1: GitHub Pages (FREE - Recommended)
```bash
# Clone the repo to your local machine
git clone https://github.com/Goosie/NostrQuizAndVote.git
cd NostrQuizAndVote

# Install dependencies
npm install

# Deploy to GitHub Pages (one command!)
npm run deploy
```
**Result**: Your app will be live at `https://goosie.github.io/NostrQuizAndVote`

### Option 2: Vercel (FREE - Super Easy)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select `Goosie/NostrQuizAndVote` repository
5. Click "Deploy"

**Result**: Live URL provided instantly (e.g., `https://nostr-quiz-and-vote.vercel.app`)

### Option 3: Netlify (FREE)
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Select `Goosie/NostrQuizAndVote`
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click "Deploy"

### Option 4: Manual Upload
1. Download the `dist/` folder from the repository
2. Upload to any web hosting service
3. Point domain to `index.html`

## 🔧 Local Development
```bash
git clone https://github.com/Goosie/NostrQuizAndVote.git
cd NostrQuizAndVote
npm install
npm run dev
```

## 📱 What's Included
✅ **Complete MVP** with all features
✅ **Host Flow**: Login, quiz creation, game management
✅ **Player Flow**: PIN/QR join, answering, scoring
✅ **Nostr Integration**: All event types (35000-35004)
✅ **Game Engine**: Real-time scoring and leaderboards
✅ **Responsive Design**: Works on mobile and desktop
✅ **Production Ready**: Optimized build (359KB)

## 🎮 How to Use After Deployment
1. **Host**: Visit the URL → Login with Nostr → Create quiz → Start game
2. **Players**: Join with PIN or scan QR code → Answer questions
3. **Features**: Real-time scoring, leaderboards, zap deposits

## 🐛 Known Working Features
- ✅ Nostr login (NIP-07)
- ✅ Quiz creation and management
- ✅ Game sessions with PIN/QR
- ✅ Real-time player joining
- ✅ Question answering and scoring
- ✅ Live leaderboards
- ✅ Score updates via Nostr events

## 📞 Support
The MVP is fully functional. If you encounter any issues after deployment, check:
1. Browser console for errors
2. Nostr extension is installed and working
3. Relay connections are stable

**Your app is ready to go live! 🎉**