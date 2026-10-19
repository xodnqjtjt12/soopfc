# 무료 Gemini + Netlify 연결

## 배포 구조

React → `/.netlify/functions/ai-formation` → Gemini Developer API. 기존 Firestore 연결은 유지한다. AI 요청은 Firestore에 저장하지 않는다. 실제 이름·회원 ID·연락처는 AI에 보내지 않고 `p0` 등의 임시 ID와 4개 능력치, 선호 포지션, GK 여부, 출전 가능 쿼터만 보낸다.

Gemini가 4쿼터 양 팀의 선수·포메이션·포지션 순서·편성 이유를 생성한다. 서버와 브라우저에서 4쿼터/11명/유효 포메이션/알려진 ID/중복/출전 가능 여부를 검증한다. 휴식·불참·출전 횟수는 검증된 배치로 다시 계산한다. 전원 전 쿼터 가능이면 출전 횟수 차이 1 이하를 강제한다. 서로 다른 출전 가능 조건에서는 균등 출전을 AI에 요청하지만 최적성을 보장하지 않는다. 팀 유지 설정도 가능한 범위의 AI 지침이며 엄격한 제약은 아니다. 운영자는 최종 배치를 확인해야 한다.

## 운영자 설정

1. Google AI Studio에서 **결제를 활성화하지 않은 프로젝트**의 Gemini API 키를 만든다. 해당 프로젝트에서 `gemini-2.5-flash-lite` 무료 호출이 가능한지와 실제 한도를 확인한다. 모델이 제공되지 않으면 연결 실패로 표시하며 자동으로 다른 모델을 호출하지 않는다.
2. Netlify 환경변수에 아래 값을 설정한다. **Functions 실행 범위**에만 지정하고 `REACT_APP_` 접두어를 사용하지 않는다. 키를 코드/브라우저/채팅에 붙여 넣지 않는다.
   - `GEMINI_API_KEY`: 발급한 API 키
   - `AI_ACCESS_CODE`: 운영자에게만 공유할 무작위 코드, 최소 20자. 기존 관리자 화면 비밀번호와 별개다.
   - `AI_FREE_TIER_CONFIRMED=true`: Google 프로젝트에 결제가 연결되지 않았음을 직접 확인한 뒤 설정
3. Netlify의 프로젝트 Base directory는 이 저장소 루트. `netlify.toml`이 `npm run build`, `build/`, `netlify/functions/`를 설정한다. 환경변수 설정 후 재배포한다.
4. 화면에서 참석자 선택 → ‘AI 편성 이용 설정’에 운영자 코드 입력 → ‘AI로 팀 짜기’. 코드는 React 메모리에만 있고 새로고침하면 사라진다. 공유 코드는 개인별 로그인/권한 관리가 아니므로 운영자에게만 배포하고 유출 시 교체한다.

## 비용과 한도

- 코드가 Google 프로젝트의 결제 상태를 조회하는 것은 아니다. `AI_FREE_TIER_CONFIRMED`는 운영자의 확인 표시다. **과금 방지의 핵심은 API 키가 속한 프로젝트에 결제를 연결하지 않는 것**이다. 나중에 결제를 활성화하면 같은 호출도 유료가 될 수 있다.
- 모델은 `gemini-2.5-flash-lite`로 고정. 자동 재시도/모델 전환/유료 폴백 없음. 실패하면 사용자가 ‘4쿼터 팀 짜기’로 기본 편성을 선택한다.
- Netlify 플랫폼 제한: 도메인 기준 분당 3요청. 인증 실패도 포함한다. 일일 영구 카운터는 구현하지 않았다. Gemini 프로젝트 자체의 무료 요청/토큰 한도도 적용된다. 플랫폼 제한은 실제 Netlify 배포에서 확인해야 한다.
- 같은 익명 입력은 브라우저 메모리에서 최대 5건 재사용한다. 새로고침/다른 기기에서는 재호출된다. 수동 수정·이미지 다운로드는 AI를 호출하지 않는다.
- Netlify의 접속·배포·서버 실행 무료 한도는 별도다. 계정의 Free/기존 요금제와 크레딧 사용량을 확인한다. 무료 AI가 Netlify 사용량까지 무제한으로 만드는 것은 아니다.
- Gemini 무료 서비스 입력/응답은 Google 제품 개선에 사용될 수 있다. 익명 처리해도 능력치/설정은 외부 서비스로 전달된다.

## 로컬 실행

`npm start`의 3000번은 React만 제공하므로 서버 함수가 없다. Netlify CLI가 설치된 환경에서 서버 전용 변수를 `.env.local`에 설정하고 `netlify dev`를 실행한 뒤 **http://localhost:8888/admin/formation**을 연다. `.env.local`과 `.netlify/`는 Git에서 제외한다. 예시는 루트 `.env.ai.example` 참고.

## 확인

`node --test netlify/tests/ai-formation.test.mjs`로 서버 인증, 설정 누락, 입력 오류, 유효/잘못된 응답, 429 단일 호출을 테스트한다. CRA 테스트의 `src/aiFormation.test.js`로 개인정보 제외, 슬롯 검증, 원래 ID 복원, 캐시, 한도 오류를 확인한다. 테스트는 네트워크를 모킹하므로 실제 Gemini 품질/무료 한도/Netlify 배포를 증명하지 않는다. 설정 후 22명과 26명으로 실제 호출 검증이 필요하다.

공식 문서: [Gemini 요금](https://ai.google.dev/gemini-api/docs/pricing), [구조화 응답](https://ai.google.dev/gemini-api/docs/structured-output), [Netlify Functions](https://docs.netlify.com/build/functions/api/), [Netlify 요금](https://www.netlify.com/pricing/).
