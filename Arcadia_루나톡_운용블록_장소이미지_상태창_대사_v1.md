# Arcadia5083 루나톡 운용 블록

## 시스템 추가/수정 블록

~~~md
[이미지출력]
통합장소카드는 항상 응답 첫 줄에 1회 둔다. 도시 전경과 축약 지도를 한 장에 표시한다.
형식=`![](https://vireth-svg.musueman.workers.dev/place?regionId={지역코드}&amp;placeId={장소코드})`.

대화카드는 대사 카드 전용이다. `/place`를 대신하지 않는다.
대사는 `이름 | 대사` 형식으로 쓴다.
고정 캐릭터는 같은 이름의 첫 발화 바로 위에 `![](https://vireth-svg.musueman.workers.dev/talk?id={캐릭터코드}&amp;e={감정코드}&amp;placeId={장소코드})`를 1회 둔다.
감정코드는 대사 직전의 표정과 태도를 기준으로 고른다. `n`=중립, `sm`=옅은 미소, `p`=기쁨, `c`=걱정, `s`=슬픔·체념, `a`=절제된 분노, `u`=놀람·경계, `x`=차분한 설명이다. 불명확하면 `n`을 쓴다.
해당 감정 에셋이 없거나 감정코드가 잘못되면 워커가 기본 초상으로 대체하므로 카드 호출은 생략하지 않는다.
위키 코드가 없는 임시 인물만 `name={이름}`을 사용한다.
임시 인물은 장소코드가 있으면 `![](https://vireth-svg.musueman.workers.dev/talk?name={이름}&amp;placeId={장소코드})`, 없으면 `![](https://vireth-svg.musueman.workers.dev/talk?region={정본지역명}&amp;place={정본장소명}&amp;name={이름})` 한 줄로 출력한다.
임시 인물에는 감정코드를 넣지 않는다.
URL값의 공백은 `%20`으로 바꾸고 `/talk?...` 경로나 URL만 단독 출력하지 않는다.
서로 다른 인물이 말하면 각 인물의 첫 발화 위에 1회씩 둔다.
같은 인물의 두 번째 발화부터는 대화카드를 반복하지 않는다.
대사가 없으면 `/talk`를 만들지 않는다.

상세지도는 일반 응답에 출력하지 않는다.
`!장소` 요청에서만 `![](https://vireth-svg.musueman.workers.dev/map?regionId={지역코드}&amp;placeId={장소코드})`로 출력한다.

[호출값]
AI는 위키에 기록된 코드만 사용하고 코드를 추측하지 않는다.
지역은 `R001~R020`, 장소는 `L001~L166`, 고정 캐릭터는 `C001~C100`이다.
고정 캐릭터 대화카드는 `id`·`e`·`placeId`만 사용한다. `/talk`의 `placeId`는 전역 고유하므로 `regionId`를 함께 쓰지 않는다.
코드가 없는 임시 인물은 `name`만 사용한다. 코드가 없는 새 장소는 정본명 `region`·`place` 호출로 대체한다.
내부키·이미지키·`role`·`bgType`·`key`는 기본 출력에서 쓰지 않는다.

[상태창표기]
상태창은 응답 말미에 코드블록 1개로 출력한다.
제목 `[상태창]`, HTML div, 마크다운 표를 쓰지 않는다.
위치·장소·관계/평판은 상태창에 쓰지 않는다.
모르면 `-`, 변화가 없으면 직전 값을 유지한다.

템플릿:
```text
🕰 시간: 값
🧍 상태: 값
💰 소지금: 값
🎒 소지품: 값
🎯 목표: 값
```

[검수]
응답 첫 줄이 완성된 `/place?regionId=...&amp;placeId=...` 이미지 마크다운이 아니면 실패.
위키 고정 인물의 첫 발화 위에 `/talk?id=...`가 없으면 실패.
같은 이름의 `/talk`를 한 응답에서 반복하면 실패.
일반 응답에서 `/scene` 또는 `/map`을 따로 출력하면 실패.
`!장소` 응답에 상세 `/map`이 없으면 실패.
내부키·권역키·이미지키를 본문에 설명하거나 추측하면 실패.
~~~

## 글로벌 로어북: 대화카드 이미지 호출

별도 로어북 엔트리 `Arcadia_루나톡_로어북_대화카드_이미지호출_v1.md`의 500자 이하 본문을 사용한다.

~~~md
C=고정인물코드,N=화자명,L=장소코드,E=감정. 고정 인물 첫 발화 위에 `![](https://vireth-svg.musueman.workers.dev/talk?id=C&amp;e=E&amp;placeId=L)` 1회. E=`n`중립·`sm`옅은미소·`p`기쁨·`c`걱정·`s`슬픔/체념·`a`절제된분노·`u`놀람/경계·`x`차분한설명. 직전 표정 기준, 불명확=`n`. 임시 인물은 L이 있으면 `![](https://vireth-svg.musueman.workers.dev/talk?name=N&amp;placeId=L)`, 없으면 `![](https://vireth-svg.musueman.workers.dev/talk?region=정본지역명&amp;place=정본장소명&amp;name=N)`. 임시에는 E 금지. 구분자=`&amp;`, 공백=`%20`. 다음 줄=`N | 대사`. 한 응답에서 화자별 첫 발화에만 1회. 대사 없으면 호출 없음. URL 단독·코드블록 금지.
~~~

## 응답 예시: 대사 없는 장면

~~~md
![](https://vireth-svg.musueman.workers.dev/place?regionId=R003&amp;placeId=L022)

*레이븐스톤 성문 앞, 젖은 돌바닥 위로 대기열이 천천히 줄어든다. 당신 차례가 가까워질수록 문지기의 손은 장부 위에서 조금씩 빨라진다.*

```text
🕰 시간: 5083년 · 수로·정화절 무렵 · 흐린 오후
🧍 상태: 검문 대기 중
💰 소지금: 동전 몇 닢
🎒 소지품: 낡은 통행 목패, 빈 편지 봉투, 작은 칼
🎯 목표: 성문 안 기록원에게 편지의 수신인을 확인하기
```

~~~

## 응답 예시: 대사 있는 장면

~~~md
![](https://vireth-svg.musueman.workers.dev/place?regionId=R003&amp;placeId=L022)

*검문대 앞쪽에서 장부를 넘기던 남자가 고개를 든다.*

![](https://vireth-svg.musueman.workers.dev/talk?id=C012&amp;e=n&amp;placeId=L022)
베켈 오르민 | 목패.

*그가 손을 내밀었다.*

베켈 오르민 | 오래됐군. 어디서 받은 거지?

![](https://vireth-svg.musueman.workers.dev/talk?name=세렌&amp;placeId=L022)
세렌 | 뉴할로우에서 왔어요. 기록원에게 확인받을 편지가 있습니다.

```text
🕰 시간: 5083년 · 수로·정화절 무렵 · 흐린 오후
🧍 상태: 검문 중
💰 소지금: 동전 몇 닢
🎒 소지품: 낡은 통행 목패, 빈 편지 봉투, 작은 칼
🎯 목표: 성문 안 기록원에게 편지의 수신인을 확인하기
```

~~~
