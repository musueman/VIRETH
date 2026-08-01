from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


REQUIRED_SECTIONS = [
    "notice",
    "intro",
    "starts",
    "play-flow",
    "commands",
    "updates",
]
ALLOWED_FRAMES = {
    "notice",
    "cta",
    "start-card",
    "details-control",
}
EXPECTED_ARCHIVE_URL = (
    "https://vireth-starting-records.musueman.chatgpt.site/#story-starts"
)
EXPECTED_INTERNAL_START_URL = "#vireth-starts"


class IntroParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.sections: list[str] = []
        self.start_cards: list[str] = []
        self.start_images: list[str] = []
        self.frames: list[str] = []
        self.ctas: list[str] = []
        self.scripts: int = 0
        self.summary_background_urls: list[str] = []

        self.root_markers: list[str] = []
        self.root_marker_tags: list[str] = []
        self.start_image_tags: list[str] = []
        self.start_image_alts: list[str] = []
        self.external_ctas: list[tuple[str, str, str]] = []
        self.framed_sections: list[str] = []
        self.text_parts: list[str] = []

    def _collect_start_tag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)

        if "data-vireth-intro" in attributes:
            self.root_markers.append(attributes["data-vireth-intro"] or "")
            self.root_marker_tags.append(tag)

        if "data-section" in attributes:
            section = attributes["data-section"] or ""
            self.sections.append(section)
            if tag == "section" and "data-ui-frame" in attributes:
                self.framed_sections.append(section)

        if "data-start-card" in attributes:
            self.start_cards.append(attributes["data-start-card"] or "")

        if "data-start-image" in attributes:
            self.start_images.append(attributes["data-start-image"] or "")
            self.start_image_tags.append(tag)
            self.start_image_alts.append(attributes.get("alt") or "")

        if "data-ui-frame" in attributes:
            self.frames.append(attributes["data-ui-frame"] or "")

        if "data-cta" in attributes:
            cta = attributes["data-cta"] or ""
            self.ctas.append(cta)
            href = attributes.get("href") or ""
            if re.match(r"^https?://", cta) or re.match(r"^https?://", href):
                self.external_ctas.append(
                    (href or cta, attributes.get("target") or "", attributes.get("rel") or "")
                )

        if tag == "script":
            self.scripts += 1

        if tag == "summary":
            style = attributes.get("style") or ""
            self.summary_background_urls.extend(
                re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", style, re.IGNORECASE)
            )

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._collect_start_tag(tag, attrs)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._collect_start_tag(tag, attrs)

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)


def validate_intro(path: Path) -> list[str]:
    if not path.exists():
        return [f"missing output: {path}"]

    html = path.read_text(encoding="utf-8")
    parser = IntroParser()
    parser.feed(html)
    parser.close()
    text = "".join(parser.text_parts)
    errors: list[str] = []

    if parser.root_markers != ["20260802"] or parser.root_marker_tags != ["html"]:
        errors.append(
            f"root marker mismatch: {parser.root_markers} on {parser.root_marker_tags}"
        )
    if parser.sections != REQUIRED_SECTIONS:
        errors.append(f"section order mismatch: {parser.sections}")
    if len(parser.start_cards) != 8:
        errors.append(f"expected 8 start cards, found {len(parser.start_cards)}")
    if len(parser.start_images) != 8:
        errors.append(f"expected 8 start images, found {len(parser.start_images)}")
    if len(set(parser.start_images)) != 8:
        errors.append("start card image URLs must be unique")
    if set(parser.frames) - ALLOWED_FRAMES:
        errors.append(f"unsupported framed regions: {sorted(set(parser.frames) - ALLOWED_FRAMES)}")
    if EXPECTED_ARCHIVE_URL not in parser.ctas:
        errors.append("missing production story archive CTA")
    if EXPECTED_INTERNAL_START_URL not in parser.ctas:
        errors.append("missing internal start-scene CTA")
    if "Arcadia" in html or "아르카디아" in html:
        errors.append("deprecated public name found")
    if parser.scripts:
        errors.append("script tags are not allowed")
    if parser.summary_background_urls:
        errors.append("summary elements must use real img elements, not CSS background URLs")

    if parser.framed_sections:
        errors.append(f"sections must not use data-ui-frame: {parser.framed_sections}")

    for index, tag in enumerate(parser.start_image_tags):
        if tag != "img":
            errors.append(f"start image {index + 1} must be an img element")
        if not parser.start_image_alts[index].strip():
            errors.append(f"start image {index + 1} must have non-empty alt text")

    for href, target, rel in parser.external_ctas:
        if target != "_blank" or rel != "noopener noreferrer":
            errors.append(
                f"external CTA must use target=\"_blank\" and rel=\"noopener noreferrer\": {href}"
            )

    for label in (f"START {index:02d}" for index in range(1, 9)):
        count = text.count(label)
        if count != 1:
            errors.append(f"expected {label} once, found {count}")

    for required_text in (
        "업데이트가 조금 늦어질 수 있습니다",
        "비레스 5083",
        "렌과 듀란",
        "막혔을 때 이렇게 불러보세요",
        "최근 달라진 점",
    ):
        if required_text not in text:
            errors.append(f"missing required text: {required_text}")

    return errors


def main() -> int:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("path", type=Path)
    args = argument_parser.parse_args()

    errors = validate_intro(args.path)
    if errors:
        for error in errors:
            print(error)
        return 1

    print(f"OK: {args.path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
