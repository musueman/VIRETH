# Vireth 장면 프롬프트 이중 시스템 정본 설계

## 상태

- 설계 상태: 사용자 구조 승인 반영, 구현 전 최종 문서 검토 대기
- 적용 축: 캐릭터 단위가 아닌 장면 단위
- 최초 실행 대상: `01_base_foreplay_kiss`
- 해상도: 1280×1280
- 검열 태그: `blank censor`

## 목적

같은 25개 장면 정의와 같은 여성 캐릭터 특징 정본을 사용하여 다음 두 프롬프트 시스템을 생성한다.

1. Danbooru형: 캐릭터 특징, 행위, 체위, 시점, 파트너, 검열, 표정을 태그 배열로만 컴파일한다.
2. Danbooru+자연어 hybrid형: Danbooru형의 태그를 그대로 사용하면서 태그만으로 불충분한 신체 접촉·가림·방향 관계에 한해 짧은 자연어 문장을 최대 두 개 추가한다.

두 시스템은 독립된 장면 목록을 가지지 않는다. 하나의 공통 장면 레지스트리를 두 컴파일러가 읽어야 하며, 한쪽 템플릿만 수정되어 장면·검열 규칙이 갈라지는 구조를 허용하지 않는다.

## 범위 밖

- 여성 캐릭터 특징을 자연어로 번역·요약·확장하지 않는다.
- 남성 캐릭터의 개별 신원이나 고유 외형을 설계하지 않는다.
- 승인된 멜팅프레스 공유 이미지를 캐릭터별로 다시 생성하지 않는다.
- 이번 단계에서 일반 감정 에셋과 일반 외형 에셋을 변환하지 않는다.
- 장면 템플릿 구조 검증을 실제 이미지 품질 승인으로 간주하지 않는다.

## 여성 캐릭터 특징 정본 잠금

정본 파일:

`D:\OneDrive\444_비레스\00_최신본\12_NSFW\VIRETH_FEMALE_50_DANBOORU_FEATURES_v1_20260905.json`

SHA-256:

`7AFBD2ED11B5DECC60A23F27772ADFCBF23B9C6D07B9723B042D7A9A168E4C65`

두 컴파일러는 이 파일의 `hair`, `eyes`, `skin`, `face`, `body`, `breasts`, `markers` 배열을 순서대로 읽는다. 다음 규칙은 예외 없이 적용한다.

- 특징값은 검증된 Danbooru `english_name` 태그만 허용한다.
- 이름과 코드 이외의 캐릭터 특징에 자연어를 추가하지 않는다.
- hybrid 관계 문장에도 여성의 머리색, 눈색, 피부색, 얼굴, 체형, 가슴 크기, 표식을 다시 쓰지 않는다.
- 장면 컴파일 전과 후의 특징 배열이 바이트 단위로 같아야 한다.
- 중복 제거는 장면 레이어와의 결합 과정에서만 수행하며 정본 특징 파일을 자동 수정하지 않는다.
- 정본 파일의 해시가 다르면 큐 제출을 중단한다.

## 시스템 구조

### 공통 장면 레지스트리

각 장면은 다음 필드를 가진다.

- `id`: 장면 슬롯 식별자
- `phase`: `foreplay`, `base`, `climax`
- `action_tags`: 행위 태그
- `pose_tags`: 체위 및 자세 태그
- `viewpoint_mode`: `male_pov`, `third_person_obscured_face`, `third_person_head_out`
- `male_genital_intent`: `none`, `required`, `contact_only`
- `female_genital_intent`: `none`, `required`, `contact_only`
- `censor_policy`: `none`, `blank`
- `expression_tags`: 클라이맥스 전용 표정 태그
- `hybrid_relations`: 0~2개의 짧은 관계 문장
- `forbidden_tags`: 해당 장면과 상충하는 태그
- `anatomy_contract`: 신체 주체, 접촉 지점, 가림 및 지지 조건
- `generation_policy`: `generate` 또는 `reuse_shared_asset`

### Danbooru 컴파일러

다음 순서로 배열을 결합한다.

`female identity → common scene → partner → action → pose → censor → expression`

출력에는 자연어 관계 문장이 없다. 동일 태그와 동의 태그는 한 번만 남기며, 장면의 노출 의도와 관계없는 성기 태그는 추가하지 않는다.

### Hybrid 컴파일러

Danbooru 컴파일러의 태그 배열을 변경하지 않고 그 뒤에 `hybrid_relations`만 추가한다.

