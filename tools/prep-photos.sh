#!/usr/bin/env bash
# Prepare private plant photos for publishing.
#   bake EXIF rotation -> resize -> strip EXIF -> blur background -> strip EXIF again
#
#   ./tools/prep-photos.sh                        # all photos in plants/private
#   ./tools/prep-photos.sh 02-calathea 09-peace-lily
#   BLUR_RADIUS=26 ./tools/prep-photos.sh         # stronger blur
#
# Originals in plants/private/ are never modified.
#
# Order matters, twice over:
#   * Rotation is baked in BEFORE stripping, or the photos publish sideways.
#   * EXIF is stripped BEFORE the blur, or Vision re-applies the orientation tag
#     to already-rotated pixels and returns a mask misaligned with the image.
#   * EXIF is stripped AGAIN after the blur, because Core Image writes a fresh
#     EXIF block when it saves the JPEG.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=plants/private
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
BLUR_RADIUS=${BLUR_RADIUS:-18}

read_orientation() {  # -> 1 | 3 | 6 | 8
  python3 -c "
import struct,sys
d=open(sys.argv[1],'rb').read(); i=2
while i<len(d)-4:
    if d[i]!=0xFF: break
    m=d[i+1]
    if m==0xDA: break
    seg=struct.unpack('>H',d[i+2:i+4])[0]
    if m==0xE1 and d[i+4:i+10]==b'Exif\x00\x00':
        t=i+10; bo='<' if d[t:t+2]==b'II' else '>'
        off=struct.unpack(bo+'I',d[t+4:t+8])[0]; p=t+off
        n=struct.unpack(bo+'H',d[p:p+2])[0]
        for k in range(n):
            e=p+2+k*12
            if struct.unpack(bo+'H',d[e:e+2])[0]==0x0112:
                print(struct.unpack(bo+'H',d[e+8:e+10])[0]); sys.exit()
        break
    i+=2+seg
print(1)" "$1"
}

strip_meta() {  # drop EXIF/IPTC/comments, keep the ICC colour profile
  python3 -c "
import struct,sys
p=sys.argv[1]; d=open(p,'rb').read(); out=bytearray(b'\xff\xd8'); i=2
while i<len(d):
    m=d[i+1]
    if m==0xD8: i+=2; continue
    if m==0xDA: out+=d[i:]; break
    seg=struct.unpack('>H',d[i+2:i+4])[0]
    if m not in (0xE1,0xED,0xFE): out+=d[i:i+2+seg]
    i+=2+seg
open(p,'wb').write(bytes(out))" "$1"
}

if [ $# -gt 0 ]; then FILES=(); for n in "$@"; do FILES+=("$SRC/$n.jpg"); done
else FILES=("$SRC"/*.jpg); fi

fail=0
for f in "${FILES[@]}"; do
  b=$(basename "$f" .jpg)
  printf '%-24s ' "$b"
  cp "$f" "$TMP/$b.jpg"

  case "$(read_orientation "$TMP/$b.jpg")" in
    6) sips --rotate 90  "$TMP/$b.jpg" >/dev/null ;;
    3) sips --rotate 180 "$TMP/$b.jpg" >/dev/null ;;
    8) sips --rotate 270 "$TMP/$b.jpg" >/dev/null ;;
  esac

  sips --resampleHeightWidthMax 1600 "$TMP/$b.jpg" >/dev/null
  strip_meta "$TMP/$b.jpg"

  if swift tools/blur-bg.swift "$TMP/$b.jpg" "$TMP/$b.blur.jpg" "$BLUR_RADIUS" >/dev/null 2>&1; then
    mv "$TMP/$b.blur.jpg" "$TMP/$b.jpg"
    strip_meta "$TMP/$b.jpg"
    status="blurred"
  else
    status="NO SUBJECT — published unblurred, review it"
  fi

  if grep -qa Exif "$TMP/$b.jpg"; then status="$status  ** EXIF NOT STRIPPED **"; fail=1; fi

  cp "$TMP/$b.jpg" "plants/$b.jpg"
  cp "$TMP/$b.jpg" "app/public/plants/$b.jpg"
  echo "$status"
done
# Bump the ?v= cache-buster, or viewers keep seeing the previous photos from
# cache — filenames are identical between check-ins.
python3 tools/bump-cache-bust.py

echo "Published to plants/ and app/public/plants/."
exit $fail
