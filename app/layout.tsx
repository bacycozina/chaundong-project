import type {Metadata} from 'next';
import './globals.css';
import './features.css';
export const metadata:Metadata={title:'CHAEUN · 함께하는 운동 기록',description:'CHAEUN — 헬스, 러닝, 홈트. 각자의 속도로 운동하고 친구들과 오늘의 움직임을 나눠요.',verification:{google:'0g144hriUShYZf51K-ZEhfYAtFdeMV3flo_FIhqY6cA'},icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
