export async function prepareImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Chọn ảnh JPG, PNG hoặc WebP dưới 10 MB.');
 const bitmap=await createImageBitmap(file);
 try{
 const scale=Math.min(1,960/bitmap.width,960/bitmap.height),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Không đọc được ảnh.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 for(const quality of [.8,.65,.45]){const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.type==='image/webp'&&blob.size<=128*1024)return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Không đọc được ảnh.'));reader.readAsDataURL(blob)})}
 throw Error('Ảnh quá lớn. Chọn ảnh nhỏ hơn.');
 }finally{bitmap.close()}
}
