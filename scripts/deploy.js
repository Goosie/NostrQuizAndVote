#!/usr/bin/env node

/**
 * CICDAgent - Deployment Script
 * Simple deployment automation for NostrQuizAndVote
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function exec(command, options = {}) {
  log(`> ${command}`, 'blue');
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'yellow');
  
  // Check if we're in a git repo
  try {
    exec('git status', { stdio: 'pipe' });
  } catch {
    log('❌ Not in a git repository', 'red');
    process.exit(1);
  }

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found', 'red');
    process.exit(1);
  }

  log('✅ Prerequisites check passed', 'green');
}

function buildProject() {
  log('🏗️  Building project...', 'yellow');
  exec('npm run build');
  
  if (!fs.existsSync('dist')) {
    log('❌ Build failed - dist folder not found', 'red');
    process.exit(1);
  }
  
  log('✅ Build completed successfully', 'green');
}

function deployToGitHubPages() {
  log('🚀 Deploying to GitHub Pages...', 'yellow');
  
  // Check if gh-pages is installed
  try {
    exec('npx gh-pages --version', { stdio: 'pipe' });
  } catch {
    log('📦 Installing gh-pages...', 'blue');
    exec('npm install --save-dev gh-pages');
  }
  
  // Deploy
  exec('npx gh-pages -d dist -m "Deploy: $(date)"');
  log('✅ Deployed to GitHub Pages successfully!', 'green');
}

function createRelease(version) {
  log(`🏷️  Creating release ${version}...`, 'yellow');
  
  // Create git tag
  exec(`git tag -a ${version} -m "Release ${version}"`);
  exec(`git push origin ${version}`);
  
  log(`✅ Release ${version} created successfully!`, 'green');
}

function getNextVersion() {
  try {
    const tags = execSync('git tag -l "v*" --sort=-version:refname', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    }).trim().split('\n').filter(Boolean);
    
    if (tags.length === 0) {
      return 'v1.0.0';
    }
    
    const latestTag = tags[0];
    const match = latestTag.match(/v(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const [, major, minor, patch] = match;
      return `v${major}.${minor}.${parseInt(patch) + 1}`;
    }
  } catch {
    // Fallback if git tag fails
  }
  
  return `v1.0.${Date.now()}`;
}

function showHelp() {
  log(`
${COLORS.bold}🤖 CICDAgent - NostrQuizAndVote Deployment Tool${COLORS.reset}

${COLORS.green}Usage:${COLORS.reset}
  npm run deploy              Deploy to GitHub Pages
  npm run deploy:release      Deploy + create new release
  node scripts/deploy.js      Same as npm run deploy

${COLORS.green}Commands:${COLORS.reset}
  build                       Build the project only
  pages                       Deploy to GitHub Pages
  release [version]           Create a new release
  help                        Show this help

${COLORS.green}Examples:${COLORS.reset}
  node scripts/deploy.js pages
  node scripts/deploy.js release v1.2.0
  node scripts/deploy.js build

${COLORS.yellow}What this does:${COLORS.reset}
  ✅ Builds your React app
  ✅ Deploys to GitHub Pages
  ✅ Creates releases with git tags
  ✅ Provides live URL for your app

${COLORS.blue}Your app will be live at:${COLORS.reset}
  https://goosie.github.io/NostrQuizAndVote
`, 'reset');
}

function main() {
  const command = process.argv[2] || 'pages';
  const arg = process.argv[3];

  log(`${COLORS.bold}🤖 CICDAgent - NostrQuizAndVote Deployment${COLORS.reset}`, 'reset');
  log('', 'reset');

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case 'build':
      checkPrerequisites();
      buildProject();
      log('🎉 Build complete! Check the dist/ folder', 'green');
      break;

    case 'pages':
      checkPrerequisites();
      buildProject();
      deployToGitHubPages();
      log('', 'reset');
      log('🎉 Deployment complete!', 'green');
      log('🌐 Your app is live at: https://goosie.github.io/NostrQuizAndVote', 'blue');
      break;

    case 'release':
      checkPrerequisites();
      buildProject();
      const version = arg || getNextVersion();
      createRelease(version);
      log('', 'reset');
      log(`🎉 Release ${version} created!`, 'green');
      log('💡 Don\'t forget to deploy: npm run deploy', 'yellow');
      break;

    case 'full':
      checkPrerequisites();
      buildProject();
      deployToGitHubPages();
      const newVersion = arg || getNextVersion();
      createRelease(newVersion);
      log('', 'reset');
      log('🎉 Full deployment complete!', 'green');
      log('🌐 Your app is live at: https://goosie.github.io/NostrQuizAndVote', 'blue');
      log(`🏷️  Release: ${newVersion}`, 'blue');
      break;

    default:
      log(`❌ Unknown command: ${command}`, 'red');
      log('💡 Use "help" to see available commands', 'yellow');
      process.exit(1);
  }
}

main();