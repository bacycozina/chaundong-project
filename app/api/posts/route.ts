import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,bucket,json,sameOrigin} from '@/db/store';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();if(!user)return json({error:'로그인이 필요해요.'},401);try{const db=database();const rows=await db.prepare(`SELECT p.*, (SELECT COUNT(*) FROM cheers c WHERE c.post_id=p.id) AS cheers, EXISTS(SELECT 1 FROM cheers c WHERE c.post_id=p.id AND c.user_id=?) AS cheered FROM posts p ORDER BY p.created_at DESC`).bind(user.userId).all();return json({posts:rows.results.map(p=>({...p,photo:p.photo_key?'/api/photos/'+p.id:null,photo_key:undefined}))})}catch(e){console.error('load posts failed',e);return json({error:'기록을 불러오지 못했어요. 다시 시도해 주세요.'},503)}}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'로그인이 필요해요.'},401);if(!sameOrigin(request))return json({error:'요청을 확인할 수 없어요.'},403);
 let key:string|null=null;
 try{
 const max=6*1024*1024;if(Number(request.headers.get('content-length'))>max)return json({error:'사진은 5MB 이하로 선택해 주세요.'},413);
 if(!request.body)return json({error:'운동 기록이 비어 있어요.'},400);
 const reader=request.body.getReader();const chunks:Uint8Array[]=[];let total=0;for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>max){await reader.cancel();return json({error:'사진은 5MB 이하로 선택해 주세요.'},413)}chunks.push(value)}
 const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 const f=await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();
 const name=String(f.get('name')||'').trim(),kind=String(f.get('kind')||''),minutes=Number(f.get('minutes')),note=String(f.get('note')||'').trim();
 if(!name||name.length>24||!['헬스','러닝','홈트','기타'].includes(kind)||!Number.isInteger(minutes)||minutes<1||minutes>1440||note.length>500)return json({error:'이름, 운동 종류, 시간(1~1,440분)을 확인해 주세요.'},400);
 const id=crypto.randomUUID(),created=Date.now(),db=database();const photo=f.get('photo');
 if(photo instanceof File&&photo.size){if(photo.size>5*1024*1024)return json({error:'사진은 5MB 이하로 선택해 주세요.'},413);const data=await photo.arrayBuffer(),b=new Uint8Array(data);let type='';if(b[0]===255&&b[1]===216&&b[2]===255)type='image/jpeg';else if([137,80,78,71,13,10,26,10].every((x,i)=>b[i]===x))type='image/png';else if(new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP')type='image/webp';if(!type)return json({error:'JPG, PNG, WEBP 사진을 선택해 주세요.'},400);key='photos/'+id;await bucket().put(key,data,{httpMetadata:{contentType:type}})}
 await db.prepare('INSERT INTO posts (id,user_id,name,kind,minutes,note,photo_key,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,user.userId,name,kind,minutes,note,key,created).run();
 return json({post:{id,user_id:user.userId,name,kind,minutes,note,photo:key?'/api/photos/'+id:null,created_at:created,cheers:0,cheered:0}},201);
 }catch(e){if(key){try{await bucket().delete(key)}catch{}}console.error('save post failed',e);return json({error:'저장하지 못했어요. 입력한 내용은 그대로 있어요. 잠시 후 다시 시도해 주세요.'},503)}
}
