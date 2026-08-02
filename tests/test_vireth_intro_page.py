from pathlib import Path
from tempfile import TemporaryDirectory
import textwrap
import unittest
from urllib.error import HTTPError, URLError
from unittest.mock import patch

from tools import validate_vireth_intro_page as validator
from tools.validate_vireth_intro_page import validate_intro


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "output" / "lunatalk_start_scenarios" / (
    "vireth_intro_start_situations_updated_full_20260802.html"
)

ARCHIVE_BASE_URL = "https://vireth-starting-records.musueman.chatgpt.site/reader?v=24"
STORY_SCENARIOS = (
    "gate-arrival",
    "gate-watch",
    "mercenary-contract",
    "held-cargo",
    "strange-tracks",
    "market-ledger",
    "ration-line",
    "harbor-dawn",
)
STORY_URLS = tuple(
    f"{ARCHIVE_BASE_URL}#scenario={scenario}" for scenario in STORY_SCENARIOS
)
ARCHIVE_URL = STORY_URLS[0]
GUIDE_IMAGES = {
    "ren": "https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/ren-ending-guide.png",
    "duran": "https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/duran-ending-guide.png",
}
STARTS_LEAD = (
    "처음 정한 길을 끝까지 따를 필요는 없습니다. "
    "지금 끌리는 장면에서 시작해 보세요."
)
START_CARDS = [
    (
        "START 01",
        "기본 시작",
        "성문 앞에서 시작",
        "https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp",
    ),
    (
        "START 02",
        "역할형 시작",
        "비 오는 밤의 성문 근무",
        "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-tiris-bekkellkar-ravenstone-imagegen-v1-scene-v2.webp",
    ),
    (
        "START 03",
        "역할형 시작",
        "떠돌이 용병의 첫 계약",
        "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b004-guild-inn-tradepost.webp",
    ),
    (
        "START 04",
        "역할형 시작",
        "항구에서 묶인 짐",
        "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b008-harbor-lighthouse-coast.webp",
    ),
    (
        "START 05",
        "역할형 시작",
        "사냥꾼의 이상한 발자국",
        "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b010-rural-forest-campsite.webp",
    ),
    (
        "START 06",
        "역할형 시작",
        "장터와 납품 장부",
        "https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b002-market-square-trade-street.webp",
    ),
    (
        "START 07",
        "역할형 시작",
        "피난민 배급 줄",
        "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-senhalet-senpukum-imagegen-v1-scene-v2.webp",
    ),
    (
        "START 08",
        "역할형 시작",
        "항만과 선착장의 새벽",
        "https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-kelnabet-markelmir-imagegen-v1-scene-v2.webp",
    ),
]
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
        "소개 화면을 비레스의 풍경과 렌·듀란 안내 이미지 중심으로 개편했습니다. 8개 시작 장면에서 각 상황과 이어지는 기록으로 바로 이동하고, 이야기 서고 안에서도 다른 시작 흐름과 여행 안내로 이어갈 수 있게 했습니다.",
    ),
    (
        "2026-08-01",
        "비레스 5083 이야기 서고 공개",
        "8개 시작 흐름과 연결된 기록 14편을 공개했습니다. 삽화 30장과 글마다 별도로 정리한 초심자 참고 설명 14세트를 함께 제공해 낯선 시간, 화폐, 행정과 생활 맥락을 읽기 쉽게 했습니다.",
    ),
    (
        "2026-07-31",
        "세계관 정본과 지도 기준 정리",
        "비레스의 역사, 현재 갈등, 생산, 생계와 물류 정보를 하나의 최신 기준으로 정리했습니다. 20개 권역과 166개 장소를 기준으로 문장, 좌표, 장소 표식과 출판·웹용 지도를 다시 맞췄습니다.",
    ),
    (
        "2026-07-29",
        "루나톡 대화와 인물 운용 정리",
        "대화카드 배경, 인물 표식, 감정 이미지 호출이 현재 장소와 인물 설정을 안정적으로 따르도록 정리했습니다. 고정 인물과 즉석 인물의 등장 범위를 나누고 역할별 설명을 다듬었습니다.",
    ),
    (
        "2026-07-27",
        "인물 감정 이미지 확장",
        "주요 인물 100명이 대화 장면의 감정과 분위기에 맞게 등장하도록 인물별 8가지, 총 800장의 감정 이미지를 연결했습니다.",
    ),
    (
        "2026-07-15",
        "새로운 시작 장면과 인물 표현 추가",
        "자유 여행자와 용병 계약 시작 장면을 추가했습니다. 장소 식별 기준과 경비, 상인, 민간인, 학자 등 역할별 즉석 인물 이미지를 연결했습니다.",
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


def canonical_fixture() -> str:
    cards = "\n".join(
        f'''<details data-start-card="{card_id}" data-ui-frame="start-card">
  <summary><img data-start-image="{image_url}" src="{image_url}" alt="{title}">
    <span>{card_id} · {kind}</span><strong>{title}</strong>
  </summary>
  <div>상황 설명. 예시 입력: 주변을 살핀다. !역할시작
    <a class="vireth-archive-link" href="{STORY_URLS[index]}" target="_blank" rel="noopener noreferrer">이 시작과 이어지는 이야기 읽기</a>
  </div>
</details>'''
        for index, (card_id, kind, title, image_url) in enumerate(START_CARDS)
    )
    accident = " ".join(ACCIDENT_FACTS)
    updates = "\n".join(
        f'''<li data-update-date="{date}">
  <time datetime="{date}">{date.replace("-", ". ")}.</time>
  <div><strong>{title}</strong><p>{body}</p></div>
</li>'''
        for date, title, body in UPDATE_HISTORY
    )
    return textwrap.dedent(
        f'''\
        <div id="vireth-intro-20260802" data-vireth-intro="20260802" data-character-idx="70170">
          <div data-section="notice"><div data-ui-frame="notice">업데이트가 조금 늦어질 수 있습니다. {accident}</div></div>
          <div data-section="updates"><details data-ui-frame="details-control"><summary>업데이트 내역</summary><div><ol class="vireth-update-timeline">{updates}</ol></div></details></div>
          <div data-section="intro">
            <h1>비레스 5083</h1>
            <p>비레스를 먼저 걷고 있는 여행자, 렌과 듀란</p>
            <img src="https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp" alt="도시">
            <img data-guide="ren" src="{GUIDE_IMAGES["ren"]}" alt="렌">
            <img data-guide="duran" src="{GUIDE_IMAGES["duran"]}" alt="듀란">
            <a data-cta="#vireth-starts" href="#vireth-starts">비레스를 먼저 둘러보기</a>
            <a data-cta="{ARCHIVE_URL}" href="{ARCHIVE_URL}" target="_blank" rel="noopener noreferrer">이야기 읽기</a>
          </div>
          <div data-section="starts"><p>{STARTS_LEAD}</p>{cards}</div>
          <div data-section="play-flow"><p>장면을 고릅니다</p></div>
          <div data-section="commands"><details data-ui-frame="details-control"><summary>막혔을 때 이렇게 불러보세요</summary></details></div>
        </div>'''
    )


def validate_fixture(html: str) -> list[str]:
    with TemporaryDirectory() as temporary_directory:
        path = Path(temporary_directory) / "fixture.html"
        path.write_text(html, encoding="utf-8")
        return validate_intro(path)


class FakeResponse:
    def __init__(self, status: int, url: str) -> None:
        self.status = status
        self.url = url

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def getcode(self) -> int:
        return self.status

    def geturl(self) -> str:
        return self.url


def remote_api(name: str):
    function = getattr(validator, name, None)
    if function is None:
        raise AssertionError(f"validator API is missing: {name}")
    return function


class VirethIntroRemoteUrlTest(unittest.TestCase):
    def test_collect_remote_urls_returns_unique_http_urls_in_document_order(self) -> None:
        html = """
        <a href="https://example.test/archive">archive</a>
        <a href="#local">local</a>
        <img src="https://example.test/image.webp">
        <img src="https://example.test/image.webp">
        <a href="http://example.test/icon.svg">icon</a>
        <a href="mailto:test@example.test">mail</a>
        """

        with TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "fixture.html"
            path.write_text(html, encoding="utf-8")

            urls = remote_api("collect_remote_urls")(path)

        self.assertEqual(
            [
                "https://example.test/archive",
                "https://example.test/image.webp",
                "http://example.test/icon.svg",
            ],
            urls,
        )

    @patch("tools.validate_vireth_intro_page.urlopen", create=True)
    def test_check_remote_urls_accepts_successful_head(self, urlopen) -> None:
        requests = []

        def respond(request, timeout):
            requests.append((request.get_method(), request.full_url, timeout))
            return FakeResponse(200, request.full_url)

        urlopen.side_effect = respond

        self.assertEqual(
            [], remote_api("check_remote_urls")(["https://example.test/asset.webp"])
        )
        self.assertEqual(
            [("HEAD", "https://example.test/asset.webp", 15)],
            requests,
        )

    @patch("tools.validate_vireth_intro_page.urlopen", create=True)
    def test_check_remote_urls_falls_back_to_get_for_head_405(self, urlopen) -> None:
        requests = []
        url = "https://example.test/head-rejected.webp"

        def respond(request, timeout):
            requests.append((request.get_method(), request.full_url, timeout))
            if request.get_method() == "HEAD":
                raise HTTPError(url, 405, "Method Not Allowed", {}, None)
            return FakeResponse(200, url)

        urlopen.side_effect = respond

        self.assertEqual([], remote_api("check_remote_urls")([url]))
        self.assertEqual(["HEAD", "GET"], [method for method, _, _ in requests])

    @patch("tools.validate_vireth_intro_page.urlopen", create=True)
    def test_check_remote_urls_accepts_final_response_after_redirect(self, urlopen) -> None:
        source_url = "https://example.test/redirect"
        final_url = "https://cdn.example.test/asset.webp"
        urlopen.return_value = FakeResponse(200, final_url)

        self.assertEqual([], remote_api("check_remote_urls")([source_url]))
        request = urlopen.call_args.args[0]
        self.assertEqual("HEAD", request.get_method())
        self.assertEqual(source_url, request.full_url)

    @patch("tools.validate_vireth_intro_page.urlopen", create=True)
    def test_check_remote_urls_reports_failing_http_status(self, urlopen) -> None:
        url = "https://example.test/missing.webp"
        urlopen.side_effect = HTTPError(url, 404, "Not Found", {}, None)

        errors = remote_api("check_remote_urls")([url])

        self.assertEqual(1, len(errors))
        self.assertIn(url, errors[0])
        self.assertIn("HTTP 404", errors[0])

    @patch("tools.validate_vireth_intro_page.urlopen", create=True)
    def test_check_remote_urls_reports_transport_error(self, urlopen) -> None:
        url = "https://example.test/offline.webp"
        urlopen.side_effect = URLError("connection refused")

        errors = remote_api("check_remote_urls")([url])

        self.assertEqual(1, len(errors))
        self.assertIn(url, errors[0])
        self.assertIn("connection refused", errors[0])


class VirethIntroContractTest(unittest.TestCase):
    def test_intro_contract(self) -> None:
        errors = validate_intro(TARGET)
        self.assertEqual([], errors, "\n".join(errors))

    def test_updates_follow_notice_before_intro(self) -> None:
        parser = validator.IntroParser()
        parser.feed(TARGET.read_text(encoding="utf-8"))
        parser.close()

        self.assertEqual(
            ["notice", "updates", "intro", "starts", "play-flow", "commands"],
            parser.sections,
        )

    def test_canonical_fixture_satisfies_full_contract(self) -> None:
        self.assertEqual([], validate_fixture(canonical_fixture()))

    def test_update_history_preserves_legacy_dates_and_verified_counts(self) -> None:
        html = canonical_fixture()
        dates = tuple(date for date, _, _ in UPDATE_HISTORY)

        self.assertEqual(
            dates,
            (
                "2026-08-02",
                "2026-08-01",
                "2026-07-31",
                "2026-07-29",
                "2026-07-27",
                "2026-07-15",
                "2026-07-14",
                "2026-07-12",
                "2026-07-10",
            ),
        )
        for fact in ("8개", "14편", "30장", "14세트", "20개 권역", "166개 장소", "100명", "800장"):
            self.assertIn(fact, html)

    def test_rejects_wrong_start_order_and_role_mix(self) -> None:
        html = canonical_fixture()
        html = html.replace(
            'data-start-card="START 01"', 'data-start-card="TEMP"', 1
        )
        html = html.replace(
            'data-start-card="START 02"', 'data-start-card="START 01"', 1
        )
        html = html.replace('data-start-card="TEMP"', 'data-start-card="START 02"', 1)

        errors = validate_fixture(html)

        self.assertIn("start card order mismatch", "\n".join(errors))
        self.assertIn("start card type mismatch", "\n".join(errors))

    def test_rejects_swapped_start_titles(self) -> None:
        first_title = START_CARDS[0][2]
        second_title = START_CARDS[1][2]
        html = canonical_fixture()
        html = html.replace(
            f"<strong>{first_title}</strong>",
            "<strong>TITLE_PLACEHOLDER</strong>",
            1,
        )
        html = html.replace(
            f"<strong>{second_title}</strong>",
            f"<strong>{first_title}</strong>",
            1,
        )
        html = html.replace(
            "<strong>TITLE_PLACEHOLDER</strong>",
            f"<strong>{second_title}</strong>",
            1,
        )

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("start card title mismatch: START 01", error_text)
        self.assertIn("start card title mismatch: START 02", error_text)

    def test_rejects_cta_data_value_that_differs_from_href(self) -> None:
        html = canonical_fixture().replace(
            f'href="{ARCHIVE_URL}"', 'href="https://example.test/wrong"', 1
        )

        errors = validate_fixture(html)

        self.assertIn("CTA data-cta must match href", "\n".join(errors))

    def test_rejects_rendered_start_image_replacement(self) -> None:
        original_image = START_CARDS[0][3]
        html = canonical_fixture().replace(
            f'data-start-image="{original_image}" src="{original_image}"',
            f'data-start-image="{original_image}" src="https://example.test/replacement.webp"',
            1,
        )

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("start image URL mismatch", error_text)
        self.assertIn("rendered start image asset mismatch", error_text)

    def test_rejects_unmatched_guide_image_pair(self) -> None:
        html = canonical_fixture().replace(
            GUIDE_IMAGES["ren"],
            "https://vireth-starting-records.musueman.chatgpt.site/assets/archive-stage/ren-cutout.png",
            1,
        )

        errors = validate_fixture(html)

        self.assertIn("guide image mismatch: ren", "\n".join(errors))

    def test_rejects_wrong_story_archive_scenario_link(self) -> None:
        html = canonical_fixture().replace(
            STORY_URLS[3],
            STORY_URLS[2],
            1,
        )

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("story archive link mismatch: START 04", error_text)
        self.assertIn("story archive scenario links must be unique", error_text)

    def test_rejects_story_archive_link_without_external_link_protection(self) -> None:
        html = canonical_fixture().replace(
            'target="_blank" rel="noopener noreferrer">이 시작과 이어지는 이야기 읽기',
            'target="_self">이 시작과 이어지는 이야기 읽기',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "story archive link must use target=\"_blank\" and rel=\"noopener noreferrer\": START 01",
            "\n".join(errors),
        )

    def test_rejects_wrong_binding_facts_and_guide_scope(self) -> None:
        html = canonical_fixture()
        html = html.replace('data-character-idx="70170"', "", 1)
        html = html.replace("갈비뼈 5개 골절", "갈비뼈 1개 골절", 1)
        html = html.replace(UPDATE_HISTORY[1][2], "운용 규칙을 바꾸지 않았습니다.", 1)
        html = html.replace(
            "비레스를 먼저 걷고 있는 여행자, 렌과 듀란",
            "렌과 듀란이 비레스의 저자이며 모든 사건에 참여합니다",
            1,
        )

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("character idx must be exactly 70170", error_text)
        self.assertIn("missing accident fact: 갈비뼈 5개 골절", error_text)
        self.assertIn("missing update history fact", error_text)
        self.assertIn("Ren/Duran guide role must remain traveler/visual-guide only", error_text)

    def test_rejects_old_update_summary(self) -> None:
        html = canonical_fixture().replace("업데이트 내역", "최근 달라진 점", 1)

        errors = validate_fixture(html)

        self.assertIn("update summary must be exactly: 업데이트 내역", "\n".join(errors))

    def test_rejects_update_history_order_and_time_mismatch(self) -> None:
        html = canonical_fixture()
        html = html.replace('data-update-date="2026-08-02"', 'data-update-date="2026-07-01"', 1)
        html = html.replace('datetime="2026-07-29"', 'datetime="2026-07-28"', 1)

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("update history date order mismatch", error_text)
        self.assertIn(
            "update history date attributes must match: 2026-07-29 != 2026-07-28",
            error_text,
        )

    def test_rejects_changed_approved_starts_lead(self) -> None:
        html = canonical_fixture().replace(
            STARTS_LEAD,
            "마음에 드는 장면에서 바로 시작해 보세요.",
            1,
        )

        errors = validate_fixture(html)

        self.assertIn("approved starts lead mismatch", "\n".join(errors))

    def test_rejects_deprecated_english_name_case_insensitively(self) -> None:
        html = canonical_fixture().replace(
            "<h1>비레스 5083</h1>",
            "<h1>비레스 5083</h1><p>ARCADIA legacy label</p>",
            1,
        )

        errors = validate_fixture(html)

        self.assertIn("deprecated public name found", "\n".join(errors))

    def test_rejects_meta_tag_in_lunatalk_fragment(self) -> None:
        html = canonical_fixture().replace(
            'data-character-idx="70170">',
            'data-character-idx="70170"><meta charset="UTF-8">',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "meta tags are not allowed in the LunaTalk fragment",
            "\n".join(errors),
        )

    def test_rejects_style_tag_that_lunatalk_exposes_as_text(self) -> None:
        html = canonical_fixture().replace(
            'data-character-idx="70170">',
            'data-character-idx="70170"><style>.card { color: red; }</style>',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "style tags are not allowed in the LunaTalk fragment; use inline styles",
            "\n".join(errors),
        )

    def test_rejects_section_tag_that_lunatalk_unwraps(self) -> None:
        html = canonical_fixture().replace(
            '<div data-section="intro">',
            '<section data-section="intro">',
            1,
        ).replace(
            '<div data-section="starts">',
            '</section><div data-section="starts">',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "section tags are not allowed because LunaTalk unwraps them; use div",
            "\n".join(errors),
        )

    def test_rejects_positioned_image_with_empty_alt(self) -> None:
        html = canonical_fixture().replace(
            'alt="도시">',
            'class="vireth-intro-city" alt="" '
            'style="position:absolute;object-fit:cover;">',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "positioned images must use non-empty alt text for LunaTalk style preservation",
            "\n".join(errors),
        )

    def test_rejects_iframe_in_lunatalk_fragment(self) -> None:
        html = canonical_fixture().replace(
            "</div>",
            '<iframe src="https://example.test/embed"></iframe></div>',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            "iframe tags are not allowed in the LunaTalk fragment",
            "\n".join(errors),
        )

    def test_rejects_unprotected_arbitrary_external_link(self) -> None:
        html = canonical_fixture().replace(
            "</div>",
            '<a href="https://example.test/more">외부 자료</a></div>',
            1,
        )

        errors = validate_fixture(html)

        self.assertIn(
            'external link must use target="_blank" and rel="noopener noreferrer": https://example.test/more',
            "\n".join(errors),
        )


if __name__ == "__main__":
    unittest.main()
