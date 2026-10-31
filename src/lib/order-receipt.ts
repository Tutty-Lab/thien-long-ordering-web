export type OrderReceipt={id:string;total:number;items?:{id:string;name:string;quantity:number}[];customer?:{name:string;phone:string;note:string}};
export function parseOrderReceipt(value:unknown):OrderReceipt{
 if(!value||typeof value!=='object')throw new Error('Invalid order receipt');
 const {id,total}=value as Record<string,unknown>;
 if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||typeof total!=='number'||!Number.isFinite(total)||total<0)throw new Error('Invalid order receipt');
 return {id,total};
}
