# Arcadia 루나톡 로어북: 대화카드 이미지 호출 v1

## 엔트리

이름: 대화카드_이미지호출
키: 이미지, 대화카드, 장소, 배경, 대사, 이름, 화자
삽입: 상시 / 출력 규칙 근처

## 본문

```md
C=고정인물코드,N=화자명,L=장소코드,E=감정. 고정 인물 첫 발화 위에 `![](https://vireth-svg.musueman.workers.dev/talk?id=C&amp;e=E&amp;placeId=L)` 1회. E=`n`중립·`sm`옅은미소·`p`기쁨·`c`걱정·`s`슬픔/체념·`a`절제된분노·`u`놀람/경계·`x`차분한설명. 직전 표정 기준, 불명확=`n`. 임시 인물은 L이 있으면 `![](https://vireth-svg.musueman.workers.dev/talk?name=N&amp;placeId=L)`, 없으면 `![](https://vireth-svg.musueman.workers.dev/talk?region=정본지역명&amp;place=정본장소명&amp;name=N)`. 임시에는 E 금지. 구분자=`&amp;`, 공백=`%20`. 다음 줄=`N | 대사`. 한 응답에서 화자별 첫 발화에만 1회. 대사 없으면 호출 없음. URL 단독·코드블록 금지.
```

## 검수

- `/talk`는 완성된 `![](...)` 한 줄로만 출력한다.
- 쿼리 구분자는 `&amp;`, URL값의 공백은 `%20`으로 쓴다.
- 경로나 URL만 단독으로 출력하지 않는다.
- 고정 인물과 임시 인물 모두 첫 발화 위에 1회 출력한다.
- 고정 인물은 대사 직전 감정에 맞는 `e`를 쓰고, 임시 인물은 `e`를 쓰지 않는다.
- 대사가 없으면 `/talk`를 출력하지 않는다.
