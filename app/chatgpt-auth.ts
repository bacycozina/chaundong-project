import {headers} from 'next/headers';
import {database} from '@/db/store';
import {tokenHash} from './auth-crypto';
// Kept as a compatibility export for existing routes; no external identity headers are trusted.
export async function getChatGPTUser(){
 const h=await headers(),token=(h.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('chaundong_session='))?.slice('chaundong_session='.length);
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await database().prepare('SELECT u.id,u.name,u.club_id,c.invite_code FROM sessions s JOIN users u ON u.id=s.user_id JOIN clubs c ON c.id=u.club_id WHERE s.token_hash=? AND s.expires_at>?').bind(tokenHash(token),Date.now()).first<{id:string;name:string;club_id:string;invite_code:string}>();
 return row?{userId:row.id,fullName:row.name,clubId:row.club_id,inviteCode:row.invite_code}:null;
}
export const chatGPTSignInPath=(_returnTo:string)=>'/login';