- 최대 두 문장
- 신체의 시작점, 접촉점, 방향, 지지, 가림만 기술
- 캐릭터 특징, 화풍, 품질, 배경, 표정, 행위명을 자연어로 반복하지 않음
- 단순한 장면은 관계 문장을 0개로 둘 수 있음
- 자연어가 태그와 충돌하면 컴파일 실패

## 남성 파트너 규칙

### 남성 1인칭

- 파트너 태그는 `1boy`, `pov`만 기본 사용한다.
- 손이 실제로 화면에 필요한 경우에만 `pov hands`를 추가한다.
- 머리, 머리색, 눈, 피부, 얼굴, 체형, 의상 등 남성 외형 태그와 자연어 묘사를 금지한다.
- 남성 얼굴 관련 태그를 넣지 않는다.

### 남성 얼굴이 프레임에 들어오는 3인칭

- `1boy`, `faceless male`, `shaded face`를 사용한다.
- 남성 눈, 동공, 눈동자색, 코, 입 등 이목구비 식별 태그를 금지한다.
- hybrid 관계 문장에서도 남성 이목구비를 묘사하지 않는다.

### 남성 머리가 프레임 밖인 3인칭

- 머리가 프레임 밖임을 나타내는 검증 태그만 사용한다.
- 얼굴이 보이지 않으므로 `shaded face`를 중복 추가하지 않는다.
- 남성 머리와 머리카락 묘사를 금지한다.

## 성기 노출 및 검열 분류

| 분류 | 장면 | 남성 성기 | 여성 성기 | 검열 |
|---|---|---:|---:|---|
| `none` | 키스, 가슴 애무 | 불필요 | 불필요 | 없음 |
| `female_only` | 핑거링 | 묘사 금지 | 접촉 확인에 필요 | `blank censor` |
| `male_only` | 핸드잡, 펠라치오, 딥스로트, 파이즈리 | 행위 확인에 필요 | 묘사 금지 | `blank censor` |
| `penetration_contact` | 모든 삽입 체위 | 별도 세부 묘사 금지 | 별도 세부 묘사 금지 | `blank censor` |

`penetration_contact`에서는 `vaginal` 태그로 행위를 지정하고, 개별 성기 세부 태그는 기본적으로 넣지 않는다. Hybrid판은 필요한 경우에만 두 골반의 접촉점과 자연스러운 가림을 짧게 명시한다. 성기가 화면에 필요 없는 장면에 성기 태그 또는 검열 태그가 있으면 컴파일을 실패시킨다.

## 25개 장면 분류

| ID | 핵심 행위·체위 | 시점 | 노출 분류 | 검열 | 생성 정책 |
|---|---|---|---|---|---|
| `01_base_foreplay_kiss` | kiss | `male_pov` | `none` | 없음 | generate |
| `02_base_foreplay_breast_caress` | breast caress | `male_pov` | `none` | 없음 | generate |
| `03_base_foreplay_fingering` | fingering | `male_pov` | `female_only` | blank | generate |
| `05_base_foreplay_handjob` | handjob | `male_pov` | `male_only` | blank | generate |
| `06_base_foreplay_fellatio` | fellatio | `male_pov` | `male_only` | blank | generate |
| `07_base_foreplay_deepthroat` | deepthroat | `male_pov` | `male_only` | blank | generate |
| `08_base_foreplay_paizuri` | paizuri | `male_pov` | `male_only` | blank | generate |
| `09_base_sex_missionary` | missionary | `third_person_head_out` | `penetration_contact` | blank | generate |
| `10_climax_sex_missionary` | missionary climax | `third_person_head_out` | `penetration_contact` | blank | generate |
| `11_base_sex_doggy` | doggystyle | `third_person_head_out` | `penetration_contact` | blank | generate |
| `12_climax_sex_doggy` | doggystyle climax | `third_person_head_out` | `penetration_contact` | blank | generate |
| `13_base_sex_cowgirl` | cowgirl | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `14_climax_sex_cowgirl` | cowgirl climax | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `15_base_sex_side` | spooning | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `16_climax_sex_side` | spooning climax | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `17_base_sex_face_to_face_sitting` | face-to-face sitting | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `18_climax_sex_face_to_face_sitting` | face-to-face sitting climax | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `19_base_sex_lifted` | standing lifted | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `19b_climax_sex_lifted` | standing lifted climax | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `20_base_sex_full_nelson` | full nelson | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `21_climax_sex_full_nelson` | full nelson climax | `third_person_obscured_face` | `penetration_contact` | blank | generate |
| `22_base_sex_mating_press` | mating press | `third_person_head_out` | `penetration_contact` | blank | reuse_shared_asset |
| `23_climax_sex_mating_press` | mating press climax | `third_person_head_out` | `penetration_contact` | blank | reuse_shared_asset |
| `24_base_sex_prone_bone` | prone bone | `third_person_head_out` | `penetration_contact` | blank | generate |
| `25_climax_sex_prone_bone` | prone bone climax | `third_person_head_out` | `penetration_contact` | blank | generate |

