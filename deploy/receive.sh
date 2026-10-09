#!/usr/bin/env bash
set -euo pipefail
umask 022

app_dir=/www/wwwroot/personalwebsite-app
if [[ ! "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})\ ([0-9a-f]{64})$ ]]; then
  echo 'Only deployment uploads are permitted.' >&2
  exit 1
fi
revision="${BASH_REMATCH[1]}"
checksum="${BASH_REMATCH[2]}"
exec 9>"$app_dir/.deploy.lock"
flock -w 120 9
release_dir="$(mktemp -d "$app_dir/releases/$revision.XXXXXXXX")"
chmod 755 "$release_dir"
archive="$(mktemp "$app_dir/upload.XXXXXXXX.tar.gz")"
previous="$(readlink "$app_dir/current" || true)"
switched=0
success=0

finish() {
  status=$?
  rm -f "$archive" "$app_dir/current.next"
  if [[ "$success" == 0 ]]; then
    if [[ "$switched" == 1 ]]; then
      if [[ -n "$previous" ]]; then
        ln -s "$previous" "$app_dir/current.next"
        mv -Tf "$app_dir/current.next" "$app_dir/current"
        sudo -n /usr/bin/systemctl restart personalwebsite.service || true
      else
        rm -f "$app_dir/current"
      fi
    fi
    rm -rf -- "$release_dir"
  fi
  exit "$status"
}
trap finish EXIT

timeout 300 head -c 268435457 > "$archive"
if [[ "$(stat -c %s "$archive")" -gt 268435456 ]]; then
  echo 'Upload exceeds 256 MiB.' >&2
  exit 1
fi
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --status

python3 - "$archive" "$release_dir" <<'PYTHON'
import os
import posixpath
import sys
import tarfile

archive_path, release_path = sys.argv[1:]
with tarfile.open(archive_path, 'r:gz') as archive:
    members = archive.getmembers()
    if len(members) > 100000 or sum(member.size for member in members) > 1073741824:
        raise SystemExit('Archive exceeds extraction limits.')
    links = set()
    names = set()
    for member in members:
        name = posixpath.normpath(member.name)
        if name in names:
            raise SystemExit('Duplicate archive path.')
        names.add(name)
        if name.startswith('/') or '..' in member.name.split('/'):
            raise SystemExit('Invalid archive path.')
        if not (member.isdir() or member.isfile() or member.issym()):
            raise SystemExit('Unsupported archive member.')
        if member.issym():
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), member.linkname))
            if target.startswith('/') or target == '..' or target.startswith('../'):
                raise SystemExit('Invalid symlink target.')
            links.add(name)
        member.mode &= 0o777
    for member in members:
        parent = posixpath.dirname(posixpath.normpath(member.name))
        while parent not in ('', '.', '/'):
            if parent in links:
                raise SystemExit('Archive writes through a symlink.')
            parent = posixpath.dirname(parent)
    archive.extractall(release_path, members=members)
    for link in links:
        resolved = os.path.realpath(os.path.join(release_path, link))
        if not resolved.startswith(release_path + os.sep):
            raise SystemExit('Symlink resolves outside the release.')
    server = os.path.join(release_path, 'server.js')
    if not os.path.isfile(server) or os.path.islink(server):
        raise SystemExit('Standalone server.js is missing.')
PYTHON

chmod -R u+rwX,go+rX "$release_dir"
ln -s "$release_dir" "$app_dir/current.next"
mv -Tf "$app_dir/current.next" "$app_dir/current"
switched=1
sudo -n /usr/bin/systemctl restart personalwebsite.service
for attempt in $(seq 1 30); do
  if /usr/bin/systemctl is-active --quiet personalwebsite.service \
    && curl --silent --fail --max-time 3 http://127.0.0.1:3100/zh > /dev/null \
    && curl --silent --fail --max-time 3 http://127.0.0.1:3100/en > /dev/null; then
    success=1
    echo "Deployed $revision successfully."
    exit 0
  fi
  sleep 2
done
echo 'Health check failed; restoring the previous release.' >&2
exit 1
