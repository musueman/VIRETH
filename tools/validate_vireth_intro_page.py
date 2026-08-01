from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


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
EXPECTED_CHARACTER_IDX = "70170"
EXPECTED_ROOT_TAG = "div"
EXPECTED_START_CARDS = [
    "START 01",
    "START 02",
    "START 03",
    "START 04",
    "START 05",
    "START 06",
    "START 07",
    "START 08",
]
EXPECTED_START_CARD_TYPES = {
    "START 01": "기본 시작",
    "START 02": "역할형 시작",
    "START 03": "역할형 시작",
    "START 04": "역할형 시작",
    "START 05": "역할형 시작",
    "START 06": "역할형 시작",
    "START 07": "역할형 시작",
    "START 08": "역할형 시작",
}
EXPECTED_START_CARD_TITLES = {
    "START 01": "성문 앞에서 시작",
    "START 02": "비 오는 밤의 성문 근무",
    "START 03": "떠돌이 용병의 첫 계약",
    "START 04": "항구에서 묶인 짐",
    "START 05": "사냥꾼의 이상한 발자국",
    "START 06": "장터와 납품 장부",
    "START 07": "피난민 배급 줄",
    "START 08": "항만과 선착장의 새벽",
}
EXPECTED_START_IMAGES = {
    "START 01": "https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp",
    "START 02": "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-tiris-bekkellkar-ravenstone-imagegen-v1-scene-v2.webp",
    "START 03": "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b004-guild-inn-tradepost.webp",
    "START 04": "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b008-harbor-lighthouse-coast.webp",
    "START 05": "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b010-rural-forest-campsite.webp",
    "START 06": "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b002-market-square-trade-street.webp",
    "START 07": "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-senhalet-senpukum-imagegen-v1-scene-v2.webp",
    "START 08": "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-kelnabet-markelmir-imagegen-v1-scene-v2.webp",
}
ACCIDENT_FACTS = (
    "2026년 7월 15일경",
    "퇴근 중 교통사고",
    "갈비뼈 5개 골절",
    "양 손목 골절",
    "왼발 골절 수술",
    "비레스 업데이트가 예상보다 늦어졌습니다",
    "업데이트는 중단되지 않았고 앞으로도 꾸준히 이어갈 예정입니다",
)
UPDATE_FACTS = (
    "루나톡 기준으로 시작 선택 화면을 기본 시작 1개와 역할형 시작 7개, 총 8개로 다시 맞췄습니다.",
    "장터와 납품 장부, 피난민 배급 줄, 항만과 선착장의 새벽은 2026년 7월 28일 라이브 로어북 등록분을 반영했습니다.",
    "대화카드는 현재 장소의 배경을 따르고, 인물의 소속과 표식은 정본 기준을 따르도록 운용 규칙을 정리했습니다.",
    "v11 정본동기화 후보, v61 좌표보정 지도, v62 출판·웹용 선별 라벨 지도를 기준으로 문서 정합성을 계속 맞추고 있습니다.",
    "긴 웹툰형 이미지는 순차적으로 추가하고, 소개 화면에서는 도시·장소 배경 이미지를 분리해 보여주는 방향으로 정리했습니다.",
)
REN_DURAN_GUIDE_TEXT = "비레스를 먼저 걷고 있는 여행자, 렌과 듀란"
FORBIDDEN_GUIDE_CLAIMS = (
    "저자",
    "작성자",
    "모든 사건",
    "항상 등장",
    "전부 참여",
)
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
URL_REQUEST_HEADERS = {"User-Agent": "Mozilla/5.0"}


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
        self.character_indices: list[str] = []
        self.start_image_tags: list[str] = []
        self.start_image_alts: list[str] = []
        self.start_image_srcs: list[str] = []
        self.start_image_cards: list[str] = []
        self.image_srcs: list[str] = []
        self.remote_attributes: list[str] = []
        self.cta_records: list[tuple[str, str, str, str]] = []
        self.framed_sections: list[str] = []
        self.text_parts: list[str] = []
        self.start_card_texts: list[tuple[str, str]] = []
        self.start_card_titles: list[tuple[str, str]] = []
        self._active_card_id: str | None = None
        self._active_card_tag: str | None = None
        self._active_card_depth: int | None = None
        self._active_card_text: list[str] = []
        self._tag_stack: list[str] = []
        self._active_summary_card_id: str | None = None
        self._active_summary_depth: int | None = None
        self._summary_strong_titles: list[str] = []
        self._active_summary_strong_text: list[str] | None = None

    def _collect_start_tag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)

        for name, value in attrs:
            if name == "href" or (tag == "img" and name == "src"):
                self.remote_attributes.append(value or "")

        if "data-vireth-intro" in attributes:
            self.root_markers.append(attributes["data-vireth-intro"] or "")
            self.root_marker_tags.append(tag)

        if "data-character-idx" in attributes:
            self.character_indices.append(attributes["data-character-idx"] or "")

        if "data-section" in attributes:
            section = attributes["data-section"] or ""
            self.sections.append(section)
            if tag == "section" and "data-ui-frame" in attributes:
                self.framed_sections.append(section)

        if "data-start-card" in attributes:
            card_id = attributes["data-start-card"] or ""
            self.start_cards.append(card_id)
            self._active_card_id = card_id
            self._active_card_tag = tag
            self._active_card_depth = len(self._tag_stack)
            self._active_card_text = []

        if "data-start-image" in attributes:
            self.start_images.append(attributes["data-start-image"] or "")
            self.start_image_tags.append(tag)
            self.start_image_alts.append(attributes.get("alt") or "")
            self.start_image_srcs.append(attributes.get("src") or "")
            self.start_image_cards.append(self._active_card_id or "")

        if tag == "img":
            self.image_srcs.append(attributes.get("src") or "")

        if tag == "summary" and self._active_card_id is not None:
            self._active_summary_card_id = self._active_card_id
            self._active_summary_depth = len(self._tag_stack)
            self._summary_strong_titles = []

        if tag == "strong" and self._active_summary_card_id is not None:
            self._active_summary_strong_text = []

        if "data-ui-frame" in attributes:
            self.frames.append(attributes["data-ui-frame"] or "")

        if "data-cta" in attributes:
            cta = attributes["data-cta"] or ""
            self.ctas.append(cta)
            href = attributes.get("href") or ""
            self.cta_records.append(
                (
                    cta,
                    href,
                    attributes.get("target") or "",
                    attributes.get("rel") or "",
                )
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
        if tag not in VOID_TAGS:
            self._tag_stack.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._collect_start_tag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        if tag == "strong" and self._active_summary_strong_text is not None:
            self._summary_strong_titles.append("".join(self._active_summary_strong_text))
            self._active_summary_strong_text = None

        if (
            tag == "summary"
            and self._active_summary_card_id is not None
            and self._active_summary_depth == len(self._tag_stack) - 1
        ):
            title = self._summary_strong_titles[0] if len(self._summary_strong_titles) == 1 else ""
            self.start_card_titles.append((self._active_summary_card_id, title))
            self._active_summary_card_id = None
            self._active_summary_depth = None
            self._summary_strong_titles = []

        if (
            self._active_card_id is not None
            and tag == self._active_card_tag
            and self._active_card_depth == len(self._tag_stack) - 1
        ):
            self.start_card_texts.append(
                (self._active_card_id, "".join(self._active_card_text))
            )
            self._active_card_id = None
            self._active_card_tag = None
            self._active_card_depth = None
            self._active_card_text = []

        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)
        if self._active_card_id is not None:
            self._active_card_text.append(data)
        if self._active_summary_strong_text is not None:
            self._active_summary_strong_text.append(data)


