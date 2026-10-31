import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {normalizeImage,MAX_IMAGE_BYTES} from '../server/image.js';
import {menuInput} from '../server/admin-contracts.js';
test('uploaded image is decoded and normalized to WebP with bounded size',async()=>{
 const png=await sharp({create:{width:12,height:8,channels:3,background:'#cc3300'}}).png().toBuffer();
 const output=await normalizeImage('data:image/png;base64,'+png.toString('base64'));
 assert.ok(output.startsWith('data:image/webp;base64,'));
 const bytes=Buffer.from(output.split(',')[1],'base64');assert.ok(bytes.length<=MAX_IMAGE_BYTES);const metadata=await sharp(bytes).metadata();assert.equal(metadata.format,'webp');assert.equal(metadata.width,12);
});
test('invalid bytes, SVG, malformed base64 and excessive bytes are rejected',async()=>{
 for(const image of ['data:image/svg+xml;base64,PHN2Zy8+','data:image/png;base64,YWJjZA==','data:image/png;base64,A','data:image/png;base64,'+Buffer.alloc(MAX_IMAGE_BYTES+1).toString('base64')])await assert.rejects(()=>normalizeImage(image));
});
test('legacy HTTPS images remain supported, image contract bounds upload strings',async()=>{
 assert.equal(await normalizeImage('https://example.com/image.jpg'),'https://example.com/image.jpg');
 const item={id:'1',name:'Dish',category:'Menu',description:'',image:'data:image/svg+xml;base64,PHN2Zy8+',price_cents:100,sale_cents:null,available:true};assert.equal(menuInput.safeParse(item).success,false);
});
