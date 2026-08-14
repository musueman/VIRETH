from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "import_vireth_v5_emotion_worker_assets.py"
SOURCE_EMOTIONS = ("happy", "angry", "sad", "anxious", "disgust", "surprised")


def write_transparent_fixture(path: Path, color: tuple[int, int, int, int]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGBA", (240, 320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((40, 24, 200, 319), radius=24, fill=color)
    image.save(path)


class VirethV5EmotionImportTest(unittest.TestCase):
    def test_builds_nine_compatible_slots_and_neutral_base_portrait(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temporary = Path(temporary_directory)
            source = temporary / "source"
            emotion_output = temporary / "emotion"
            character_output = temporary / "character"
            mapping_output = temporary / "generated-talk-emotions.ts"
            manifest_output = temporary / "manifest.json"

            write_transparent_fixture(
                source / "neutral" / "C001_neutral.png", (35, 70, 120, 255)
            )
            for index, emotion in enumerate(SOURCE_EMOTIONS, start=1):
                write_transparent_fixture(
                    source / "emotions" / "C001" / f"C001_{emotion}.png",
                    (30 * index, 20 * index, 15 * index, 255),
                )

            completed = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--source-root",
                    str(source),
                    "--emotion-output-root",
                    str(emotion_output),
                    "--character-output-root",
                    str(character_output),
                    "--mapping-output",
                    str(mapping_output),
                    "--manifest-output",
                    str(manifest_output),
                    "--character-ids",
                    "C001",
                ],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            self.assertEqual(completed.returncode, 0, completed.stderr)

            expected_codes = {"n", "sm", "p", "c", "s", "a", "u", "x", "d"}
            output_files = {path.stem for path in (emotion_output / "c001").glob("*.webp")}
            self.assertEqual(output_files, expected_codes)

            manifest = json.loads(manifest_output.read_text(encoding="utf-8"))
            self.assertEqual(len(manifest), 9)
            sources_by_code = {record["code"]: record["source"] for record in manifest}
            self.assertEqual(sources_by_code["sm"], "emotions/C001/C001_happy.png")
            self.assertEqual(sources_by_code["p"], "emotions/C001/C001_happy.png")
            self.assertEqual(sources_by_code["x"], "neutral/C001_neutral.png")
            self.assertEqual(sources_by_code["d"], "emotions/C001/C001_disgust.png")

            for path in (emotion_output / "c001").glob("*.webp"):
                with Image.open(path) as image:
                    self.assertEqual(image.size, (560, 760))
                    self.assertEqual(image.mode, "RGBA")
                    self.assertLess(image.getchannel("A").getextrema()[0], 255)
                self.assertLessEqual(path.stat().st_size, 120_000)

            base_portrait = character_output / "char-c001.webp"
            with Image.open(base_portrait) as image:
                self.assertEqual(image.size, (560, 760))
                self.assertEqual(image.mode, "RGBA")

            self.assertEqual(
                hashlib.sha256(base_portrait.read_bytes()).hexdigest(),
                hashlib.sha256((emotion_output / "c001" / "n.webp").read_bytes()).hexdigest(),
            )
            generated_mapping = mapping_output.read_text(encoding="utf-8")
            self.assertIn('"d": "/character-emotion-assets/c001/d.webp"', generated_mapping)


if __name__ == "__main__":
    unittest.main()
