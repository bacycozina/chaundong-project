import test from 'node:test';
import assert from 'node:assert/strict';
import {DAY,WEEK,dayStart,weekStart,dailyStreak,weeklyStreak,elapsed,challengeProgress} from '../lib/workout.mjs';
const time=s=>Date.parse(s+'T12:00:00+09:00');
const post=(day,user_id='a',kind='러닝')=>({created_at:time(day),user_id,kind});
test('Korean day and Monday week boundaries are independent of browser timezone',()=>{
 assert.equal(dayStart(Date.parse('2026-09-21T15:00:00Z')),Date.parse('2026-09-22T00:00:00+09:00'));
 assert.equal(weekStart(time('2026-09-27')),Date.parse('2026-09-21T00:00:00+09:00'));
});
test('daily streak survives an unfinished today, deduplicates days, breaks on missed day',()=>{
 const rows=[post('2026-09-20'),post('2026-09-21'),post('2026-09-21')];
 assert.equal(dailyStreak(rows,time('2026-09-22')),2);
 assert.equal(dailyStreak(rows,time('2026-09-23')),0);
 assert.equal(dailyStreak([...rows,post('2026-09-22')],time('2026-09-22')),3);
});
test('weekly streak uses the goal effective in each week, and preserves last week until this week ends',()=>{
 const rows=['2026-09-07','2026-09-08','2026-09-09','2026-09-14','2026-09-15','2026-09-16','2026-09-21'].map(d=>post(d));
 assert.equal(weeklyStreak(rows,[],time('2026-09-22')),2);
 const changes=[{effective_week:weekStart(time('2026-09-21')),days:1}];
 assert.equal(weeklyStreak(rows,changes,time('2026-09-22')),3);
 assert.equal(weeklyStreak(rows,[{effective_week:weekStart(time('2026-09-28')),days:1}],time('2026-09-22')),2);
 assert.equal(weeklyStreak(rows,[],time('2026-09-28')),0);
});
test('timer computes elapsed time after suspension without ticking, excludes paused time',()=>{
 assert.equal(elapsed({accumulated:120000,startedAt:1000},361000),480000);
 assert.equal(elapsed({accumulated:120000,startedAt:null},361000),120000);
 assert.equal(elapsed({accumulated:0,startedAt:1000},500),0);
});
test('challenge counts distinct matching days, scoped by member and inclusive start/exclusive end',()=>{
 const c={starts_at:dayStart(time('2026-09-21')),ends_at:dayStart(time('2026-09-21'))+7*DAY,kind:'러닝'};
 const rows=[post('2026-09-20'),post('2026-09-21'),post('2026-09-21'),post('2026-09-22','b'),post('2026-09-23','a','홈트'),post('2026-09-27'),post('2026-09-28')];
 assert.equal(challengeProgress(rows,c,'a'),2);
 assert.equal(challengeProgress(rows,{...c,kind:'전체'},'a'),3);
 assert.equal(c.ends_at-c.starts_at,WEEK);
 assert.equal(challengeProgress(rows.filter(p=>p.created_at!==time('2026-09-27')),c,'a'),1);
});
