from pathlib import Path
import unittest

from tools.validate_vireth_intro_page import validate_intro


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "output" / "lunatalk_start_scenarios" / (
    "vireth_intro_start_situations_updated_full_20260802.html"
)


class VirethIntroContractTest(unittest.TestCase):
    def test_intro_contract(self) -> None:
        errors = validate_intro(TARGET)
        self.assertEqual([], errors, "\n".join(errors))


if __name__ == "__main__":
    unittest.main()
