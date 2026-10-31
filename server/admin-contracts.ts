import {z} from 'zod';
const categoryName=z.string().trim().min(1).max(80).refine(x=>!['Ưu đãi','Tất cả'].includes(x),'Reserved category name');
export const categoryInput=z.object({name:categoryName});
export const menuInput=z.object({id:z.string().min(1).max(60),name:z.string().trim().min(2).max(160),category:categoryName,description:z.string().max(1000),image:z.union([z.literal(''),z.string().max(175000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/),z.url().refine(x=>new URL(x).protocol==='https:','HTTPS required')]),price_cents:z.number().int().min(1).max(1000000),sale_cents:z.number().int().min(1).nullable(),available:z.boolean()}).refine(x=>x.sale_cents===null||x.sale_cents<=x.price_cents,'Discount exceeds price');
export const restaurantInput=z.object({name:z.string().trim().min(2).max(120),address:z.string().trim().min(3).max(300),phone:z.string().max(40),preparation_minutes:z.number().int().min(5).max(180)});

export const availabilityInput=z.object({id:z.string().min(1).max(60),available:z.boolean()}).strict();
