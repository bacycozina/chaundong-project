import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,json,sameOrigin} from '@/db/store';
import {cleanupPhotos} from '@/db/photo-cleanup';
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,{params}:Context){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 try{const {id}=await params,b=await request.json() as Record<string,unknown>;
 if(!['헬스','러닝','홈트','기타'].includes(String(b.kind))||!Number.isInteger(b.minutes)||Number(b.minutes)<1||Number(b.minutes)>1440||typeof b.note!=='string'||b.note.length>500)return json({error:'운동 종류, 시간(1~1,440분), 메모를 확인해 주세요.'},400);
 const result=await database().prepare('UPDATE posts SET kind=?,minutes=?,note=? WHERE id=? AND user_id=? AND club_id=?').bind(b.kind,b.minutes,b.note.trim(),id,u.userId,u.clubId).run();
 return result.meta.changes?json({ok:true}):json({error:'내 운동 기록을 찾을 수 없어요.'},404);
 }catch{return json({error:'기록을 수정하지 못했어요.'},503)}
}
export async function DELETE(request:Request,{params}:Context){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 const {id}=await params;
 const db=database(),results=await db.batch([
 db.prepare('INSERT OR IGNORE INTO photo_cleanup (photo_key) SELECT photo_key FROM posts WHERE id=? AND user_id=? AND club_id=? AND photo_key IS NOT NULL').bind(id,u.userId,u.clubId),
 db.prepare('DELETE FROM posts WHERE id=? AND user_id=? AND club_id=?').bind(id,u.userId,u.clubId)]);
 await cleanupPhotos();
 return results[1].meta.changes?json({ok:true}):json({error:'내 운동 기록을 찾을 수 없어요.'},404);
}
