import {createServer} from 'node:http';
import {loadEnv,createServer as createViteServer} from 'vite';
import handler from '../api/index.js';

// Local-only adapter. No remote credentials are fetched; .env.local is operator supplied.
const env=loadEnv('development',process.cwd(),'');
for(const key of ['DATABASE_URL','ADMIN_PASSWORD','SESSION_SECRET'])if(!process.env[key]&&env[key])process.env[key]=env[key];
const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
const server=createServer(async(req,res)=>{
 const url=new URL(req.url||'/','http://127.0.0.1');
 if(url.pathname!=='/api/index'){vite.middlewares(req,res);return}
 const headers=req.headers;
 // Loopback binding plus Host validation prevents DNS rebinding to the local API.
 if(!/^((127\.0\.0\.1|localhost)(:\d+)?)$/.test(headers.host||'')){res.writeHead(403);res.end('Invalid host');return}
 const response=Object.assign(res,{status(code:number){res.statusCode=code;return response},json(value:unknown){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));return response}});
 try{
  let size=0;const chunks:Buffer[]=[];
  for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>65536){response.status(413).json({error:'Request too large'});return}chunks.push(bytes)}
  const raw=Buffer.concat(chunks).toString();
  let body:Record<string,unknown>={};
  if(raw){try{body=JSON.parse(raw)}catch{response.status(400).json({error:'Invalid JSON'});return}}
  const cookies=Object.fromEntries((headers.cookie||'').split(';').filter(Boolean).map(x=>{const at=x.indexOf('=');return [x.slice(0,at).trim(),x.slice(at+1)]}));
  // HTTP loopback only: local cookie omits Secure. Production handler stays unchanged.
  const setHeader=response.setHeader.bind(response);
  response.setHeader=((name:string,value:unknown)=>setHeader(name,name.toLowerCase()==='set-cookie'&&typeof value==='string'?value.replace(/; Secure/g,''):value as string)) as typeof response.setHeader;
  await handler(Object.assign(req,{query:Object.fromEntries(url.searchParams),cookies,body}),response);
 }catch{if(!res.headersSent)response.status(500).json({error:'Local server error'});else res.end()}
});
const port=Number(process.env.PORT||5174);
server.listen(port,'127.0.0.1',()=>console.log(`Local frontend + API: http://127.0.0.1:${port}`));
async function stop(){server.close();await vite.close();process.exit(0)}
process.on('SIGINT',()=>void stop());process.on('SIGTERM',()=>void stop());
