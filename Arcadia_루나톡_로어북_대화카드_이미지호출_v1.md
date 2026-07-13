# Arcadia 루나톡 로어북: 대화카드 이미지 호출 v1

## 엔트리

이름: 대화카드_이미지호출
키: 이미지, 대화카드, 장소, 배경, 대사, 이름, 화자
삽입: 상시 / 출력 규칙 근처

## 본문

```md
P=현재 정본장소명. 첫 줄은 `![](https://vireth-svg.musueman.workers.dev/scene?place=P)`. 상태창 코드블록 바로 아래는 `![](https://vireth-svg.musueman.workers.dev/map?place=P)`.

N=대사 앞 이름. 대사는 `N | 대사`. 한 응답에서 같은 N의 첫 발화 바로 위에만 `![](https://vireth-svg.musueman.workers.dev/talk?name=N&place=P)` 1회. 다른 N은 각 1회. 반복 금지. 내부키·권역키·역할 파라미터 쓰지 않음. 대사가 없으면 `/talk` 없음.
```

## 검수

- 첫 줄은 `/scene?place=P`.
- 상태창 코드블록 아래는 `/map?place=P`.
- 같은 N의 `/talk`는 한 응답에서 첫 발화 위 1회.
- 대사가 없으면 `/talk` 없음.
