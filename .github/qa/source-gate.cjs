// Only metadata is read before source review. Never check out or execute PR code here.
module.exports=async({github,context,core})=>{
 const {owner,repo}=context.repo;const eventPr=context.payload.pull_request;
 const pr=eventPr?(await github.rest.pulls.get({owner,repo,pull_number:eventPr.number})).data:null;
 if(!pr){core.setOutput('base',context.sha);core.setOutput('head',context.sha);core.setOutput('candidate',context.sha);return;}
 if(pr.head.sha!==eventPr.head.sha)throw new Error('Outdated run: PR head changed');
 if(pr.mergeable===false||!pr.merge_commit_sha)throw new Error('Integrated merge ref is not ready');
 core.setOutput('candidate',pr.merge_commit_sha);
 core.setOutput('base',pr.base.sha);core.setOutput('head',pr.head.sha);
 if(pr.user.login!=='layalabs')return; // Ordinary CI for owner/other contributors; no release authority.
 if(pr.user.id!==261854875)throw new Error('Author identity mismatch');
 if(pr.draft)throw new Error('Draft: source review and execution held');
 let receipt;
 try{const r=await github.rest.repos.getContent({owner,repo,path:`reviews/pr-${pr.number}.json`,ref:'automation/source-review'});receipt=JSON.parse(Buffer.from(r.data.content,'base64').toString());}
 catch{throw new Error('Awaiting cloud source review for this head and base. No candidate code executed.');}
 if(receipt.head!==pr.head.sha||receipt.base!==pr.base.sha||receipt.sourceReviewed!==true||Date.now()-Date.parse(receipt.reviewedAt)>86400000||Date.parse(receipt.reviewedAt)>Date.now()+300000||!Number.isFinite(Date.parse(receipt.reviewedAt)))throw new Error('Missing, stale or mismatched source-review receipt');
};
