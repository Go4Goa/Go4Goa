import { createContext,useContext,useEffect,useState,type ReactNode } from 'react';
import type { Account,AppConfig } from '../shared/model.ts';
import { api,setCsrf } from './api.ts';
const Context=createContext<{account:Account|null;config:AppConfig|null;ready:boolean;refresh:()=>Promise<void>}>({account:null,config:null,ready:false,refresh:async()=>{}});
export function AppProvider({children}:{children:ReactNode}){const[account,setAccount]=useState<Account|null>(null),[config,setConfig]=useState<AppConfig|null>(null),[ready,setReady]=useState(false);async function refresh(){const d=await api<{account:Account|null}>('/auth/me');setAccount(d.account);setCsrf(d.account?.csrf||'');}useEffect(()=>{void Promise.all([refresh(),api<AppConfig>('/config').then(setConfig)]).catch(()=>{}).finally(()=>setReady(true));},[]);return <Context.Provider value={{account,config,ready,refresh}}>{children}</Context.Provider>;}
export const useApp=()=>useContext(Context);
