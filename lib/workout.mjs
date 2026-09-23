export const DAY=86400000, WEEK=7*DAY;
export const dayStart=(time=Date.now())=>Math.floor((time+32400000)/DAY)*DAY-32400000;
export const weekStart=(time=Date.now())=>{const d=dayStart(time);return d-((new Date(d+32400000).getUTCDay()+6)%7)*DAY};
export const dayKey=time=>new Date(time+32400000).toISOString().slice(0,10);
export function elapsed(timer,now=Date.now()){return Math.max(0,timer.accumulated+(timer.startedAt===null?0:now-timer.startedAt))}
export function dailyStreak(posts,now=Date.now()){
 const days=new Set(posts.filter(p=>p.created_at<=now).map(p=>dayStart(p.created_at)));
 let cursor=dayStart(now);if(!days.has(cursor))cursor-=DAY;
 let count=0;while(days.has(cursor)){count++;cursor-=DAY}return count;
}
export function goalAt(changes,week){return changes.filter(g=>g.effective_week<=week).sort((a,b)=>b.effective_week-a.effective_week)[0]?.days||3}
export function weeklyStreak(posts,changes,now=Date.now()){
 const weeks=new Map();for(const p of posts){if(p.created_at>now)continue;const w=weekStart(p.created_at);if(!weeks.has(w))weeks.set(w,new Set());weeks.get(w).add(dayStart(p.created_at))}
 const complete=w=>(weeks.get(w)?.size||0)>=goalAt(changes,w);
 let cursor=weekStart(now);if(!complete(cursor))cursor-=WEEK;
 let count=0;while(complete(cursor)){count++;cursor-=WEEK}return count;
}
export function challengeProgress(posts,challenge,userId){return new Set(posts.filter(p=>p.user_id===userId&&p.created_at>=challenge.starts_at&&p.created_at<challenge.ends_at&&(challenge.kind==='전체'||challenge.kind===p.kind)).map(p=>dayStart(p.created_at))).size}
