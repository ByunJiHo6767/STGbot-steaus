// STGbot AI 함수 (Netlify Functions) — 주소: /api/chat
// 환경변수(Netlify 사이트 설정 > Environment variables): ANTHROPIC_API_KEY (필수)
const env=k=>process.env[k];
const MODELS={
  quick:env('MODEL_QUICK')||'claude-haiku-5-5',      // fire
  default:env('MODEL_DEFAULT')||'claude-sonnet-5-5',  // copter
  complex:env('MODEL_COMPLEX')||'claude-opus-5-5'     // steaus
};
const RPM=+(env('RATE_PER_MIN')||20),DAILY=+(env('DAILY_MAX')||2000),MAXTOK=+(env('MAX_TOKENS')||2000);
const hits=new Map();let day='',dayCount=0;
function limited(ip){
  const now=Date.now(),h=(hits.get(ip)||[]).filter(t=>now-t<60000);
  if(h.length>=RPM){hits.set(ip,h);return true}
  const d=new Date().toDateString();if(d!==day){day=d;dayCount=0}
  if(dayCount>=DAILY)return true;
  h.push(now);hits.set(ip,h);dayCount++;return false;
}
const json=(code,obj)=>new Response(JSON.stringify(obj),{status:code,headers:{'content-type':'application/json'}});

export default async (req,context)=>{
  if(req.method!=='POST')return json(405,{error:'method'});
  const KEY=env('ANTHROPIC_API_KEY');if(!KEY)return json(500,{error:'no key'});
  const ip=(context&&context.ip)||req.headers.get('x-nf-client-connection-ip')||'?';
  if(limited(ip))return json(429,{error:'limit'});
  let j;try{j=await req.json()}catch(e){return json(400,{error:'bad json'})}
  const{messages,images=[],tier='default'}=j||{};
  if(!Array.isArray(messages)||!messages.length||messages.length>40||
     !messages.every(m=>m&&(m.role==='user'||m.role==='assistant')&&typeof m.content==='string'&&m.content.length<60000))
    return json(400,{error:'bad messages'});
  const msgs=messages.map(m=>({role:m.role,content:m.content}));
  const okT=['image/jpeg','image/png','image/gif','image/webp'];
  const imgs=(Array.isArray(images)?images:[]).slice(0,5).filter(i=>i&&typeof i.d==='string'&&okT.includes(i.t));
  if(imgs.length){
    const l=msgs[msgs.length-1];if(l.role!=='user')return json(400,{error:'bad messages'});
    l.content=[...imgs.map(i=>({type:'image',source:{type:'base64',media_type:i.t,data:i.d}})),{type:'text',text:l.content}];
  }
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:MODELS[tier]||MODELS.default,max_tokens:MAXTOK,messages:msgs})});
    const jj=await r.json();
    if(!r.ok)return json(r.status===429?429:502,{error:(jj.error&&jj.error.message)||'api error'});
    return json(200,{text:(jj.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('')});
  }catch(e){return json(502,{error:'upstream'})}
};
export const config={path:'/api/chat'};