def validate_intro(path: Path) -> list[str]:
    if not path.exists():
        return [f"missing output: {path}"]

    html = path.read_text(encoding="utf-8")
    parser = IntroParser()
    parser.feed(html)
    parser.close()
    text = "".join(parser.text_parts)
    errors: list[str] = []

    if parser.root_markers != ["20260802"] or parser.root_marker_tags != [EXPECTED_ROOT_TAG]:
        errors.append(
            f"root marker mismatch: {parser.root_markers} on {parser.root_marker_tags}"
        )
    if parser.character_indices != [EXPECTED_CHARACTER_IDX]:
        errors.append(f"character idx must be exactly {EXPECTED_CHARACTER_IDX}: {parser.character_indices}")
    if parser.sections != REQUIRED_SECTIONS:
        errors.append(f"section order mismatch: {parser.sections}")
    if len(parser.start_cards) != 8:
        errors.append(f"expected 8 start cards, found {len(parser.start_cards)}")
    if parser.start_cards != EXPECTED_START_CARDS:
        errors.append(f"start card order mismatch: {parser.start_cards}")
    for card_id, card_type in EXPECTED_START_CARD_TYPES.items():
        matching_cards = [text for current_id, text in parser.start_card_texts if current_id == card_id]
        if len(matching_cards) != 1 or card_type not in matching_cards[0]:
            errors.append(f"start card type mismatch: {card_id} expected {card_type}")
    for card_id, card_title in EXPECTED_START_CARD_TITLES.items():
        matching_titles = [title for current_id, title in parser.start_card_titles if current_id == card_id]
        if len(matching_titles) != 1 or matching_titles[0] != card_title:
            errors.append(f"start card title mismatch: {card_id} expected {card_title}")
    if len(parser.start_images) != 8:
        errors.append(f"expected 8 start images, found {len(parser.start_images)}")
    if len(set(parser.start_images)) != 8:
        errors.append("start card image URLs must be unique")
    if len(set(parser.start_image_srcs)) != 8:
        errors.append("rendered start card image URLs must be unique")
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
        declared_url = parser.start_images[index]
        rendered_url = parser.start_image_srcs[index]
        card_id = parser.start_image_cards[index]
        expected_url = EXPECTED_START_IMAGES.get(card_id)
        if declared_url != rendered_url:
            errors.append(f"start image URL mismatch: {declared_url} != {rendered_url}")
        if expected_url is None or declared_url != expected_url:
            errors.append(f"unsupported start image asset: {card_id} -> {declared_url}")
        if expected_url is not None and rendered_url != expected_url:
            errors.append(f"rendered start image asset mismatch: {card_id} -> {rendered_url}")

    for cta, href, target, rel in parser.cta_records:
        if cta != href:
            errors.append(f"CTA data-cta must match href: {cta} != {href}")
        if re.match(r"^https?://", href) and (
            target != "_blank" or rel != "noopener noreferrer"
        ):
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
        "막혔을 때 이렇게 불러보세요",
        "최근 달라진 점",
    ):
        if required_text not in text:
            errors.append(f"missing required text: {required_text}")

    for fact in ACCIDENT_FACTS:
        if fact not in text:
            errors.append(f"missing accident fact: {fact}")
    for fact in UPDATE_FACTS:
        if fact not in text:
            errors.append(f"missing 2026-08-01 update fact: {fact}")
    if REN_DURAN_GUIDE_TEXT not in text:
        errors.append("Ren/Duran guide role must remain traveler/visual-guide only")
    for claim in FORBIDDEN_GUIDE_CLAIMS:
        if claim in text:
            errors.append(
                f"Ren/Duran guide role must remain traveler/visual-guide only: {claim}"
            )

    return errors


