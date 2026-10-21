#!/usr/bin/env bash
set -euo pipefail
umask 077
source /www/wwwroot/personalwebsite-app/shared/runtime.env
: "${DATABASE_URL:?Missing DATABASE_URL}"
backup_dir=/www/wwwroot/personalwebsite-app/shared/backups
mkdir -p "$backup_dir"
backup="$backup_dir/writing-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --dbname="$DATABASE_URL" --format=custom --file="$backup.partial"
mv "$backup.partial" "$backup"
mapfile -t backups < <(find "$backup_dir" -maxdepth 1 -type f -name 'writing-*.dump' | sort -r)
if (( ${#backups[@]} > 7 )); then
  for old in "${backups[@]:7}"; do rm -- "$old"; done
fi
