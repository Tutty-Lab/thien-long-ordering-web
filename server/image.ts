import sharp from 'sharp';
export const MAX_IMAGE_BYTES=128*1024;
export async function normalizeImage(value:string):Promise<string>{
 if(!value.startsWith('data:'))return value;
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
 if(!match||match[2].length%4!==0)throw new Error('Invalid image');
 const bytes=Buffer.from(match[2],'base64');
 if(!bytes.length||bytes.length>MAX_IMAGE_BYTES)throw new Error('Image too large');
 const image=sharp(bytes,{limitInputPixels:16000000,animated:false,failOn:'warning'});
 const metadata=await image.metadata();
 if(!['png','jpeg','webp'].includes(metadata.format||'')||(metadata.pages??1)>1)throw new Error('Unsupported image');
 const output=await image.rotate().resize({width:960,height:960,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toBuffer();
 if(output.length>MAX_IMAGE_BYTES)throw new Error('Image too large');
 return 'data:image/webp;base64,'+output.toString('base64');
}
