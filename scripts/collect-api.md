# API reference data 수집

`scripts/collect-api.py`는 ThorVG 원본 소스의 최신 헤더와 webcanvas 소스를 읽어서 docs 사이트가 쓰는 API reference 데이터를 `assets/data/api/` 아래에 만든다.

| 언어 | 입력 소스 | 출력 폴더 |
| --- | --- | --- |
| C++ | `<thorvg>/inc/thorvg.h` | `assets/data/api/cpp/` |
| C | `<thorvg>/src/bindings/capi/thorvg_capi.h` | `assets/data/api/c/` |
| JS | `<webcanvas>/packages/webcanvas/src/**/*.ts` | `assets/data/api/js/` |

각 폴더에는 `index.json`(그룹과 요약)과 엔티티별 `<Name>.json`이 생성된다. 실행할 때마다 해당 폴더의 `*.json`을 모두 지우고 새로 만들므로 stale 파일은 남지 않는다.

## 최신 버전으로 다시 만들기

프로젝트 루트(`thorvg.home`)에서 실행한다.

```bash
python3 scripts/collect-api.py
```

기본 경로는 `/Users/yiu/Downloads/thorvg-main`(ThorVG)과 `/Users/yiu/Downloads/thorvg.web-main/packages/webcanvas`(webcanvas)다. 소스를 다른 위치에서 받았다면 경로를 지정한다.

```bash
python3 scripts/collect-api.py \
  --thorvg /path/to/thorvg \
  --webcanvas /path/to/thorvg.web-main/packages/webcanvas
```

한 언어만 다시 만들 수도 있다.

```bash
python3 scripts/collect-api.py --lang cpp
python3 scripts/collect-api.py --lang c
python3 scripts/collect-api.py --lang js
```

출력 위치를 바꾸려면 `--out`을 쓴다(기본값은 `assets/data/api`).

## 권장 절차

1. ThorVG 또는 webcanvas 소스를 최신 버전으로 갱신한다.
2. `python3 scripts/collect-api.py`를 실행한다.
3. 출력에 나온 엔티티·멤버 수가 이전과 크게 다르지 않은지 확인한다.
4. 변경된 `assets/data/api/` 파일을 커밋한다.

## 주의

- 파서는 정규식과 간단한 상태 머신 기반이다. 소스의 주석 스타일이나 선언 형식이 크게 바뀌면 결과가 빠지거나 잘못 나올 수 있으니 실행 후 출력을 확인한다.
- JS는 TypeScript 컴파일러를 쓰지 않는다. 별도 `npm install` 없이 실행된다.
- 공개 API 범위는 C++과 C 헤더 전체, JS는 webcanvas `src/index.ts`의 export 목록을 기준으로 한다.
