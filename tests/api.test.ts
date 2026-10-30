import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
type Request=Parameters<typeof handler>[0];
type Response=Parameters<typeof handler>[1];
async function call(action:string,method='GET',headers:Record<string,string>={}){
 let code=200;let body:unknown;const responseHeaders:Record<string,unknown>={};
 const response={setHeader:(k:string,v:unknown)=>{responseHeaders[k]=v},status:(n:number)=>{code=n;return response},json:(value:unknown)=>{body=value;return response}};
 await handler({query:{action},method,headers:{host:'localhost',...headers},cookies:{},body:{}} as Request,response as unknown as Response);
 return {code,body,headers:responseHeaders};
}
test('unauthenticated admin is rejected before database access',async()=>{const r=await call('admin-orders');assert.equal(r.code,401);assert.equal(r.headers['Cache-Control'],'no-store');assert.ok(r.headers['X-Request-ID'])});
test('cross-origin mutations are rejected',async()=>{assert.equal((await call('orders','POST',{origin:'https://untrusted.example'})).code,403)});
test('session endpoint reports actual missing session',async()=>{assert.deepEqual((await call('session')).body,{authenticated:false})});
test('missing database fails closed',async()=>{const saved=process.env.DATABASE_URL;delete process.env.DATABASE_URL;try{assert.equal((await call('menu')).code,503)}finally{if(saved)process.env.DATABASE_URL=saved}});
