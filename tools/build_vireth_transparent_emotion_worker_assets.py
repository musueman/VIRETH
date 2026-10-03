from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image


EMOTION_CODES = {
    "neutral": "EM01", "gentle-smile": "EM02", "joyful": "EM03", "laughing": "EM04",
    "relieved": "EM05", "confident": "EM06", "proud": "EM07", "affectionate": "EM08",
    "bashful": "EM09", "flustered": "EM10", "mischievous": "EM11", "curious": "EM12",
    "thinking": "EM13", "explaining": "EM14", "skeptical": "EM15", "confused": "EM16",
    "surprised": "EM17", "shocked": "EM18", "anxious": "EM19", "frightened": "EM20",
    "sorrowful": "EM21", "teary": "EM22", "sobbing": "EM23", "resigned": "EM24",
    "annoyed": "EM25", "angry": "EM26", "enraged": "EM27", "disgusted": "EM28",
    "scornful": "EM29", "determined": "EM30",
}
TARGET_SIZE = (560, 760)


@dataclass
class AssetRecord:
    character_id: str
    emotion: str
    code: str
    source: str
    output: str
    source_size: tuple[int, int]
    alpha_bbox: tuple[int, int, int, int]
    output_bytes: int
    output_sha256: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build V30 Worker WebP assets from approved transparent PNGs.")
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--mapping-output", type=Path, required=True)
    parser.add_argument("--manifest-output", type=Path, required=True)
    parser.add_argument("--progress-output", type=Path)
    parser.add_argument("--quality", type=int, default=84)
    parser.add_argument("--method", type=int, choices=range(0, 7), default=4)
    return parser.parse_args()


def character_directories(source_root: Path) -> list[Path]:
    directories = sorted(path for path in source_root.iterdir() if path.is_dir() and len(path.name) >= 4 and path.name[0] == "C" and path.name[1:4].isdigit())
    if not directories:
        raise RuntimeError("No character directories found")
    return directories


def source_for(character_dir: Path, character_id: str, code: str) -> Path:
    matches = sorted(character_dir.glob(f"{character_id}_{code}_*.png"))
    if len(matches) != 1:
        raise RuntimeError(f"Expected one {code} PNG for {character_id}, found {len(matches)}")
    return matches[0]


def normalize(source: Path) -> tuple[Image.Image, tuple[int, int, int, int], tuple[int, int]]:
    with Image.open(source) as opened:
        rgba = opened.convert("RGBA")
        alpha = rgba.getchannel("A")
        if alpha.getextrema()[0] >= 255 or alpha.getextrema()[1] <= 0:
            raise RuntimeError(f"Source has no usable transparency: {source}")
        alpha_bbox = alpha.getbbox()
        if alpha_bbox is None:
            raise RuntimeError(f"Source alpha is empty: {source}")
        scale = min(TARGET_SIZE[0] / rgba.width, TARGET_SIZE[1] / rgba.height)
        resized = rgba.resize((max(1, round(rgba.width * scale)), max(1, round(rgba.height * scale))), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", TARGET_SIZE, (255, 255, 255, 0))
        canvas.alpha_composite(resized, ((TARGET_SIZE[0] - resized.width) // 2, TARGET_SIZE[1] - resized.height))
        return canvas, alpha_bbox, rgba.size


def write_progress(path: Path | None, state: str, completed: int, total: int, current: str) -> None:
    if path is not None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"state": state, "completed": completed, "total": total, "remaining": total - completed, "current": current}, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    directories = character_directories(args.source_root)
    total, completed = len(directories) * len(EMOTION_CODES), 0
    mapping: dict[str, dict[str, str]] = {}
    records: list[AssetRecord] = []
    write_progress(args.progress_output, "running", completed, total, "")
    for directory in directories:
        character_id = directory.name[:4].upper()
        output_dir = args.output_root / character_id.lower()
        output_dir.mkdir(parents=True, exist_ok=True)
        mapping[character_id] = {}
        for slot, (emotion, code) in enumerate(EMOTION_CODES.items(), 1):
            source = source_for(directory, character_id, code)
            image, alpha_bbox, source_size = normalize(source)
            output = output_dir / f"{slot:02d}.webp"
            image.save(output, "WEBP", quality=args.quality, method=args.method)
            if output.stat().st_size > 120_000:
                raise RuntimeError(f"Output exceeds 120 KB target: {output}")
            mapping[character_id][emotion] = f"/character-emotion-assets/{character_id.lower()}/{slot:02d}.webp"
            records.append(AssetRecord(character_id, emotion, code, source.relative_to(args.source_root).as_posix(), output.relative_to(args.output_root).as_posix(), source_size, alpha_bbox, output.stat().st_size, hashlib.sha256(output.read_bytes()).hexdigest()))
            completed += 1
            write_progress(args.progress_output, "running", completed, total, f"{character_id}:{emotion}")
    args.mapping_output.parent.mkdir(parents=True, exist_ok=True)
    args.mapping_output.write_text("// Generated by tools/build_vireth_transparent_emotion_worker_assets.py. Do not edit by hand.\nexport const GENERATED_TALK_EMOTIONS = " + json.dumps(mapping, ensure_ascii=False, indent=2) + " as const;\n", encoding="utf-8")
    args.manifest_output.parent.mkdir(parents=True, exist_ok=True)
    args.manifest_output.write_text(json.dumps([asdict(record) for record in records], ensure_ascii=False, indent=2), encoding="utf-8")
    write_progress(args.progress_output, "completed", completed, total, "")
    print(f"Wrote {completed} assets for {len(mapping)} characters")


if __name__ == "__main__":
    main()