def collect_remote_urls(path: Path) -> list[str]:
    if not path.exists():
        return []

    parser = IntroParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()

    remote_urls: list[str] = []
    seen: set[str] = set()
    for value in parser.remote_attributes:
        if urlparse(value).scheme.lower() not in {"http", "https"}:
            continue
        if value not in seen:
            seen.add(value)
            remote_urls.append(value)
    return remote_urls


def _check_url_response(url: str, method: str) -> str | None:
    request = Request(url, headers=URL_REQUEST_HEADERS, method=method)
    try:
        with urlopen(request, timeout=15) as response:
            status = response.getcode()
        if method == "HEAD" and status == 405:
            return _check_url_response(url, "GET")
    except HTTPError as error:
        status = error.code
        reason = error.reason
        error.close()
        if method == "HEAD" and status == 405:
            return _check_url_response(url, "GET")
        if 200 <= status <= 399:
            return None
        return f"{url}: HTTP {status} {reason}"
    except URLError as error:
        return f"{url}: {error}"
    except OSError as error:
        return f"{url}: {error}"

    if 200 <= status <= 399:
        return None
    return f"{url}: HTTP {status}"


def check_remote_urls(urls: list[str]) -> list[str]:
    errors: list[str] = []
    for url in urls:
        error = _check_url_response(url, "HEAD")
        if error is not None:
            errors.append(error)
    return errors


def main() -> int:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("path", type=Path)
    argument_parser.add_argument("--check-urls", action="store_true")
    args = argument_parser.parse_args()

    errors = validate_intro(args.path)
    if errors:
        for error in errors:
            print(error)
        return 1

    if args.check_urls:
        remote_urls = collect_remote_urls(args.path)
        url_errors = check_remote_urls(remote_urls)
        if url_errors:
            for error in url_errors:
                print(f"URL check failed: {error}")
            return 1
        print(f"OK: {len(remote_urls)} unique remote URLs reachable")

    print(f"OK: {args.path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
