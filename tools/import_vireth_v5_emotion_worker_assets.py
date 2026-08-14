from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image


TARGET_SIZE = (560, 760)
SOURCE_EMOTIONS = ("happy", "angry", "sad", "anxious", "disgust", "surprised")
SLOT_SOURCES = {
    "n": "neutral",
    "sm": "happy",
    "p": "happy",
    "c": "anxious",
    "s": "sad",
    "a": "angry",
    "u": "surprised",
    "x": "neutral",
    "d": "disgust",
}


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
    output_quality: int
    output_sha256: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import the approved V5 transparent character set into Worker assets."
    )
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--emotion-output-root", type=Path, required=True)
    parser.add_argument("--character-output-root", type=Path, required=True)
    parser.add_argument("--mapping-output", type=Path, required=True)
    parser.add_argument("--manifest-output", type=Path, required=True)
    parser.add_argument("--quality", type=int, default=84)
    parser.add_argument("--minimum-quality", type=int, default=60)
    parser.add_argument("--method", type=int, choices=range(0, 7), default=4)
    parser.add_argument("--max-bytes", type=int, default=100_000)
    parser.add_argument(
        "--character-ids",
        nargs="+",
        help="Optional subset for tests or a bounded rebuild. Defaults to C001-C100.",
    )
    return parser.parse_args()


def expected_character_ids(values: list[str] | None) -> list[str]:
    if values is None:
        return [f"C{number:03d}" for number in range(1, 101)]
    normalized = [value.upper() for value in values]
    if len(set(normalized)) != len(normalized):
        raise RuntimeError("Character IDs must be unique")
    for character_id in normalized:
        if len(character_id) != 4 or character_id[0] != "C" or not character_id[1:].isdigit():
            raise RuntimeError(f"Invalid character ID: {character_id}")
    return sorted(normalized)


def source_paths(source_root: Path, character_id: str) -> dict[str, Path]:
    paths = {
        "neutral": source_root / "neutral" / f"{character_id}_neutral.png",
    }
    paths.update(
        {
            emotion: source_root
            / "emotions"
            / character_id
            / f"{character_id}_{emotion}.png"
            for emotion in SOURCE_EMOTIONS
        }
    )
    missing = [path for path in paths.values() if not path.is_file()]
    if missing:
        raise RuntimeError(f"Missing source assets: {', '.join(str(path) for path in missing)}")
    return paths


def validate_complete_source_set(source_root: Path, character_ids: list[str]) -> None:
    if len(character_ids) != 100:
        return
    expected = {
        source_root / "neutral" / f"{character_id}_neutral.png"
        for character_id in character_ids
    }
    expected.update(
        source_root / "emotions" / character_id / f"{character_id}_{emotion}.png"
        for character_id in character_ids
        for emotion in SOURCE_EMOTIONS
    )
    actual = set((source_root / "neutral").rglob("*.png"))
    actual.update((source_root / "emotions").rglob("*.png"))
    missing = sorted(expected - actual)
    unexpected = sorted(actual - expected)
    if missing or unexpected:
        raise RuntimeError(
            f"Expected exactly 700 production PNGs; missing={len(missing)}, unexpected={len(unexpected)}"
        )


def normalize_transparent_asset(
    source: Path,
) -> tuple[Image.Image, tuple[int, int, int, int], tuple[int, int]]:
    with Image.open(source) as opened:
        rgba = opened.convert("RGBA")
        source_size = rgba.size
        alpha = rgba.getchannel("A")
        alpha_bbox = alpha.getbbox()
        if alpha_bbox is None or alpha.getextrema()[0] >= 255:
            raise RuntimeError(f"Source has no usable transparency: {source}")

        target_w, target_h = TARGET_SIZE
        scale = min(target_w / rgba.width, target_h / rgba.height)
        resized = rgba.resize(
            (max(1, round(rgba.width * scale)), max(1, round(rgba.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
        canvas.alpha_composite(
            resized,
            ((target_w - resized.width) // 2, target_h - resized.height),
        )
        return canvas, alpha_bbox, source_size


def save_webp_with_budget(
    image: Image.Image,
    output: Path,
    *,
    quality: int,
    minimum_quality: int,
    method: int,
    max_bytes: int,
) -> tuple[int, int]:
    output.parent.mkdir(parents=True, exist_ok=True)
    for candidate_quality in range(quality, minimum_quality - 1, -2):
        image.save(output, "WEBP", quality=candidate_quality, method=method)
        output_bytes = output.stat().st_size
        if output_bytes <= max_bytes:
            return output_bytes, candidate_quality
    raise RuntimeError(f"Output exceeds {max_bytes} bytes at minimum quality: {output}")


def write_mapping(mapping: dict[str, dict[str, str]], output: Path) -> None:
    generated = (
        "// Generated by tools/import_vireth_v5_emotion_worker_assets.py. "
        "Do not edit by hand.\n"
        "export const GENERATED_TALK_EMOTIONS = "
        f"{json.dumps(mapping, ensure_ascii=False, indent=2)} as const;\n"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(generated, encoding="utf-8")


def main() -> None:
    args = parse_args()
    character_ids = expected_character_ids(args.character_ids)
    validate_complete_source_set(args.source_root, character_ids)

    records: list[AssetRecord] = []
    mapping: dict[str, dict[str, str]] = {}
    total = len(character_ids) * len(SLOT_SOURCES)
    completed = 0

    for character_id in character_ids:
        sources = source_paths(args.source_root, character_id)
        normalized = {
            emotion: normalize_transparent_asset(source)
            for emotion, source in sources.items()
        }
        mapping[character_id] = {}
        output_dir = args.emotion_output_root / character_id.lower()

        for code, emotion in SLOT_SOURCES.items():
            source = sources[emotion]
            image, alpha_bbox, source_size = normalized[emotion]
            output = output_dir / f"{code}.webp"
            output_bytes, output_quality = save_webp_with_budget(
                image,
                output,
                quality=args.quality,
                minimum_quality=args.minimum_quality,
                method=args.method,
                max_bytes=args.max_bytes,
            )
            mapping[character_id][code] = (
                f"/character-emotion-assets/{character_id.lower()}/{code}.webp"
            )
            records.append(
                AssetRecord(
                    character_id=character_id,
                    emotion=emotion,
                    code=code,
                    source=source.relative_to(args.source_root).as_posix(),
                    output=output.relative_to(args.emotion_output_root).as_posix(),
                    source_size=source_size,
                    alpha_bbox=alpha_bbox,
                    output_bytes=output_bytes,
                    output_quality=output_quality,
                    output_sha256=hashlib.sha256(output.read_bytes()).hexdigest(),
                )
            )
            completed += 1
            print(f"{completed}/{total} {character_id}:{code} {output_bytes} bytes q={output_quality}")

        neutral_image = normalized["neutral"][0]
        base_output = args.character_output_root / f"char-{character_id.lower()}.webp"
        save_webp_with_budget(
            neutral_image,
            base_output,
            quality=args.quality,
            minimum_quality=args.minimum_quality,
            method=args.method,
            max_bytes=args.max_bytes,
        )

    write_mapping(mapping, args.mapping_output)
    args.manifest_output.parent.mkdir(parents=True, exist_ok=True)
    args.manifest_output.write_text(
        json.dumps([asdict(record) for record in records], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {completed} emotion assets and {len(character_ids)} base portraits")


if __name__ == "__main__":
    main()
