# 🤖 CICDAgent - Deployment Automation

The **CICDAgent** provides simple, one-command deployment for NostrQuizAndVote.

## 🚀 Quick Deploy Commands

### Deploy to GitHub Pages
```bash
npm run deploy
```
**Result**: Your app goes live at `https://goosie.github.io/NostrQuizAndVote`

### Build Only
```bash
npm run deploy:build
```
**Result**: Creates optimized `dist/` folder

### Deploy + Create Release
```bash
npm run deploy:release
```
**Result**: Deploys app + creates new git tag/release

### Help
```bash
npm run deploy:help
```
**Result**: Shows all available commands

## 🔧 Advanced Usage

### Custom Release Version
```bash
node scripts/deploy.js release v2.0.0
```

### Manual Commands
```bash
node scripts/deploy.js pages     # Deploy to GitHub Pages
node scripts/deploy.js build     # Build only
node scripts/deploy.js full      # Deploy + release
```

## 🎯 What the CICDAgent Does

✅ **Automated Building**: Compiles TypeScript, bundles React app  
✅ **GitHub Pages Deploy**: Pushes to `gh-pages` branch automatically  
✅ **Release Management**: Creates git tags and GitHub releases  
✅ **Error Handling**: Checks prerequisites and provides clear feedback  
✅ **GitHub Actions**: Automated CI/CD pipeline on every push  

## 🔄 GitHub Actions Workflow

The CICDAgent also sets up automated deployment:

- **Trigger**: Every push to `main` branch
- **Actions**: Build → Test → Deploy to GitHub Pages
- **Manual**: Can trigger deployment from GitHub Actions tab

## 🎮 Live App Access

After deployment, your NostrQuizAndVote app will be available at:
**https://goosie.github.io/NostrQuizAndVote**

### Features Available:
- ✅ Host login with Nostr (NIP-07)
- ✅ Quiz creation and management  
- ✅ Game sessions with PIN/QR codes
- ✅ Real-time player joining and scoring
- ✅ Live leaderboards and zap integration
- ✅ Mobile-responsive design

## 🛠️ Technical Details

- **Build Tool**: Vite + TypeScript
- **Deployment**: GitHub Pages via `gh-pages` package
- **CI/CD**: GitHub Actions workflow
- **Release**: Automated git tagging
- **Hosting**: Static site hosting (CDN-powered)

## 🐛 Troubleshooting

If deployment fails:

1. **Check Git Status**: `git status` (must be clean)
2. **Check Node Version**: Node.js 18+ required
3. **Check Dependencies**: `npm install`
4. **Manual Deploy**: `npx gh-pages -d dist`

## 📞 CICDAgent Commands Summary

| Command | Description | Result |
|---------|-------------|---------|
| `npm run deploy` | Deploy to GitHub Pages | Live app URL |
| `npm run deploy:build` | Build only | `dist/` folder |
| `npm run deploy:release` | Deploy + release | Live app + git tag |
| `npm run deploy:help` | Show help | Command reference |

**Your NostrQuizAndVote MVP is ready for one-command deployment! 🎉**