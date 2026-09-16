# 비레스 공식 허브 · 전체 로컬 구현

승인된 첫 관문과 v63 지도를 유지하면서 이야기서고·세계 안내·인물대백과·나라와 장소·첫 장면을 연결한 React/Vite 사이트입니다.

## GitHub Pages

공개 주소: https://musueman.github.io/VIRETH/

`musueman/VIRETH`의 `website/`가 홈페이지 소스이며, `.github/workflows/deploy-website.yml`이 테스트와 빌드를 거쳐 배포합니다. 기존 챗봇 자산 디렉터리는 그대로 유지합니다.

배포 빌드: `npx vite build --base=/VIRETH/ && node scripts/prepare-sites-build.mjs`

경로 검증: `node --test tests/pages-build.test.mjs`. 로컬 루트 경로 실행은 기존 `npm run dev`와 `npm run build`를 사용합니다.

`catalog-integrity.test.js`는 로컬 정본과 QA 출처를 직접 대조하므로 제작 환경에서 별도 실행합니다. 공개 저장소에는 개인 정본과 QA 원본을 올리지 않으며, CI는 이 파일만 제외한 UI 전체와 배포 경로/서버 테스트를 실행합니다.

## 실행

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

미리보기: http://127.0.0.1:4173/

구현: `src/App.jsx`, `src/HomeSections.jsx`, `src/HubPages.jsx`, `src/hub.css`.

콘텐츠 재구성: `node scripts/build-hub-content.mjs` (스크립트에 기록된 정본·공개 서고·최신 이미지 검증 묶음이 필요합니다).

검증: `npx vitest run src`, `npm run build`, `npm run test:sites`, `node scripts/verify-hub-assets.mjs`.

검수: `design-qa.md`, `qa/`

## 이미지 버전

원본: 프로젝트의 `assets/site/vireth/hero/2026-09-15-v1/`.

| 파일 | 실제 크기 | SHA-256 |
|---|---|---|
| hero-desktop.png | 1672×941 | EE2D3353324B4D5355142190957BDF4EE0B7ADEE80027F7648E96DA904BDA8FF |
| hero-city-edge.png | 1024×1536 | DE35BDB645A314966137F3375AEC04F943DB41C131177181617E18FB0001DAA7 |
| hero-mobile.png | 941×1672 | 2DF74718AD41E9FCA5234C3340C8E62AD120D65917D06FEB216C455532ABF038 |

레이아웃 승인 시안은 `public/review/source-upper.png`에 검수용으로만 보관되어 있습니다. 앱 화면의 배경으로 사용하지 않습니다.

## 범위

홈 6개 섹션, 세계 안내 6편, 서고 원문 14편, 인물 100명, 나라·권역 20곳(국가 15곳과 비국가 권역 5곳), 장소 166곳, 시작 장면 8개를 연결했습니다. 목록 필터와 페이지 이동, 통합 검색, 원문 읽기·글자 크기·용어 도움, 상세 지도, 관련 콘텐츠 이동을 사용할 수 있습니다.

새 섹션·페이지는 ImageGen 시안 8종을 먼저 만든 뒤 구현했습니다. 배경 2종만 새로 생성하고 인물·문장·수도·지형은 검증된 원본을 사용합니다. 기록은 `../../assets/site/vireth/expansion/2026-09-16-v1/`, 출처와 해시는 `qa/content-provenance.json`, `qa/expansion-art.json`에 있습니다.

루나톡 버튼은 기존 캐릭터 소개 페이지로 향합니다. 로그인·실제 채팅·외부 서비스의 현재 상태는 이번 검증 범위가 아닙니다. 정본/로컬 루나톡 v20의 영토·국력 구분 반영은 지정 작업에서 완료했으며, 홈페이지는 그 결과를 읽어 사용합니다.
