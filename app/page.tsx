import MoveClub from './move-club';
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home(){
 const user=await getChatGPTUser();
 return <MoveClub user={user?{id:user.userId,name:user.fullName||'클럽 멤버'}:null} signInUrl={chatGPTSignInPath('/')}/>;
}
