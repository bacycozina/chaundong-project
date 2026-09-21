import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error('Photo storage unavailable');return env.BUCKET;}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}})}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return origin===new URL(request.url).origin;}
