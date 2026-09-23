import { pbkdf2Sync, scryptSync, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
export const tokenHash=(value:string)=>createHash('sha256').update(value).digest('hex');
export const randomToken=()=>randomBytes(32).toString('hex');
// OWASP's 16 MiB scrypt profile; production Workers caps PBKDF2 iterations.
const prefix='scrypt:16384:8:5:';
export function passwordHash(password:string,salt:string){return prefix+scryptSync(password,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024}).toString('hex')}
export function verifyPassword(password:string,salt:string,stored:string){
 const actual=stored.startsWith(prefix)?passwordHash(password,salt):/^[a-f0-9]{64}$/.test(stored)?pbkdf2Sync(password,salt,600000,32,'sha256').toString('hex'):'';
 if(!actual)return false;
 const x=Buffer.from(actual),y=Buffer.from(stored);return x.length===y.length&&timingSafeEqual(x,y);
}
