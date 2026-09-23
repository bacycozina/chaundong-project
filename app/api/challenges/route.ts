import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,json,sameOrigin} from '@/db/store';
import {DAY,dayStart,challengeProgress} from '@/lib/workout.mjs';
type Challenge={id:string;club_id:string;creator_id:string;title:string;kind:string;target_days:number;starts_at:number;ends_at:number;created_at:number};
export async function GET(){
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 const db=database(),rows=await db.prepare('SELECT * FROM challenges WHERE club_id=? ORDER BY created_at DESC').bind(u.clubId).all<Challenge>();
 const members=await db.prepare('SELECT m.challenge_id,m.user_id,u.name FROM challenge_members m JOIN users u ON u.id=m.user_id WHERE u.club_id=?').bind(u.clubId).all<{challenge_id:string;user_id:string;name:string}>();
 const posts=await db.prepare('SELECT user_id,created_at,kind FROM posts WHERE club_id=?').bind(u.clubId).all();
 return json({challenges:rows.results.map(c=>({...c,joined:members.results.some(m=>m.challenge_id===c.id&&m.user_id===u.userId),participants:members.results.filter(m=>m.challenge_id===c.id).map(m=>({...m,days:challengeProgress(posts.results,c,m.user_id)}))}))});
}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 try{const b=await request.json() as Record<string,unknown>,title=typeof b.title==='string'?b.title.trim():'',kind=String(b.kind),duration=Number(b.duration),target=Number(b.target);
 if(!title||title.length>60||!['전체','헬스','러닝','홈트','기타'].includes(kind)||!Number.isInteger(duration)||duration<1||duration>90||!Number.isInteger(target)||target<1||target>duration)return json({error:'제목, 기간(1~90일), 목표 일수를 확인해 주세요.'},400);
 const now=Date.now(),id=crypto.randomUUID(),db=database();await db.batch([
 db.prepare('INSERT INTO challenges (id,club_id,creator_id,title,kind,target_days,starts_at,ends_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,u.clubId,u.userId,title,kind,target,dayStart(now),dayStart(now)+duration*DAY,now),
 db.prepare('INSERT INTO challenge_members (challenge_id,user_id) VALUES (?,?)').bind(id,u.userId)]);
 return json({ok:true},201);
 }catch{return json({error:'챌린지를 만들지 못했어요.'},503)}
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 try{const b=await request.json() as {id?:string;join?:boolean};if(typeof b.id!=='string'||typeof b.join!=='boolean')return json({error:'참여 상태를 확인해 주세요.'},400);
 const db=database(),c=await db.prepare('SELECT id,ends_at FROM challenges WHERE id=? AND club_id=?').bind(b.id,u.clubId).first<{id:string;ends_at:number}>();
 if(!c)return json({error:'챌린지를 찾을 수 없어요.'},404);
 if(c.ends_at<=Date.now())return json({error:'종료된 챌린지예요.'},409);
 await db.prepare(b.join?'INSERT OR IGNORE INTO challenge_members (challenge_id,user_id) VALUES (?,?)':'DELETE FROM challenge_members WHERE challenge_id=? AND user_id=?').bind(c.id,u.userId).run();return json({ok:true});
 }catch{return json({error:'참여 상태를 저장하지 못했어요.'},503)}
}
