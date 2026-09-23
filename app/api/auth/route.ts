import {database,json,sameOrigin} from '@/db/store';
import {passwordHash,randomToken,tokenHash,matches} from '@/app/auth-crypto';
const ttl=60*60*24*14;
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 if(Number(request.headers.get('content-length'))>4096)return json({error:'입력 내용이 너무 길어요.'},413);
 try{
 const text=await request.text();if(text.length>4096)return json({error:'입력 내용이 너무 길어요.'},413);
 const b=JSON.parse(text) as Record<string,unknown>;
 const username=typeof b.username==='string'?b.username.trim().toLowerCase():'';
 const password=typeof b.password==='string'?b.password:'';
 const name=typeof b.name==='string'?b.name.trim():'';
 const mode=b.mode;
 if(!['login','signup'].includes(String(mode))||!/^\w{4,30}$/.test(username)||password.length<12||password.length>128)return json({error:'아이디는 영문·숫자·밑줄 4~30자, 비밀번호는 12~128자로 입력해 주세요.'},400);
 const db=database(),now=Date.now(),window=Math.floor(now/900000);
 // Atomic fixed-window counters protect both the originating IP and account.
 for(const subject of ['ip:'+ (request.headers.get('cf-connecting-ip')||'local'),'user:'+username]){
 const key=tokenHash(subject)+':'+window;
 const row=await db.prepare('INSERT INTO auth_limits (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,now+1800000).first<{attempts:number}>();
 if((row?.attempts||0)>(subject.startsWith('ip:')?30:10))return json({error:'시도가 너무 많아요. 15분 후 다시 시도해 주세요.'},429);
 }
 await db.prepare('DELETE FROM auth_limits WHERE expires_at<?').bind(now).run();
 let user=await db.prepare('SELECT * FROM users WHERE username=?').bind(username).first<{id:string;password_hash:string;salt:string}>();
 if(mode==='signup'){
 if(!name||name.length>24)return json({error:'이름은 1~24자로 입력해 주세요.'},400);
 if(user)return json({error:'다른 아이디를 선택해 주세요.'},409);
 const invite=typeof b.invite==='string'?b.invite.trim().toUpperCase():'';
 if(invite&&!/^[A-F0-9]{16}$/.test(invite))return json({error:'초대 코드를 확인해 주세요.'},400);
 const club=invite?await db.prepare('SELECT id FROM clubs WHERE invite_code=?').bind(invite).first<{id:string}>():null;
 if(invite&&!club)return json({error:'초대 코드를 확인해 주세요.'},400);
 const id=crypto.randomUUID(),clubId=club?.id||crypto.randomUUID(),salt=randomToken(),hash=passwordHash(password,salt);
 const statements=[];
 if(!club)statements.push(db.prepare('INSERT INTO clubs (id,invite_code) VALUES (?,?)').bind(clubId,randomToken().slice(0,16).toUpperCase()));
 statements.push(db.prepare('INSERT INTO users (id,username,name,password_hash,salt,club_id,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,username,name,hash,salt,clubId,now));
 await db.batch(statements);user={id,password_hash:hash,salt};
 }else{
 const actual=passwordHash(password,user?.salt||'00000000000000000000000000000000');
 if(!user||!matches(actual,user.password_hash))return json({error:'아이디 또는 비밀번호를 확인해 주세요.'},401);
 }
 const token=randomToken();await db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(tokenHash(token),user.id,now+ttl*1000).run();
 await db.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now).run();
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookie(token,ttl,request)}});
 }catch(e){console.error('auth failed',e instanceof Error?e.name:'Error');return json({error:'로그인 서비스를 준비 중이거나 일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'},503)}
}
export function cookie(token:string,age:number,request:Request){return 'chaundong_session='+token+'; HttpOnly; SameSite=Lax; Path=/; Max-Age='+age+(new URL(request.url).protocol==='https:'?'; Secure':'')}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const token=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('chaundong_session='))?.slice('chaundong_session='.length);
 if(token)await database().prepare('DELETE FROM sessions WHERE token_hash=?').bind(tokenHash(token)).run();
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookie('',0,request)}});
}
