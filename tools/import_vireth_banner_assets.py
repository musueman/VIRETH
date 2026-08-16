from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image


BANNER_SIZE = (1920, 684)


@dataclass(frozen=True)
class BannerAsset:
    id: str
    source: str
    output: str
    width: int
    height: int
    bytes: int


def layer_number(path: Path) -> int:
    match = re.search(r"(\d+)", path.stem)
    if not match:
        raise ValueError(f"Layer filename has no number: {path}")
    return int(match.group(1))


def save_webp(src: Path, dst: Path, quality: int) -> None:
    with Image.open(src) as image:
        if image.size != BANNER_SIZE:
            raise ValueError(f"Unexpected size for {src}: {image.size}")
        dst.parent.mkdir(parents=True, exist_ok=True)
        image.save(dst, "WEBP", quality=quality, method=6, exact=True)


def main() -> None:
    one_drive = Path("D:/OneDrive")
    project_root = next(path for path in one_drive.iterdir() if path.name.startswith("444_"))
    source_root = next(path for path in project_root.iterdir() if path.name.startswith("00_"))
    banner_root = next(path for path in source_root.iterdir() if path.name.startswith("10_"))
    layer_root = banner_root / "20260816"

    output_root = Path("workers/vireth-banner/public/b")
    manifest_path = Path("workers/vireth-banner/banner-assets.json")

    top_source = banner_root / "top.png"
    top_output = output_root / "t.webp"
    save_webp(top_source, top_output, quality=90)

    records: list[BannerAsset] = [
        BannerAsset(
            id="t",
            source=str(top_source),
            output=str(top_output.relative_to(output_root.parent).as_posix()),
            width=BANNER_SIZE[0],
            height=BANNER_SIZE[1],
            bytes=top_output.stat().st_size,
        )
    ]

    layers = sorted(layer_root.glob("*.png"), key=layer_number)
    for index, source in enumerate(layers, start=1):
        asset_id = f"{index:03d}"
        output = output_root / f"{asset_id}.webp"
        save_webp(source, output, quality=78)
        records.append(
            BannerAsset(
                id=asset_id,
                source=str(source),
                output=str(output.relative_to(output_root.parent).as_posix()),
                width=BANNER_SIZE[0],
                height=BANNER_SIZE[1],
                bytes=output.stat().st_size,
            )
        )

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps([asdict(record) for record in records], ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} banner assets to {output_root}")


if __name__ == "__main__":
    main()
