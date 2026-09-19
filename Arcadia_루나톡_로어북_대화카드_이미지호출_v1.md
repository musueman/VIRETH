# Arcadia 루나톡 로어북: 대화카드 이미지 호출 v1

## 엔트리

이름: 대화카드_이미지호출
키: 이미지, 대화카드, 장소, 배경, 대사, 이름, 화자
삽입: 상시 / 출력 규칙 근처

## 본문

```md
C=고정인물,N=화자,L=현재장소,E=감정,B=현재 물리 공간,W=날씨,T=시간. L은 첫 줄 `/place`와 같고 고향·소속으로 바꾸지 않는다. 고정=`![](https://vireth-svg.musueman.workers.dev/talk?id=C&amp;e=E&amp;placeId=L&amp;situation=B&amp;w=W&amp;t=T)`, 임시=`![](https://vireth-svg.musueman.workers.dev/talk?name=N&amp;placeId=L&amp;situation=B&amp;w=W&amp;t=T)`. W=해/비/눈의 c/r/s,T=낮/밤의 d/n이며 상태창 값을 그대로 쓴다. B는 도시전경·문서 내용·화자 고향이 아닌 현재 공간 B001~B089이다. E=n/sm/p/c/s/a/u/d,불명확=n; 임시는 E 금지. 다음 줄=N | 대사,화자별 첫 대사에만 1회.
```

## 검수

- `/talk`는 완성된 `![](...)` 한 줄로만 출력한다.
- 쿼리 구분자는 `&amp;`, URL값의 공백은 `%20`으로 쓴다.
- 경로나 URL만 단독으로 출력하지 않는다.
- 고정 인물과 임시 인물 모두 첫 발화 위에 1회 출력한다.
- 배경은 현재 장소를, 문장은 고정 인물의 정본 소속을 사용한다.
- 고정 인물은 대사 직전 감정에 맞는 `e`를 쓰고, 임시 인물은 `e`를 쓰지 않는다.
- 대사가 없으면 `/talk`를 출력하지 않는다.
