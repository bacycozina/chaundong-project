import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:8787';
const suffix=randomBytes(5).toString('hex'),password=randomBytes(20).toString('hex');
async function call(path,{cookie='',method='GET',body,origin=base,headers={}}={}){
 const response=await fetch(base+path,{method,headers:{origin,...(cookie?{cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
 return {response,data:await response.json()};
}
async function signup(name,invite){const {response,data}=await call('/api/auth',{method:'POST',body:{mode:'signup',username:name+suffix,name,password,invite}});assert.equal(response.status,200,JSON.stringify(data));return response.headers.get('set-cookie').split(';')[0]}
assert.equal((await call('/api/posts')).response.status,401);
assert.equal((await call('/api/posts',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof@example.com'}})).response.status,401);
const a=await signup('tester_a');
const html=await (await fetch(base,{headers:{cookie:a}})).text();
const invite=html.match(/inviteCode\\?"\s*:\s*\\?"([A-F0-9]{16})/)?.[1];
assert.ok(invite,'Server-rendered user data includes club invitation');
const b=await signup('tester_b',invite),c=await signup('tester_c');
async function post(cookie,name){const f=new FormData();f.set('name',name);f.set('kind','러닝');f.set('minutes','30');f.set('note','Automated local integration test');f.set('photo',new Blob([Uint8Array.from([137,80,78,71,13,10,26,10,0])],{type:'image/png'}),'test.png');const r=await fetch(base+'/api/posts',{method:'POST',headers:{cookie,origin:base},body:f});const d=await r.json();assert.equal(r.status,201,JSON.stringify(d));return d.post}
const p=await post(a,'tester_a');
assert.equal((await call('/api/posts',{cookie:b})).data.posts.some(x=>x.id===p.id),true);
assert.equal((await call('/api/posts',{cookie:c})).data.posts.some(x=>x.id===p.id),false);
assert.equal((await fetch(base+p.photo,{headers:{cookie:b}})).status,200);
assert.equal((await fetch(base+p.photo,{headers:{cookie:c}})).status,404);
assert.equal((await call('/api/posts/'+p.id+'/cheer',{cookie:c,method:'POST',body:{active:true}})).response.status,404);
assert.equal((await call('/api/posts/'+p.id+'/cheer',{cookie:b,method:'POST',body:{active:true}})).response.status,200);
assert.equal((await call('/api/pokes',{cookie:b,method:'POST',body:{recipient_id:p.user_id}})).response.status,409);
assert.equal((await call('/api/auth',{cookie:a,method:'DELETE',origin:'https://evil.example'})).response.status,403);
assert.equal((await call('/api/auth',{method:'POST',body:{mode:'login',username:'tester_a'+suffix,password:'wrong-password-long-enough'}})).response.status,401);
assert.equal((await call('/api/auth',{cookie:a,method:'DELETE'})).response.status,200);
assert.equal((await call('/api/posts',{cookie:a})).response.status,401);
assert.equal((await call('/api/auth',{method:'POST',body:{mode:'login',username:'tester_a'+suffix,password}})).response.status,200);
console.log('PASS: signup, login, invite joining, isolated feeds/photos/cheers, nudge eligibility, CSRF, logout and forged identity rejection. Test data exists only in the selected test database.');
