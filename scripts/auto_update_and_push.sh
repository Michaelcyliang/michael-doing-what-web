#!/bin/bash
set -euo pipefail

REPO_DIR="/Volumes/Michael Workspace/WhatIsMichaelDoing_Project/michael-doing-what-web"
PYTHON_BIN="/opt/homebrew/bin/python3"

if [ ! -d "$REPO_DIR" ]; then
  echo "[$(date)] 找不到專案目錄: $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

echo "[$(date)] 開始執行麥克在幹嘛每日自動資料更新..."
"$PYTHON_BIN" scripts/sync_data.py --fetch-live

if ! git diff --quiet public/data/dashboard.json public/data/projects.json; then
  TIMESTAMP="$(TZ=Asia/Taipei date '+%Y-%m-%d %H:%M CST')"
  git add public/data/dashboard.json public/data/projects.json
  git commit -m "chore: auto-sync market data ($TIMESTAMP)"
  git push origin main
  echo "[$(date)] 已推送最新金融數據至 GitHub ($TIMESTAMP)"
else
  echo "[$(date)] 資料無變動，略過提交"
fi
