import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'차운동 프로젝트 · 함께하는 운동 기록',description:'차운동 프로젝트 — 헬스, 러닝, 홈트. 각자의 속도로 운동하고 친구들과 오늘의 움직임을 나눠요.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
