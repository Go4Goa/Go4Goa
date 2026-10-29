import { Button } from './components/arc/button/button';
import { Component,type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context';
import App from './App';
import './components/arc/foundation.css';
import './styles.css';
class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<div className="page narrow"><h1>The page could not load.</h1><p>Reload to try again. Unsubmitted drafts may be cleared.</p><Button variant="ghost" className="button-link primary" onClick={()=>window.location.reload()}>Reload GO-GOA</Button></div>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><BrowserRouter><AppProvider><App/></AppProvider></BrowserRouter></ErrorBoundary>);
if(import.meta.env.PROD&&'serviceWorker'in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>{});});}
