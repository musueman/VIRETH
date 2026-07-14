# Arcadia 루나톡 로어북: 대화카드 이미지 호출 v1

## 엔트리

이름: 대화카드_이미지호출
키: 이미지, 대화카드, 장소, 배경, 대사, 이름, 화자
삽입: 상시 / 출력 규칙 근처

## 본문

```md
R=현재 권역/국가명, P=현재 세부장소명. 첫 줄에 전경+축약지도를 합친 `![](https://vireth-svg.musueman.workers.dev/place?region=R&place=P)` 1회. `/map`은 `!장소` 요청에서만 상세 지도로 출력한다.

N=대사 앞 이름. 대사는 `N | 대사`. 한 응답에서 같은 N의 첫 발화 바로 위에만 `![](https://vireth-svg.musueman.workers.dev/talk?name=N&region=R&place=P)` 1회. 다른 N은 각 1회. 반복 금지. 내부키·이미지키·역할·bgType 쓰지 않음. 대사가 없으면 `/talk` 없음.
```

## 검수

- 첫 줄은 `/place?region=R&place=P`.
- 평상시 응답에는 별도 `/scene`과 `/map`이 없음.
- `/map`은 `!장소` 요청에서만 사용.
- 같은 N의 `/talk`는 한 응답에서 첫 발화 위 1회.
- 대사가 없으면 `/talk` 없음.
