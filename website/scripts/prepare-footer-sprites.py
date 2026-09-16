"""Package approved animated WebP frames without redrawing source artwork."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('D:/OneDrive/333_죽지않는기사와_비단요람/004_챗봇제작자료/004_쳇봇에 올라 갈이미지')
CLIPS = {
    'duran-idle': ('005_듀란/002_webp원본/edit/기본/기본3_10F.webp', 287),
    'duran-smile': ('005_듀란/002_webp원본/edit/미소/미소1_10F.webp', 287),
    'bobo-walk': ('006_캐릭터/000_보보/edit/걷기/걷기.webp', 258),
    'bobo-sniff': ('006_캐릭터/000_보보/edit/기본/기본킁킁a.webp', 252),
}
target = ROOT / 'public/assets/footer'
target.mkdir(parents=True, exist_ok=True)
manifest = {}
for name, (relative, ground) in CLIPS.items():
    path = SOURCE / relative
    with Image.open(path) as animation:
        atlas = Image.new('RGBA', (160 * animation.n_frames, 160))
        durations = []
        for frame in range(animation.n_frames):
            animation.seek(frame)
            rgba = animation.convert('RGBA')
            durations.append(animation.info.get('duration', 100))
            tile = Image.new('RGBA', (300, 300))
            tile.paste(rgba, (0, 300-ground))
            atlas.paste(tile.resize((160,160), Image.Resampling.LANCZOS), (frame*160, 0))
        atlas.save(target / f'{name}.webp', lossless=True, method=6)
        manifest[name] = {'src': f'/assets/footer/{name}.webp', 'frames': animation.n_frames,
                          'durations': durations, 'source': str(path),
                          'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest()}
(target / 'provenance.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({key: {'frames': value['frames'], 'bytes': (target/f'{key}.webp').stat().st_size} for key,value in manifest.items()}))
