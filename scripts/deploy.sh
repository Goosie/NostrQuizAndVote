#!/bin/bash

# 🤖 CICDAgent - Simple Deployment Script
# NostrQuizAndVote deployment automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log() {
    echo -e "${2:-$NC}$1${NC}"
}

check_prerequisites() {
    log "🔍 Checking prerequisites..." $YELLOW
    
    # Check if we're in a git repo
    if ! git status >/dev/null 2>&1; then
        log "❌ Not in a git repository" $RED
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log "❌ package.json not found" $RED
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        log "❌ npm not found. Please install Node.js and npm" $RED
        exit 1
    fi
    
    log "✅ Prerequisites check passed" $GREEN
}

build_project() {
    log "🏗️  Building project..." $YELLOW
    npm run build
    
    if [ ! -d "dist" ]; then
        log "❌ Build failed - dist folder not found" $RED
        exit 1
    fi
    
    log "✅ Build completed successfully" $GREEN
}

deploy_to_github_pages() {
    log "🚀 Deploying to GitHub Pages..." $YELLOW
    
    # Check if gh-pages is installed
    if ! npm list gh-pages >/dev/null 2>&1; then
        log "📦 Installing gh-pages..." $BLUE
        npm install --save-dev gh-pages
    fi
    
    # Deploy
    npx gh-pages -d dist -m "Deploy: $(date)"
    log "✅ Deployed to GitHub Pages successfully!" $GREEN
}

create_release() {
    local version=$1
    log "🏷️  Creating release $version..." $YELLOW
    
    # Create git tag
    git tag -a "$version" -m "Release $version"
    git push origin "$version"
    
    log "✅ Release $version created successfully!" $GREEN
}

get_next_version() {
    # Get the latest tag
    local latest_tag=$(git tag -l "v*" --sort=-version:refname | head -n1)
    
    if [ -z "$latest_tag" ]; then
        echo "v1.0.0"
        return
    fi
    
    # Extract version numbers
    if [[ $latest_tag =~ v([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
        local major=${BASH_REMATCH[1]}
        local minor=${BASH_REMATCH[2]}
        local patch=${BASH_REMATCH[3]}
        echo "v$major.$minor.$((patch + 1))"
    else
        echo "v1.0.$(date +%s)"
    fi
}

show_help() {
    log ""
    log "${BOLD}🤖 CICDAgent - NostrQuizAndVote Deployment Tool${NC}"
    log ""
    log "${GREEN}Usage:${NC}"
    log "  ./scripts/deploy.sh [command]"
    log "  npm run deploy              # Deploy to GitHub Pages"
    log ""
    log "${GREEN}Commands:${NC}"
    log "  build                       Build the project only"
    log "  pages                       Deploy to GitHub Pages"
    log "  release [version]           Create a new release"
    log "  full                        Build + Deploy + Release"
    log "  help                        Show this help"
    log ""
    log "${GREEN}Examples:${NC}"
    log "  ./scripts/deploy.sh pages"
    log "  ./scripts/deploy.sh release v1.2.0"
    log "  ./scripts/deploy.sh build"
    log ""
    log "${YELLOW}What this does:${NC}"
    log "  ✅ Builds your React app"
    log "  ✅ Deploys to GitHub Pages"
    log "  ✅ Creates releases with git tags"
    log "  ✅ Provides live URL for your app"
    log ""
    log "${BLUE}Your app will be live at:${NC}"
    log "  https://goosie.github.io/NostrQuizAndVote"
    log ""
}

main() {
    local command=${1:-pages}
    local arg=$2

    log "${BOLD}🤖 CICDAgent - NostrQuizAndVote Deployment${NC}"
    log ""

    case $command in
        help|--help|-h)
            show_help
            ;;
        
        build)
            check_prerequisites
            build_project
            log "🎉 Build complete! Check the dist/ folder" $GREEN
            ;;
        
        pages)
            check_prerequisites
            build_project
            deploy_to_github_pages
            log ""
            log "🎉 Deployment complete!" $GREEN
            log "🌐 Your app is live at: https://goosie.github.io/NostrQuizAndVote" $BLUE
            ;;
        
        release)
            check_prerequisites
            build_project
            local version=${arg:-$(get_next_version)}
            create_release "$version"
            log ""
            log "🎉 Release $version created!" $GREEN
            log "💡 Don't forget to deploy: ./scripts/deploy.sh pages" $YELLOW
            ;;
        
        full)
            check_prerequisites
            build_project
            deploy_to_github_pages
            local new_version=${arg:-$(get_next_version)}
            create_release "$new_version"
            log ""
            log "🎉 Full deployment complete!" $GREEN
            log "🌐 Your app is live at: https://goosie.github.io/NostrQuizAndVote" $BLUE
            log "🏷️  Release: $new_version" $BLUE
            ;;
        
        *)
            log "❌ Unknown command: $command" $RED
            log "💡 Use 'help' to see available commands" $YELLOW
            exit 1
            ;;
    esac
}

main "$@"