# 차운동 프로젝트

친구들과 운동 기록과 사진을 공유하는 모바일 중심 웹앱입니다. 화면에서는 **차운동**으로 줄여 표시합니다.

## 현재 구현
- 헬스·러닝·홈트 운동 기록, 시간과 메모, 선택 사진 업로드
- 클럽 피드, 운동 종류 필터, 내 기록, 응원
- 주간 목표, 연속 운동일 순위, 친구 깨우기
- 앱을 열어둔 동안의 알림

모든 접근 허용 멤버가 같은 클럽을 사용합니다. 개인별 친구 초대, 백그라운드 푸시, 타이머, 기록 수정·삭제, 챌린지는 아직 구현되지 않았습니다. 예시 피드는 실제 사용자 기록이 아닙니다.

## 로컬 실행
Node.js 22.13 이상이 필요합니다.

```sh
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_move_club.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_pokes.sql
npm run dev
```

마이그레이션은 새 로컬 데이터베이스에 한 번씩 실행합니다. 로컬 미리보기는 테스트 계정을 사용합니다.

## 게시 준비 상태
GitHub는 소스 보관소입니다. 서버 API, D1 데이터베이스, R2 사진 저장소가 필요하므로 GitHub Pages만으로 실행할 수 없습니다.

현재 로그인은 Sites 플랫폼의 인증 헤더에 의존합니다. Cloudflare 독립 게시 전에는 검증된 로그인·세션 인증과 실제 D1/R2 연결을 구성해야 합니다. 현재 상태를 그대로 공개 서버에 올리지 마세요. 실제 서비스 게시와 친구 공유는 아직 완료되지 않았습니다.

## 사진 출처
- [Julia Larson · 헬스](https://www.pexels.com/photo/woman-training-with-gym-equipment-and-dumbbell-6455896/)
- [RUN 4 FFWPU · 러닝](https://www.pexels.com/photo/woman-running-along-street-18409404/)
- [MART PRODUCTION · 홈트](https://www.pexels.com/photo/a-woman-doing-yoga-at-home-8032727/)
- [Pexels 라이선스](https://www.pexels.com/license/)
