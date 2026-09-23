import { pbkdf2Sync, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
export const tokenHash=(value:string)=>createHash('sha256').update(value).digest('hex');
export const randomToken=()=>randomBytes(32).toString('hex');
export function passwordHash(password:string,salt:string){return pbkdf2Sync(password,salt,600000,32,'sha256').toString('hex')}
export function matches(a:string,b:string){const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&timingSafeEqual(x,y)}
