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
ARCHIVE_BASE_URL = "https://vireth-starting-records.musueman.chatgpt.site/reader?v=24"
EXPECTED_STORY_SCENARIOS = (
    "gate-arrival",
    "gate-watch",
    "mercenary-contract",
    "held-cargo",
    "strange-tracks",
    "market-ledger",
    "ration-line",
    "harbor-dawn",
)
EXPECTED_STORY_URLS = tuple(
    f"{ARCHIVE_BASE_URL}#scenario={scenario}"
    for scenario in EXPECTED_STORY_SCENARIOS
)
EXPECTED_ARCHIVE_URL = EXPECTED_STORY_URLS[0]
EXPECTED_INTERNAL_START_URL = "#vireth-starts"
EXPECTED_CHARACTER_IDX = "70170"
EXPECTED_ROOT_TAG = "div"
EXPECTED_GUIDE_IMAGES = {
    "ren": "https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/ren-ending-guide.png",
    "duran": "https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/duran-ending-guide.png",
}
EXPECTED_STARTS_LEAD = (
    "처음 정한 길을 끝까지 따를 필요는 없습니다. "
    "지금 끌리는 장면에서 시작해 보세요."
)
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
UPDATE_HISTORY = (
    (
        "2026-08-02",
        "소개페이지와 이야기 서고 연결",
        "소개 화면을 비레스의 풍경과 렌·듀란 안내 이미지 중심으로 개편했습니다. 8개 시작 장면에서 각 상황과 이어지는 이야기 기록으로 바로 이동할 수 있습니다.",
    ),
    (
        "2026-07-29",
        "루나톡 대화와 인물 운용 정리",
        "대화카드 배경, 인물 표식, 감정 이미지 호출이 현재 장소와 인물 설정을 안정적으로 따르도록 정리했습니다. 고정 인물과 즉석 인물의 등장 범위를 나누고 역할별 설명을 다듬었습니다.",
    ),
    (
        "2026-07-27",
        "인물 감정 이미지 확장",
        "주요 인물들이 대화 장면의 감정과 분위기에 맞는 표정으로 등장하도록 이미지 구성을 확장했습니다.",
    ),
    (
        "2026-07-15",
        "새로운 시작 장면과 인물 표현 추가",
        "자유 여행자와 용병 계약 시작 장면을 추가했습니다. 장소 식별 기준과 역할별 즉석 인물 이미지를 연결했습니다.",
    ),
    (
        "2026-07-14",
        "장소·대화카드 표현 개선",
        "현재 지역과 장소를 한눈에 확인할 수 있는 장소 카드를 추가했습니다. 모바일에서도 대화카드의 인물 정보와 소속 표식이 읽히도록 조정했습니다.",
    ),
    (
        "2026-07-12",
        "비레스 5083 시작 안내 공개",
        "정해진 선택지 없이 주변 사람과 장소를 따라 움직이는 기본 시작 방식을 소개했습니다. 기본 시작과 역할형 시작을 고를 수 있는 안내를 마련했습니다.",
    ),
    (
        "2026-07-10",
        "지도와 도시 장면 연결",
        "도시·장소 배경을 대화에 불러오는 장면 시스템에 지역 지도를 연결했습니다. 현재 장소 표시를 더해 이동 흐름을 확인할 수 있게 했습니다.",
    ),
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
        self.meta_tags: int = 0
        self.iframes: int = 0
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
        self.link_records: list[tuple[str, str, str]] = []
        self.framed_sections: list[str] = []
        self.text_parts: list[str] = []
        self.start_card_texts: list[tuple[str, str]] = []
        self.start_card_titles: list[tuple[str, str]] = []
        self.guide_images: list[tuple[str, str]] = []
        self.story_archive_links: list[tuple[str, str, str, str]] = []
        self.summary_texts: list[str] = []
        self.update_dates: list[str] = []
        self.update_records: list[tuple[str, str]] = []
        self._active_card_id: str | None = None
        self._active_card_tag: str | None = None
        self._active_card_depth: int | None = None
        self._active_card_text: list[str] = []
        self._tag_stack: list[str] = []
        self._active_summary_card_id: str | None = None
        self._active_summary_depth: int | None = None
        self._summary_strong_titles: list[str] = []
        self._active_summary_strong_text: list[str] | None = None
        self._active_summary_text: list[str] | None = None
        self._active_update_date: str | None = None

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

        if "data-update-date" in attributes:
            update_date = attributes["data-update-date"] or ""
            self.update_dates.append(update_date)
            self._active_update_date = update_date

        if tag == "time" and self._active_update_date is not None:
            self.update_records.append(
                (self._active_update_date, attributes.get("datetime") or "")
            )

        if "data-start-image" in attributes:
            self.start_images.append(attributes["data-start-image"] or "")
            self.start_image_tags.append(tag)
            self.start_image_alts.append(attributes.get("alt") or "")
            self.start_image_srcs.append(attributes.get("src") or "")
            self.start_image_cards.append(self._active_card_id or "")

        if tag == "img":
            self.image_srcs.append(attributes.get("src") or "")
            if "data-guide" in attributes:
                self.guide_images.append(
                    (
                        attributes["data-guide"] or "",
                        attributes.get("src") or "",
                    )
                )

        if tag == "a" and "vireth-archive-link" in (
            attributes.get("class") or ""
        ).split():
            self.story_archive_links.append(
                (
                    self._active_card_id or "",
                    attributes.get("href") or "",
                    attributes.get("target") or "",
                    attributes.get("rel") or "",
                )
            )

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

        if tag == "a":
            self.link_records.append(
                (
                    attributes.get("href") or "",
                    attributes.get("target") or "",
                    attributes.get("rel") or "",
                )
            )

        if tag == "script":
            self.scripts += 1

        if tag == "meta":
            self.meta_tags += 1

        if tag == "iframe":
            self.iframes += 1

        if tag == "summary":
            self._active_summary_text = []
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
        if tag == "summary" and self._active_summary_text is not None:
            self.summary_texts.append(
                " ".join("".join(self._active_summary_text).split())
            )
            self._active_summary_text = None

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

        if tag == "li" and self._active_update_date is not None:
            self._active_update_date = None

        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)
        if self._active_card_id is not None:
            self._active_card_text.append(data)
        if self._active_summary_strong_text is not None:
            self._active_summary_strong_text.append(data)
        if self._active_summary_text is not None:
            self._active_summary_text.append(data)


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
    if EXPECTED_STARTS_LEAD not in text:
        errors.append("approved starts lead mismatch")
    if re.search(r"arcadia", html, re.IGNORECASE) or "아르카디아" in html:
        errors.append("deprecated public name found")
    if parser.scripts:
        errors.append("script tags are not allowed")
    if parser.meta_tags:
        errors.append("meta tags are not allowed in the LunaTalk fragment")
    if parser.iframes:
        errors.append("iframe tags are not allowed in the LunaTalk fragment")
    if parser.summary_background_urls:
        errors.append("summary elements must use real img elements, not CSS background URLs")

    if parser.framed_sections:
        errors.append(f"sections must not use data-ui-frame: {parser.framed_sections}")

    guide_images_by_role = dict(parser.guide_images)
    for role, expected_url in EXPECTED_GUIDE_IMAGES.items():
        if guide_images_by_role.get(role) != expected_url:
            errors.append(
                f"guide image mismatch: {role} expected {expected_url}"
            )
    if len(parser.guide_images) != len(EXPECTED_GUIDE_IMAGES):
        errors.append(
            f"expected {len(EXPECTED_GUIDE_IMAGES)} guide images, "
            f"found {len(parser.guide_images)}"
        )

    expected_story_links = list(zip(EXPECTED_START_CARDS, EXPECTED_STORY_URLS))
    for card_id, expected_url in expected_story_links:
        matching_links = [
            href
            for current_card_id, href, _, _ in parser.story_archive_links
            if current_card_id == card_id
        ]
        if matching_links != [expected_url]:
            errors.append(
                f"story archive link mismatch: {card_id} expected {expected_url}"
            )
    story_archive_urls = [href for _, href, _, _ in parser.story_archive_links]
    if len(story_archive_urls) != len(set(story_archive_urls)):
        errors.append("story archive scenario links must be unique")
    if len(parser.story_archive_links) != len(EXPECTED_START_CARDS):
        errors.append(
            f"expected {len(EXPECTED_START_CARDS)} story archive links, "
            f"found {len(parser.story_archive_links)}"
        )
    for card_id, _, target, rel in parser.story_archive_links:
        if target != "_blank" or rel != "noopener noreferrer":
            errors.append(
                "story archive link must use target=\"_blank\" "
                f"and rel=\"noopener noreferrer\": {card_id}"
            )

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
    for href, target, rel in parser.link_records:
        if urlparse(href).scheme.lower() not in {"http", "https"}:
            continue
        if target != "_blank" or rel != "noopener noreferrer":
            errors.append(
                "external link must use target=\"_blank\" "
                f"and rel=\"noopener noreferrer\": {href}"
            )

    for label in (f"START {index:02d}" for index in range(1, 9)):
        count = text.count(label)
        if count != 1:
            errors.append(f"expected {label} once, found {count}")

    for required_text in (
        "업데이트가 조금 늦어질 수 있습니다",
        "비레스 5083",
        "막혔을 때 이렇게 불러보세요",
    ):
        if required_text not in text:
            errors.append(f"missing required text: {required_text}")

    if parser.summary_texts.count("업데이트 내역") != 1:
        errors.append("update summary must be exactly: 업데이트 내역")
    if "최근 달라진 점" in text:
        errors.append("deprecated update summary found: 최근 달라진 점")

    expected_update_dates = [date for date, _, _ in UPDATE_HISTORY]
    if parser.update_dates != expected_update_dates:
        errors.append(
            "update history date order mismatch: "
            f"{parser.update_dates} != {expected_update_dates}"
        )
    if len(parser.update_records) != len(UPDATE_HISTORY):
        errors.append(
            "update history must contain exactly "
            f"{len(UPDATE_HISTORY)} semantic time records"
        )
    for update_date, time_datetime in parser.update_records:
        if update_date != time_datetime:
            errors.append(
                "update history date attributes must match: "
                f"{update_date} != {time_datetime}"
            )

    for fact in ACCIDENT_FACTS:
        if fact not in text:
            errors.append(f"missing accident fact: {fact}")
    for _, title, body in UPDATE_HISTORY:
        for fact in (title, body):
            if fact not in text:
                errors.append(f"missing update history fact: {fact}")
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
