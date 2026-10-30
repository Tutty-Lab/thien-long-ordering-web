import type { IncomingMessage,ServerResponse } from 'node:http';
type VercelRequest=Pick<IncomingMessage,'headers'|'method'> & {query:Record<string,string|string[]|undefined>;cookies:Record<string,string|undefined>;body:Record<string,unknown>};
type VercelResponse=ServerResponse & {status(code:number):VercelResponse;json(body:unknown):VercelResponse};
import { neon } from '@neondatabase/serverless';
import { createHash,randomUUID } from 'node:crypto';
import { z } from 'zod';
import { orderInput } from '../server/contracts.js';
import { equal,session,valid } from '../server/security.js';
export default async function handler(req:VercelRequest,res:VercelResponse){
 const correlationId=randomUUID();res.setHeader('Cache-Control','no-store');res.setHeader('X-Request-ID',correlationId);
 const action=String(req.query.action||'');
 const secret=process.env.SESSION_SECRET||'';
 const authorized=()=>secret.length>=32&&valid(req.cookies?.tl_admin||'',secret);
 try{
  if(req.method!=='GET'&&req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`&&req.headers.origin!==`http://${req.headers.host}`)return res.status(403).json({error:'Origin rejected'});
  if(action==='session'&&req.method==='GET')return res.status(200).json({authenticated:authorized()});
  if(action==='admin-orders'&&!authorized())return res.status(401).json({error:'Authentication required'});
  const url=process.env.DATABASE_URL;if(!url)return res.status(503).json({error:'Database unavailable'});
  const sql=neon(url);
  const limit=async(bucket:string,max:number)=>{const key=createHash('sha256').update(bucket+':'+String(req.headers['x-real-ip']||'unknown')).digest('hex');const rows=await sql`INSERT INTO rate_limits(key,hits,expires_at) VALUES(${key},1,now()+interval '5 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.hits+1 END,expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '5 minutes' ELSE rate_limits.expires_at END RETURNING hits`;return Number(rows[0].hits)<=max};
  if(action==='login'&&req.method==='POST'){
   if(!await limit('login',10))return res.status(429).json({error:'Too many attempts'});
   const password=process.env.ADMIN_PASSWORD||'';if(password.length<12||secret.length<32)return res.status(503).json({error:'Admin not configured'});
   if(!equal(String(req.body?.username||''),'admin')||!equal(String(req.body?.password||''),password))return res.status(401).json({error:'Invalid credentials'});
   res.setHeader('Set-Cookie',`tl_admin=${session(secret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return res.json({authenticated:true});
  }
  if(action==='logout'&&req.method==='POST'){res.setHeader('Set-Cookie','tl_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return res.json({ok:true})}
  if(action==='menu'&&req.method==='GET'){const rows=await sql`SELECT * FROM menu_items WHERE available=true ORDER BY id`;return res.json(rows.map(x=>({id:x.id,name:x.name,category:x.category,description:x.description,image:x.image,price:Number(x.price_cents)/100,sale:x.sale_cents===null?null:Number(x.sale_cents)/100})))}
  if(action==='orders'&&req.method==='POST'){
   const parsed=orderInput.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid order'});
   const input=parsed.data,hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
   const previous=await sql`SELECT id,total_cents,request_hash FROM orders WHERE idempotency_key=${input.key}`;
   if(previous.length){if(previous[0].request_hash!==hash)return res.status(409).json({error:'Idempotency conflict'});return res.json({id:previous[0].id,total:Number(previous[0].total_cents)/100})}
   if(!await limit('order',10))return res.status(429).json({error:'Too many orders'});
   const catalog=await sql`SELECT id,name,COALESCE(sale_cents,price_cents) AS price FROM menu_items WHERE available=true`;
   if(input.items.some(i=>!catalog.some(x=>x.id===i.id)))return res.status(400).json({error:'Item unavailable'});
   const lines=input.items.map(i=>{const item=catalog.find(x=>x.id===i.id);if(!item)throw new Error('INVALID_ITEM');return {id:i.id,name:item.name,quantity:i.quantity,unitCents:Number(item.price)}});
   const total=lines.reduce((sum,x)=>sum+x.unitCents*x.quantity,0),id=randomUUID();
   const rows=await sql`INSERT INTO orders(id,idempotency_key,request_hash,customer_name,phone,address,note,items,total_cents) VALUES(${id},${input.key},${hash},${input.name},${input.phone},${input.address},${input.note},${JSON.stringify(lines)}::jsonb,${total}) ON CONFLICT(idempotency_key) DO UPDATE SET idempotency_key=orders.idempotency_key RETURNING id,total_cents,request_hash`;
   if(rows[0].request_hash!==hash)return res.status(409).json({error:'Idempotency conflict'});
   return res.status(201).json({id:rows[0].id,total:Number(rows[0].total_cents)/100});
  }
  if(action==='admin-orders'&&authorized()){
   if(req.method==='GET')return res.json(await sql`SELECT id,customer_name,phone,address,note,items,total_cents,status,created_at FROM orders ORDER BY created_at DESC LIMIT 200`);
   if(req.method==='PATCH'){const parsed=z.object({id:z.uuid(),status:z.enum(['NEW','PREPARING','READY','DONE','CANCELLED'])}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid status or order ID'});const {id,status}=parsed.data;const rows=await sql`UPDATE orders SET status=${status} WHERE id=${id}::uuid RETURNING id`;return res.status(rows.length?200:404).json({ok:!!rows.length})}
  }
  return res.status(action.startsWith('admin')?401:404).json({error:'Not available'});
 }catch(error){console.error(JSON.stringify({correlationId,event:'request_failed',errorType:error instanceof Error?error.name:'Unknown'}));return res.status(503).json({error:'Service unavailable',correlationId})}
}

