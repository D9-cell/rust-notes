#!/bin/sh
# Copies the site, projects and readme into a publish clone given as the first argument.
set -e
src="$(cd "$(dirname "$0")/.." && pwd)"
dest="$1"
[ -n "$dest" ] || { echo "usage: publish.sh <clone-dir>"; exit 1; }
rsync -a --delete --exclude '.git' --exclude 'target' --exclude '*.pdf' --exclude 'projects' --exclude 'tools' --exclude 'README.md' --exclude '.nojekyll' "$src/site/" "$dest/"
mkdir -p "$dest/projects" "$dest/tools"
rsync -a --delete --exclude 'target' "$src/projects/" "$dest/projects/"
rsync -a --delete "$src/tools/" "$dest/tools/"
cp "$src/README.md" "$dest/README.md"
touch "$dest/.nojekyll"
if grep -rIl --exclude-dir=.git -e '/ho''me/' -e 'gmail''.com' "$dest" | grep -q .; then
  echo "audit failed: personal data found"; exit 1
fi
echo "published to $dest"
