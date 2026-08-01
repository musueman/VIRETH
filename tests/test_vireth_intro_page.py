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

ARCHIVE_URL = "https://vireth-starting-records.musueman.chatgpt.site/#story-starts"
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
UPDATE_FACTS = (
    "루나톡 기준으로 시작 선택 화면을 기본 시작 1개와 역할형 시작 7개, 총 8개로 다시 맞췄습니다.",
    "장터와 납품 장부, 피난민 배급 줄, 항만과 선착장의 새벽은 2026년 7월 28일 라이브 로어북 등록분을 반영했습니다.",
    "대화카드는 현재 장소의 배경을 따르고, 인물의 소속과 표식은 정본 기준을 따르도록 운용 규칙을 정리했습니다.",
    "v11 정본동기화 후보, v61 좌표보정 지도, v62 출판·웹용 선별 라벨 지도를 기준으로 문서 정합성을 계속 맞추고 있습니다.",
    "긴 웹툰형 이미지는 순차적으로 추가하고, 소개 화면에서는 도시·장소 배경 이미지를 분리해 보여주는 방향으로 정리했습니다.",
)


def canonical_fixture() -> str:
    cards = "\n".join(
        f'''<details data-start-card="{card_id}" data-ui-frame="start-card">
  <summary><img data-start-image="{image_url}" src="{image_url}" alt="{title}">
    <span>{card_id} · {kind}</span><strong>{title}</strong>
  </summary>
  <div>상황 설명. 예시 입력: 주변을 살핀다. !역할시작</div>
</details>'''
        for card_id, kind, title, image_url in START_CARDS
    )
    accident = " ".join(ACCIDENT_FACTS)
    updates = " ".join(UPDATE_FACTS)
    return textwrap.dedent(
        f'''\
        <div id="vireth-intro-20260802" data-vireth-intro="20260802" data-character-idx="70170">
          <section data-section="notice"><div data-ui-frame="notice">업데이트가 조금 늦어질 수 있습니다. {accident}</div></section>
          <section data-section="intro">
            <h1>비레스 5083</h1>
            <p>비레스를 먼저 걷고 있는 여행자, 렌과 듀란</p>
            <img src="https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp" alt="도시">
            <img src="https://vireth-starting-records.musueman.chatgpt.site/assets/archive-stage/ren-cutout.png" alt="렌">
            <img src="https://vireth-starting-records.musueman.chatgpt.site/assets/archive-stage/duran-cutout.png" alt="듀란">
            <a data-cta="#vireth-starts" href="#vireth-starts">비레스를 먼저 둘러보기</a>
            <a data-cta="{ARCHIVE_URL}" href="{ARCHIVE_URL}" target="_blank" rel="noopener noreferrer">이야기 읽기</a>
          </section>
          <section data-section="starts">{cards}</section>
          <section data-section="play-flow"><p>장면을 고릅니다</p></section>
          <section data-section="commands"><details data-ui-frame="details-control"><summary>막혔을 때 이렇게 불러보세요</summary></details></section>
          <section data-section="updates"><details data-ui-frame="details-control"><summary>최근 달라진 점</summary><div>{updates}</div></details></section>
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

    def test_canonical_fixture_satisfies_full_contract(self) -> None:
        self.assertEqual([], validate_fixture(canonical_fixture()))

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

    def test_rejects_wrong_binding_facts_and_guide_scope(self) -> None:
        html = canonical_fixture()
        html = html.replace('data-character-idx="70170"', "", 1)
        html = html.replace("갈비뼈 5개 골절", "갈비뼈 1개 골절", 1)
        html = html.replace(UPDATE_FACTS[2], "운용 규칙을 바꾸지 않았습니다.", 1)
        html = html.replace(
            "비레스를 먼저 걷고 있는 여행자, 렌과 듀란",
            "렌과 듀란이 비레스의 저자이며 모든 사건에 참여합니다",
            1,
        )

        errors = validate_fixture(html)
        error_text = "\n".join(errors)

        self.assertIn("character idx must be exactly 70170", error_text)
        self.assertIn("missing accident fact: 갈비뼈 5개 골절", error_text)
        self.assertIn("missing 2026-08-01 update fact", error_text)
        self.assertIn("Ren/Duran guide role must remain traveler/visual-guide only", error_text)


if __name__ == "__main__":
    unittest.main()
