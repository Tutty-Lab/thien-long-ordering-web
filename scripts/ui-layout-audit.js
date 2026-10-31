async page => {
 // UI-CONSISTENCY-14. Run after local admin login. Never saves business data.
 const browserErrors=[];const onError=error=>browserErrors.push(error.message);page.on('pageerror',onError);
 const assert=(value,message)=>{if(!value)throw Error(message)};
 const widths=[320,390,540,768,1024,1440];
 const noOverflow=async label=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' page overflow');
 const centered=async(locator,label)=>{
  const r=await locator.boundingBox(),s=await locator.locator('svg').first().boundingBox();
  assert(r&&s&&Math.abs(r.x+r.width/2-s.x-s.width/2)<=2&&Math.abs(r.y+r.height/2-s.y-s.height/2)<=2,label+' icon off center');
 };
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5174/');
 await page.locator('.item').first().waitFor();
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  await noOverflow('storefront '+width);
  await centered(page.locator('.item .qty button').first(),'add '+width);
 }
 await page.setViewportSize({width:390,height:900});
 await page.getByRole('combobox',{name:'Ngôn ngữ',exact:true}).click();
 await page.getByRole('option',{name:'Deutsch',exact:true}).click();
 await page.getByRole('combobox',{name:'Sprache',exact:true}).click();
 await page.getByRole('option',{name:'Tiếng Việt',exact:true}).click();
 await page.locator('.item .qty button').first().click();
 await centered(page.locator('.item .qty button').first(),'quantity decrease');
 await centered(page.locator('.item .qty button').nth(1),'quantity increase');
 await page.getByRole('button',{name:'Thanh toán',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 await centered(page.locator('.checkout-dialog [data-slot=dialog-close]'),'checkout close');
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  const r=await page.getByRole('dialog').boundingBox();
  assert(r&&r.x>=-1&&r.x+r.width<=width+1,'checkout bounds '+width);
 }
 await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:5174/admin');
 await page.getByRole('navigation',{name:'Quản trị'}).waitFor();
 const views=[/^Tổng quan/,/^(Đơn hàng|Đơn đặt món)/,/^(Thực đơn|Quản lý thực đơn)/,/^(Cài đặt|Cài đặt nhà hàng)/];
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  for(let index=0;index<views.length;index++){
   await page.getByRole('navigation',{name:'Quản trị'}).getByRole('button',{name:views[index]}).click();
   await noOverflow('admin '+index+' '+width);
   if(index===1){
    const tabs=page.getByRole('tablist',{name:'Trạng thái đơn'});
    if(width<=900)assert(await tabs.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'order tabs overflow');
    if(width<=900){
     await page.locator('.ad-order-list .ad-order').first().click();
     await page.getByRole('dialog').waitFor();
     await centered(page.locator('.ad-order-dialog [data-slot=dialog-close]'),'order close');
     const d=await page.getByRole('dialog').boundingBox();
     assert(d&&d.x>=-1&&d.x+d.width<=width+1,'order bounds');
     await page.keyboard.press('Escape');
    }
   }
   if(index===2){
    const sw=page.getByRole('switch').first();await sw.waitFor();
    const r=await sw.boundingBox(),t=await sw.locator('[data-slot=switch-thumb]').boundingBox();
    assert(r&&t&&t.x>=r.x&&t.x+t.width<=r.x+r.width+1,'switch containment');
    await centered(page.locator('.ad-edit-button').first(),'edit '+width);
   }
   if(index===3)await page.getByRole('button',{name:'Đăng xuất',exact:true}).waitFor();
  }
 }
 await page.setViewportSize({width:390,height:900});
 await page.getByRole('navigation',{name:'Quản trị'}).getByRole('button',{name:/^(Thực đơn|Quản lý thực đơn)/}).click();
 await page.getByRole('switch').first().waitFor();
 await page.getByRole('button',{name:'Sửa Nem cua bể giòn rụm (2 cuốn)',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 await centered(page.locator('.ad-editor [data-slot=dialog-close]'),'editor close');
 await page.screenshot({path:'design/ui-audit-editor-14.png',animations:'disabled'});
 await page.keyboard.press('Escape');
 page.off('pageerror',onError);assert(!browserErrors.length,JSON.stringify(browserErrors));
}
