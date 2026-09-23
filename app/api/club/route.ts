import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,json} from '@/db/store';
import {dailyStreak,weeklyStreak,dayStart} from '@/lib/workout.mjs';
export async function GET(){
 const u=await getChatGPTUser();if(!u)return json({error:'로그인이 필요해요.'},401);
 const db=database();const [users,posts,goals]=await Promise.all([
 db.prepare('SELECT id,name,ranking_public,nudges_enabled FROM users WHERE club_id=?').bind(u.clubId).all<{id:string;name:string;ranking_public:number;nudges_enabled:number}>(),
 db.prepare('SELECT user_id,created_at,minutes FROM posts WHERE club_id=?').bind(u.clubId).all<{user_id:string;created_at:number;minutes:number}>(),
 db.prepare('SELECT g.* FROM goal_changes g JOIN users u ON u.id=g.user_id WHERE u.club_id=?').bind(u.clubId).all<{user_id:string;effective_week:number;days:number}>()]);
 const now=Date.now(),members=users.results.map(m=>{const rows=posts.results.filter(p=>p.user_id===m.id);return {...m,today:rows.some(p=>p.created_at>=dayStart(now)),dailyStreak:dailyStreak(rows,now),weeklyStreak:weeklyStreak(rows,goals.results.filter(g=>g.user_id===m.id),now),minutes:rows.reduce((s,p)=>s+p.minutes,0)}});
 return json({members:members.map(m=>({id:m.id,name:m.name,today:m.today,nudgesEnabled:!!m.nudges_enabled})),ranking:members.filter(m=>m.ranking_public).sort((a,b)=>b.weeklyStreak-a.weeklyStreak||b.dailyStreak-a.dailyStreak||b.minutes-a.minutes||a.id.localeCompare(b.id)).map(m=>({id:m.id,name:m.name,dailyStreak:m.dailyStreak,weeklyStreak:m.weeklyStreak,minutes:m.minutes}))});
}
