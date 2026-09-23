import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,json,sameOrigin} from '@/db/store';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'로그인이 필요해요.'},401);
 const rows=await database().prepare('SELECT k.id,k.created_at,k.read_at,u.name AS sender_name FROM pokes k JOIN users u ON u.id=k.sender_id WHERE k.recipient_id=? AND u.club_id=? ORDER BY k.created_at DESC LIMIT 20').bind(user.userId,user.clubId).all();return json({pokes:rows.results});
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'로그인이 필요해요.'},401);
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 try{
 const body=await request.json() as {recipient_id?:unknown};
 const id=typeof body.recipient_id==='string'?body.recipient_id:'';
 const db=database(),now=Date.now(),start=Math.floor((now+32400000)/86400000)*86400000-32400000;
 const member=await db.prepare('SELECT id FROM users WHERE id=? AND club_id=? AND id<>? AND nudges_enabled=1').bind(id,user.clubId,user.userId).first();
 if(!member)return json({error:'같은 클럽의 친구를 선택해 주세요.'},404);
 const done=await db.prepare('SELECT id FROM posts WHERE user_id=? AND club_id=? AND created_at>=? LIMIT 1').bind(id,user.clubId,start).first();
 if(done)return json({error:'이미 오늘 운동한 친구예요.'},409);
 const result=await db.prepare('INSERT OR IGNORE INTO pokes (id,sender_id,recipient_id,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),user.userId,id,now).run();
 if(!result.meta.changes)return json({error:'오늘은 이미 깨우기를 보냈어요.'},429);
 return json({ok:true},201);
 }catch{return json({error:'깨우기를 보내지 못했어요.'},503)}
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const user=await getChatGPTUser();if(!user)return json({error:'로그인이 필요해요.'},401);
 try{const b=await request.json() as {before?:number};if(typeof b.before!=='number'||!Number.isFinite(b.before))return json({error:'알림 시간을 확인해 주세요.'},400);await database().prepare('UPDATE pokes SET read_at=? WHERE recipient_id=? AND created_at<=? AND read_at IS NULL').bind(Date.now(),user.userId,Math.min(b.before,Date.now())).run();return json({ok:true})}catch{return json({error:'알림을 저장하지 못했어요.'},503)}
}


