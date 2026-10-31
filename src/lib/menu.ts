export type PublicMenuItem={id:string;name:string;category:string;description:string;image:string;price:number;sale:number|null};
export function parsePublicMenu(value:unknown):PublicMenuItem[]{
 if(!Array.isArray(value))throw new Error('Invalid menu response');
 return value.map(item=>{
  if(!item||typeof item!=='object'||!['id','name','category','description','image'].every(key=>typeof item[key]==='string')||typeof item.price!=='number'||!Number.isFinite(item.price)||item.price<=0||(item.sale!==null&&(typeof item.sale!=='number'||!Number.isFinite(item.sale)||item.sale<=0||item.sale>item.price)))throw new Error('Invalid menu item');
  return {id:item.id,name:item.name,category:item.category,description:item.description,image:item.image,price:item.price,sale:item.sale};
 });
}
