'use client';
import {useState} from 'react';
export default function LoginForm(){
 const [signup,setSignup]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setError('');setBusy(true);const f=new FormData(e.currentTarget);try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(f),mode:signup?'signup':'login'})});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error);window.location.assign('/')}catch(e){setError(e instanceof Error?e.message:'다시 시도해 주세요.');setBusy(false)}}
 return <section className="auth-card"><p className="eyebrow">TOGETHER, EVERY DAY</p><h1>{signup?'함께 시작해요.':'다시 만나 반가워요.'}</h1><p>나의 속도로 운동하고, 친구와 꾸준히.</p><form onSubmit={submit} className="record-form">
 <label>아이디<input name="username" required pattern="[A-Za-z0-9_]{4,30}" minLength={4} maxLength={30} autoComplete="username" placeholder="영문·숫자·밑줄 4~30자"/></label>
 <label>비밀번호<input name="password" type="password" required minLength={12} maxLength={128} autoComplete={signup?'new-password':'current-password'} placeholder="12자 이상"/></label>
 {signup&&<><label>친구에게 보일 이름<input name="name" required maxLength={24} autoComplete="nickname"/></label><label>친구 초대 코드 (선택)<input name="invite" maxLength={16} placeholder="친구가 알려준 16자리 코드"/></label><p className="setting-note">코드 없이 가입하면 나만의 클럽이 만들어져요. 친구에게 설정의 초대 코드를 공유하세요. 기록과 사진은 같은 클럽 멤버에게만 보여요.</p><p className="setting-note">현재 비밀번호 찾기는 지원하지 않아요. 아이디와 비밀번호를 잘 보관해 주세요.</p></>}
 {error&&<p role="alert" className="form-error">{error}</p>}<button className="primary" disabled={busy}>{busy?'잠시만 기다려 주세요…':signup?'가입하고 시작하기':'로그인'}</button>
 </form><button className="text-button" disabled={busy} onClick={()=>{setSignup(!signup);setError('')}}>{signup?'이미 계정이 있어요 · 로그인':'처음이에요 · 회원가입'}</button></section>
}
