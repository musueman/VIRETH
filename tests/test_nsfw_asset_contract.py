from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "n"
LUNATALK_RULES = ROOT / "docs" / "lunatalk" / "Vireth_루나톡_NSFW_이미지호출_v2.md"
ACTIVE_LOREBOOK = ROOT / "docs" / "lunatalk" / "Arcadia_루나톡_로어북_성인이미지_호출_v1.md"

CHARACTER_NUMBERS = (
    "03", "05", "06", "07", "09", "13", "15", "16", "17", "19",
    "23", "25", "26", "27", "29", "33", "35", "36", "37", "39",
    "43", "45", "46", "47", "49", "53", "55", "56", "57", "59",
    "63", "65", "66", "67", "69", "73", "75", "76", "77", "79",
    "83", "85", "86", "87", "89", "93", "95", "96", "97", "99",
)

SLOTS = (
    ("01", "키스", "01_base_foreplay_kiss"),
    ("02", "가슴 애무", "02_base_foreplay_breast_caress"),
    ("03", "손가락 애무", "03_base_foreplay_fingering"),
    ("04", "핸드잡", "05_base_foreplay_handjob"),
    ("05", "펠라치오", "06_base_foreplay_fellatio"),
    ("06", "딥스로트", "07_base_foreplay_deepthroat"),
    ("07", "파이즈리", "08_base_foreplay_paizuri"),
    ("08", "69", "09_base_foreplay_69"),
    ("09", "정상위 진행", "10_base_sex_missionary"),
    ("10", "정상위 절정", "11_climax_sex_missionary"),
    ("11", "후배위 진행", "12_base_sex_doggy"),
    ("12", "후배위 절정", "13_climax_sex_doggy"),
    ("13", "기승위 진행", "14_base_sex_cowgirl"),
    ("14", "기승위 절정", "15_climax_sex_cowgirl"),
    ("15", "측위 진행", "16_base_sex_side"),
    ("16", "측위 절정", "17_climax_sex_side"),
    ("17", "대면좌위 진행", "18_base_sex_face_to_face_sitting"),
    ("18", "대면좌위 절정", "19_climax_sex_face_to_face_sitting"),
    ("19", "들박 절정", "20b_climax_sex_lifted"),
    ("20", "풀넬슨 진행", "21_base_sex_full_nelson"),
    ("21", "풀넬슨 절정", "22_climax_sex_full_nelson"),
    ("22", "풀넬슨 절정·여성 실금 변형", "22b_climax_sex_full_nelson_female_incontinence"),
    ("23", "교배프레스 진행", "23_base_sex_mating_press"),
    ("24", "교배프레스 절정", "24_climax_sex_mating_press"),
)


class NsfwAssetContractTest(unittest.TestCase):
    def test_upload_directory_has_only_the_current_1200_webps(self):
        names = sorted(path.name for path in ASSET_DIR.iterdir() if path.is_file())
        expected = sorted(
            f"{character}_{slot}.webp"
            for character in CHARACTER_NUMBERS
            for slot, _, _ in SLOTS
        )
        self.assertEqual(names, expected)
        self.assertTrue(all(re.fullmatch(r"\d{2}_\d{2}\.webp", name) for name in names))

    def test_lunatalk_rules_map_every_filename_slot_to_the_scene(self):
        text = LUNATALK_RULES.read_text(encoding="utf-8")
        self.assertIn("/n/NN_SS.webp", text)
        self.assertIn("C003 → 03", text)
        for slot, korean_name, scene_id in SLOTS:
            self.assertIn(f"| {slot} | {korean_name} | `{scene_id}` |", text)

    def test_active_lorebook_uses_the_same_filename_and_slot_contract(self):
        text = ACTIVE_LOREBOOK.read_text(encoding="utf-8")
        self.assertIn("/n/NN_SS.webp", text)
        self.assertIn("C006→06", text)
        self.assertIn("08 69", text)
        self.assertIn("19 들박 절정", text)
        self.assertNotIn("{C}_{SS}", text)
        self.assertNotIn("08 정상위 진행", text)
        self.assertNotIn("18 들박 진행", text)


if __name__ == "__main__":
    unittest.main()
