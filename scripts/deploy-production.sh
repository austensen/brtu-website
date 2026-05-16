#!/usr/bin/env bash
# Merge main into production (fast-forward only) and push for Netlify deploys.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MAIN_BRANCH="${MAIN_BRANCH:-main}"
PRODUCTION_BRANCH="${PRODUCTION_BRANCH:-production}"

die() {
  echo "deploy-production: error: $*" >&2
  exit 1
}

info() {
  echo "deploy-production: $*"
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  die "not a git repository (expected repo root: $ROOT)"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  die "working tree is not clean — commit or stash changes before deploying"
fi

START_BRANCH="$(git branch --show-current 2>/dev/null || true)"
SUCCESS=0
trap 'if [[ "$SUCCESS" -ne 1 ]]; then echo "deploy-production: aborted (current branch: $(git branch --show-current 2>/dev/null || echo unknown))" >&2; fi' EXIT

info "fetching latest from origin…"
git fetch origin

info "updating $MAIN_BRANCH …"
git checkout "$MAIN_BRANCH"
git pull --ff-only origin "$MAIN_BRANCH"

info "updating $PRODUCTION_BRANCH …"
git checkout "$PRODUCTION_BRANCH"
git pull --ff-only origin "$PRODUCTION_BRANCH"

info "merging $MAIN_BRANCH into $PRODUCTION_BRANCH (fast-forward only)…"
if ! git merge "$MAIN_BRANCH" --ff-only; then
  echo >&2
  echo "deploy-production: fast-forward merge failed." >&2
  echo "  $PRODUCTION_BRANCH is not a direct ancestor of $MAIN_BRANCH." >&2
  echo "  (production may have extra commits, or histories diverged.)" >&2
  echo >&2
  echo "  Nothing was pushed. Resolve locally, then re-run this script:" >&2
  echo "    git log --oneline $PRODUCTION_BRANCH .. $MAIN_BRANCH   # commits on main not on production" >&2
  echo "    git log --oneline $MAIN_BRANCH .. $PRODUCTION_BRANCH   # commits on production not on main" >&2
  echo >&2
  echo "  Typical fixes:" >&2
  echo "    - If production should match main: git reset --hard $MAIN_BRANCH  (destructive; only if sure)" >&2
  echo "    - If production needs to keep its commits: merge or rebase main onto production, then push" >&2
  exit 1
fi

info "pushing $PRODUCTION_BRANCH to origin…"
git push origin "$PRODUCTION_BRANCH"

SUCCESS=1
trap - EXIT
info "done — $PRODUCTION_BRANCH is at $(git rev-parse --short HEAD) ($(git log -1 --format='%s'))"