## 클라이맥스 규칙

- 클라이맥스 슬롯에만 `orgasm`, `ahegao`를 추가한다.
- `cum`은 장면 정의가 가시적 사정을 요구할 때만 개별적으로 허용하고 공통 태그로 사용하지 않는다.
- 정확한 Danbooru 태그가 확인되지 않은 오호고에는 제외한다.
- 기본 장면에는 클라이맥스 표정과 사정 태그를 넣지 않는다.

## 해부학 사전 검열

큐 제출 전에 다음 조건을 검사한다.

1. 캐릭터 수가 `1girl`, `1boy`와 일치한다.
2. 하나의 장면에 상충 체위 태그가 함께 있지 않다.
3. `male_pov` 장면에 남성 외형·얼굴 태그 또는 자연어가 없다.
4. `none` 장면에 성기 태그와 `blank censor`가 없다.
5. `female_only` 장면에 남성 성기 태그가 없다.
6. `male_only` 장면에 여성 성기 태그가 없다.
7. `penetration_contact` 장면에 불필요한 개별 성기 세부 태그가 없다.
8. `faceless male`과 남성 이목구비 태그가 함께 있지 않다.
9. `head_out` 장면에 얼굴 묘사와 `shaded face`가 없다.
10. 같은 태그, 동의 태그, 태그와 자연어의 의미 반복이 없다.
11. Hybrid 관계 문장은 두 문장 이하이며 캐릭터 특징을 포함하지 않는다.
12. 신체 주체, 골반 방향, 손 소유자, 접촉점, 지지점이 장면 계약과 일치한다.
13. 장면과 무관한 포괄적 네거티브를 자동 상속하지 않는다.
14. 멜팅프레스 슬롯은 큐에 제출되지 않고 공유 정본 참조로 해석된다.

검사 실패 시 해당 장면과 캐릭터의 컴파일 결과를 만들지 않으며, 오류에는 슬롯 ID, 위반 규칙, 문제 태그 또는 문장을 기록한다.

## 네거티브 구성

공통 네거티브는 최소 해부학·검열 계약만 유지한다. 장면별 네거티브는 실제로 가능한 잘못된 체위, 잘못된 시점, 잘못된 신체 주체만 추가한다. 다른 장면에서 필요했던 팔·다리·배경·표정 네거티브를 무조건 복사하지 않는다.

Danbooru형에서 태그로 확인되지 않는 문구는 Danbooru 태그 배열에 넣지 않는다. 모델 제어상 반드시 필요한 비태그 문구가 발견되면 이를 숨겨 넣지 않고 별도 `control_terms`로 분리하여 사용자 검토를 받는다.

## 산출물

구현 시 다음 정본 산출물을 만든다.

- 공통 25장면 레지스트리 JSON
- Danbooru형 컴파일러와 템플릿 매니페스트
- Danbooru+자연어 hybrid형 컴파일러와 템플릿 매니페스트
- 두 시스템의 장면별 컴파일 결과 검수표
- 특징 해시, 태그 존재, 중복, 검열, 시점, 해부학 계약 검증기
- 첫 장면 `01_base_foreplay_kiss`의 여성 50인 프롬프트·제출 기록·완료 결과 기록

운영 정본은 `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿` 아래에 두 시스템을 분리해 저장하고, 실행 코드는 `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\lib` 아래에서 공통 레지스트리를 공유한다.

## 최초 키스 실행 게이트

키스 장면은 다음 상태에서만 큐에 제출한다.

- 여성 50인 특징 정본 해시 일치
- 50개 캐릭터 코드 일치 및 중복 없음
- `male_pov` 적용
- 남성 외형·얼굴·성기 태그 없음
- 여성 성기 태그 없음
- `blank censor` 없음
- Hybrid 자연어 관계 문장 0~1개
- 두 시스템의 차이가 허용된 관계 문장뿐임
- 1280×1280 런타임 고정
- 기존 큐와 완료 결과를 확인해 중복 제출이 아님을 증명

제출 이후에는 프롬프트·레코드·PNG 수와 빈 큐를 각각 확인한다. 이는 구조적 완료 증거이며, 캐릭터 일관성과 시각적 성공은 별도의 전체 이미지 검수로 판정한다.
