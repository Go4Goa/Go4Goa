// Only metadata is read before source review. Never check out or execute PR code here.
module.exports=async({github,context,core})=>{
 const {owner,repo}=context.repo;const pr=context.payload.pull_request;
 if(!pr){core.setOutput('base',context.sha);core.setOutput('head',context.sha);return;}
 core.setOutput('base',pr.base.sha);core.setOutput('head',pr.head.sha);
 if(pr.user.login!=='layalabs')return; // Ordinary CI for owner/other contributors; no release authority.
 if(pr.user.id!==261854875)throw new Error('Author identity mismatch');
 if(pr.draft)throw new Error('Draft: source review and execution held');
 let receipt;
 try{const r=await github.rest.repos.getContent({owner,repo,path:`reviews/pr-${pr.number}.json`,ref:'automation/source-review'});receipt=JSON.parse(Buffer.from(r.data.content,'base64').toString());}
 catch{throw new Error('Awaiting cloud source review for this head and base. No candidate code executed.');}
 if(receipt.head!==pr.head.sha||receipt.base!==pr.base.sha||receipt.sourceReviewed!==true||Date.now()-Date.parse(receipt.reviewedAt)>86400000||Date.parse(receipt.reviewedAt)>Date.now()+300000||!Number.isFinite(Date.parse(receipt.reviewedAt)))throw new Error('Missing, stale or mismatched source-review receipt');
};
