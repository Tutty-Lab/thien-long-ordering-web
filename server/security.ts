import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export function session(secret:string,now=Date.now()){const value=Buffer.from(JSON.stringify({exp:now+8*3600000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return value+'.'+createHmac('sha256',secret).update(value).digest('base64url')}
export function valid(token:string,secret:string,now=Date.now()){try{const parts=token.split('.');if(parts.length!==2)return false;const [value,sig]=parts;return equal(sig,createHmac('sha256',secret).update(value).digest('base64url'))&&JSON.parse(Buffer.from(value,'base64url').toString()).exp>now}catch{return false}}

export function adminConfigured(password:string,secret:string,minimumPasswordLength:6|12=12){return password.length>=minimumPasswordLength&&secret.length>=32}
