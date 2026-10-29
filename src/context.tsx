import { createContext,useContext,useEffect,useState,type ReactNode } from 'react';
import type { Account,AppConfig } from '../shared/model.ts';
import { api,setCsrf } from './api.ts';
import { clearMeetupDrafts } from './services/meetup-draft';
const Context=createContext<{account:Account|null;config:AppConfig|null;ready:boolean;refresh:()=>Promise<void>}>({account:null,config:null,ready:false,refresh:async()=>{}});
export function AppProvider({children}:{children:ReactNode}){
 const[account,setAccount]=useState<Account|null>(null),[config,setConfig]=useState<AppConfig|null>(null),[ready,setReady]=useState(false);
 function applyAccount(next:Account|null){if(!next)clearMeetupDrafts();setAccount(next);setCsrf(next?.csrf||'');}
 async function refresh(){const d=await api<{account:Account|null}>('/auth/me');applyAccount(d.account);}
 useEffect(()=>{
  async function initialize(){
   const [session,settings]=await Promise.all([api<{account:Account|null}>('/auth/me'),api<AppConfig>('/config')]);
   setConfig(settings);
   // Skip account setup while reviewing the local UX with fictional seed data.
   const localPreview=import.meta.env.DEV&&settings.demo&&!settings.qa&&['127.0.0.1','localhost','[::1]'].includes(window.location.hostname);
   if(!session.account&&localPreview){
    await api('/auth/demo',{method:'POST',body:JSON.stringify({role:'resident'})});
    await refresh();
   }else applyAccount(session.account);
  }
  void initialize().catch(()=>{}).finally(()=>setReady(true));
 },[]);
 return <Context.Provider value={{account,config,ready,refresh}}>{children}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
