# Arcadia 루나톡 로어북: 대화카드 이미지 호출 v1

## 엔트리

이름: 대화카드_이미지호출
키: 이미지, 대화카드, 장소, 배경, 대사, 이름, 화자
삽입: 상시 / 출력 규칙 근처

## 본문

```md
C=고정인물코드,N=화자명,L=현재장소코드,E=감정. 카드 배경은 L, 문장은 C 정본 소속을 쓴다. L은 첫 줄 `/place`의 `placeId`와 같고 화자 소속·고향 코드로 바꾸지 않는다. 고정 인물 첫 대사 위에 `![](https://vireth-svg.musueman.workers.dev/talk?id=C&amp;e=E&amp;placeId=L)` 1회. E=`n`중립·`sm`미소·`p`기쁨·`c`걱정·`s`슬픔·`a`분노·`u`경계·`x`설명, 불명확=`n`. 임시는 L이 있으면 `![](https://vireth-svg.musueman.workers.dev/talk?name=N&amp;placeId=L)`, 없으면 `![](https://vireth-svg.musueman.workers.dev/talk?region=정본지역명&amp;place=정본장소명&amp;name=N)`. 임시에는 E 금지. 다음 줄=`N | 대사`. 응답 내 화자별 첫 대사에만 1회.
```

## 검수

- `/talk`는 완성된 `![](...)` 한 줄로만 출력한다.
- 쿼리 구분자는 `&amp;`, URL값의 공백은 `%20`으로 쓴다.
- 경로나 URL만 단독으로 출력하지 않는다.
- 고정 인물과 임시 인물 모두 첫 발화 위에 1회 출력한다.
- 배경은 현재 장소를, 문장은 고정 인물의 정본 소속을 사용한다.
- 고정 인물은 대사 직전 감정에 맞는 `e`를 쓰고, 임시 인물은 `e`를 쓰지 않는다.
- 대사가 없으면 `/talk`를 출력하지 않는다.
