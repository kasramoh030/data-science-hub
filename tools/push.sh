#!/usr/bin/env bash
# =====================================================================
# push.sh — create the GitHub repo and publish this site in ONE command
#
#   ./tools/push.sh <your-github-username> <repo-name> [public|private]
#
# Requirements: git + the GitHub CLI (https://cli.github.com) logged in
#   gh auth login        # one time only
#   ./tools/push.sh alireza data-science-hub public
#
# The script creates the repo, pushes the code and turns on GitHub Pages.
# No GitHub CLI? Run:  git remote add origin git@github.com:USER/REPO.git
#                      git push -u origin main
# =====================================================================
set -euo pipefail

USER="${1:-}"
REPO="${2:-data-science-hub}"
VIS="${3:-public}"

if [[ -z "$USER" ]]; then
  echo "usage: $0 <github-username> [repo-name] [public|private]"
  exit 1
fi

cd "$(dirname "$0")/.."

# 1. make sure there is a commit
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init -b main
fi
git add -A
if ! git diff --cached --quiet; then
  git -c user.name="${GIT_AUTHOR_NAME:-Data Science Hub}" \
      -c user.email="${GIT_AUTHOR_EMAIL:-noreply@example.com}" \
      commit -m "Add the complete bilingual data science hub"
fi
git branch -M main

# 2. create the remote repository (idempotent)
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$USER/$REPO" --"$VIS" --source=. --remote=origin --push
else
  git push -u origin main
fi

# 3. enable GitHub Pages (Settings -> Pages -> GitHub Actions)
gh api -X POST "repos/$USER/$REPO/pages" \
  -H "Accept: application/vnd.github+json" \
  -f build_type=workflow >/dev/null 2>&1 || true

echo
echo "✅ pushed: https://github.com/$USER/$REPO"
echo "🌍 live in ~1 minute at: https://$USER.github.io/$REPO/"
echo "   (if it 404s, run: gh workflow run pages.yml)"
