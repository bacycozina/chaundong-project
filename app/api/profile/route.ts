import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,json,sameOrigin} from '@/db/store';
import {weekStart,WEEK,goalAt} from '@/lib/workout.mjs';
export async function GET(){
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 const db=database(),profile=await db.prepare('SELECT name,ranking_public,nudges_enabled FROM users WHERE id=?').bind(u.userId).first();
 const goals=await db.prepare('SELECT effective_week,days FROM goal_changes WHERE user_id=? ORDER BY effective_week').bind(u.userId).all();
 return json({profile:{...profile,goal:goalAt(goals.results,weekStart()),nextGoal:goalAt(goals.results,weekStart()+WEEK),inviteCode:u.inviteCode}});
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return json({error:'잘못된 요청이에요.'},403);
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 try{const b=await request.json() as {name?:unknown;goal?:unknown;rankingPublic?:unknown;nudgesEnabled?:unknown};
 const name=typeof b.name==='string'?b.name.trim():'';
 if(!name||name.length>24||!Number.isInteger(b.goal)||Number(b.goal)<1||Number(b.goal)>7||typeof b.rankingPublic!=='boolean'||typeof b.nudgesEnabled!=='boolean')return json({error:'이름과 주간 목표(1~7일)를 확인해 주세요.'},400);
 const db=database();await db.batch([
 db.prepare('UPDATE users SET name=?,ranking_public=?,nudges_enabled=? WHERE id=?').bind(name,Number(b.rankingPublic),Number(b.nudgesEnabled),u.userId),
 db.prepare('UPDATE posts SET name=? WHERE user_id=? AND club_id=?').bind(name,u.userId,u.clubId),
 db.prepare('INSERT INTO goal_changes (user_id,effective_week,days) VALUES (?,?,?) ON CONFLICT(user_id,effective_week) DO UPDATE SET days=excluded.days').bind(u.userId,weekStart()+WEEK,b.goal)
 ]);return json({ok:true});
 }catch{return json({error:'설정을 저장하지 못했어요.'},503)}
}
