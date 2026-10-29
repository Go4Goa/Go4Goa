import { createContext,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import type { Account,AppConfig } from '../shared/model.ts';
import { api,setCsrf } from './api.ts';
import { clearMeetupDrafts } from './services/meetup-draft';
const Context=createContext<{account:Account|null;config:AppConfig|null;ready:boolean;refresh:()=>Promise<void>}>({account:null,config:null,ready:false,refresh:async()=>{}});
let guestRequest:Promise<unknown>|null=null;
function startGuest(){return guestRequest??=api('/auth/guest',{method:'POST',body:'{}'}).finally(()=>{guestRequest=null;});}
export function AppProvider({children}:{children:ReactNode}){
 const[account,setAccount]=useState<Account|null>(null),[config,setConfig]=useState<AppConfig|null>(null),[ready,setReady]=useState(false);
 const accountId=useRef<string|null>(null);
 function applyAccount(next:Account|null){if(!next||(accountId.current&&accountId.current!==next.id))clearMeetupDrafts();accountId.current=next?.id??null;setAccount(next);setCsrf(next?.csrf||'');}
 async function refresh(){let d=await api<{account:Account|null}>('/auth/me');if(!d.account&&config?.qa){await startGuest();d=await api<{account:Account|null}>('/auth/me');}applyAccount(d.account);}
 useEffect(()=>{
  async function initialize(){
   const [session,settings]=await Promise.all([api<{account:Account|null}>('/auth/me'),api<AppConfig>('/config')]);
   setConfig(settings);
   // Skip account setup while reviewing the local UX with fictional seed data.
   const localPreview=import.meta.env.DEV&&settings.demo&&!settings.qa&&['127.0.0.1','localhost','[::1]'].includes(window.location.hostname);
   if(!session.account&&settings.qa){
    await startGuest();const guest=await api<{account:Account|null}>('/auth/me');applyAccount(guest.account);
   }else if(!session.account&&localPreview){
    await api('/auth/demo',{method:'POST',body:JSON.stringify({role:'resident'})});
    await refresh();
   }else applyAccount(session.account);
  }
  void initialize().catch(()=>{}).finally(()=>setReady(true));
 },[]);
 return <Context.Provider value={{account,config,ready,refresh}}>{children}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
