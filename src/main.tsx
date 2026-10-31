import {translateMenuText} from './lib/menu-translations';
import {QuantityControl} from './QuantityControl';
import {Select,SelectContent,SelectItem,SelectTrigger} from '@/components/ui/select';
import {Dialog,DialogContent,DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import './admin-theme.css';
import {parseOrderReceipt,type OrderReceipt} from './lib/order-receipt';
import {OrderSuccess} from './OrderSuccess';
import {parsePublicMenu} from './lib/menu';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, MapPin, UtensilsCrossed, X, Soup, Flame, Coffee, CakeSlice, Tag, Languages, Salad } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './styles.css';
const AdminPortal=lazy(()=>import('./AdminPortal').then(module=>({default:module.AdminPortal})));
type Item={id:string;name:string;category:string;price:number;image:string;description:string};
const defaultCategories=['Ưu đãi','Khai vị','Món chính','Mì & cơm','Đồ uống','Tráng miệng'];
const icons=[Tag,Salad,Soup,Flame,Coffee,CakeSlice];
function CheckoutDialog({children,onClose,open}:{children:ReactNode;onClose:()=>void;open:boolean}){
 const {t}=useTranslation();
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose()}}><DialogContent className="checkout-dialog" aria-describedby={undefined}><DialogTitle className="sr-only">{t('confirm')}</DialogTitle>{children}</DialogContent></Dialog>
}
const money=(v:number)=>v.toLocaleString('de-DE',{style:'currency',currency:'EUR'});

const offers:Record<string,number>={};
const price=(x:Item)=>offers[x.id]??x.price;
function LanguagePicker(){
 const {i18n,t}=useTranslation();
 const language=i18n.resolvedLanguage??'vi';
 return <div className="language-picker"><Select value={language} onValueChange={code=>{void i18n.changeLanguage(code);document.documentElement.lang=code}}><SelectTrigger className="language-trigger" aria-label={t('language')}><Languages aria-hidden="true" size={17}/><span>{language.toUpperCase()}</span></SelectTrigger><SelectContent position="popper" align="end" className="language-menu">{[['vi','Tiếng Việt'],['de','Deutsch'],['en','English']].map(([code,label])=><SelectItem key={code} value={code}>{label}</SelectItem>)}</SelectContent></Select></div>
}
function MobileCartBar({count,total,onCheckout}:{count:number;total:number;onCheckout:()=>void}){
 const {t}=useTranslation();
 return <footer className="bottom mobile-cart"><div className="mobile-cart-info"><span>{t('cart')} · {count} {t('items')}</span><strong>{money(total)}</strong></div><Button className="mobile-pay" disabled={!count} onClick={onCheckout}>{t('payment')}</Button></footer>
}
function Storefront(){
 const [restaurant,setRestaurant]=useState({name:'Thiên Long',address:'Olgastraße 5, 89518 Heidenheim'});
 useEffect(()=>{fetch('/api/index?action=restaurant').then(r=>{if(!r.ok)throw Error();return r.json()}).then(setRestaurant).catch(()=>{})},[]);
 const [liveItems,setLiveItems]=useState<Item[]>([]),[menuError,setMenuError]=useState(''),[ready,setReady]=useState(false),[sending,setSending]=useState(false),[message,setMessage]=useState('');
 const menuCategories=useMemo(()=>['Ưu đãi',...new Set(liveItems.map(x=>x.category))],[liveItems]);
 const categories=menuCategories;
 const [receipt,setReceipt]=useState<OrderReceipt|null>(null);
 const [customer,setCustomer]=useState({name:'',phone:'',address:'',note:''});
 const requestKey=useRef(crypto.randomUUID());
 useEffect(()=>{fetch('/api/index?action=menu').then(r=>{if(!r.ok)throw Error();return r.json()}).then(raw=>{const data=parsePublicMenu(raw);setLiveItems(data);Object.keys(offers).forEach(k=>delete offers[k]);data.forEach((x:Item&{sale:number|null})=>{if(x.sale!==null)offers[x.id]=x.sale});setReady(true)}).catch(()=>{setReady(false);setMenuError('menuError')})},[]);
 const submit=async()=>{if(sending||receipt)return;setSending(true);setMessage('');try{const response=await fetch('/api/index?action=orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...customer,key:requestKey.current,items:Object.entries(cart).filter(([,q])=>q>0).map(([id,quantity])=>({id,quantity}))})});const data=await response.json();if(!response.ok)throw Error(data.error);setReceipt({...parseOrderReceipt(data),items:liveItems.filter(x=>cart[x.id]>0).map(x=>({id:x.id,name:x.name,quantity:cart[x.id]})),customer:{...customer}});setCart({});requestKey.current=crypto.randomUUID()}catch{setMessage('sendError')}finally{setSending(false)}};

 const {t,i18n}=useTranslation();
 const menuText=(value:string)=>translateMenuText(value,i18n.resolvedLanguage||'vi');
 const reduced=useReducedMotion();
 const [cat,setCat]=useState('Ưu đãi'),[query,setQuery]=useState(''),[cart,setCart]=useState<Record<string,number>>({}),[open,setOpen]=useState(false);
 const sections=useMemo(()=>categories.map((name,index)=>({name,index,foods:liveItems.filter(x=>(name==='Ưu đãi'?offers[x.id]!==undefined:x.category===name)&&(x.name+' '+menuText(x.name)).toLocaleLowerCase().includes(query.toLocaleLowerCase()))})),[query,liveItems,categories,i18n.resolvedLanguage]);
 useEffect(()=>{const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-category]'));const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])setCat((visible[0].target as HTMLElement).dataset.category!)},{rootMargin:'-140px 0px -55% 0px',threshold:0});nodes.forEach(n=>observer.observe(n));return()=>observer.disconnect()},[sections]);
 const jump=(name:string)=>{setCat(name);document.getElementById('category-'+categories.indexOf(name))?.animate(reduced?[]:[{opacity:.45,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'ease-out'});document.getElementById('category-'+categories.indexOf(name))?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})};
 const count=Object.values(cart).reduce((a,b)=>a+b,0),total=liveItems.reduce((sum,x)=>sum+price(x)*(cart[x.id]??0),0);
 const qty=(id:string,d:number)=>setCart(c=>({...c,[id]:Math.max(0,(c[id]??0)+d)}));
 useEffect(()=>{const nav=document.querySelector<HTMLElement>('.mobile-navigation .categories');const selected=nav?.querySelector<HTMLElement>('[aria-current=true]');if(nav&&selected){const item=selected.getBoundingClientRect(),container=nav.getBoundingClientRect();nav.scrollTo({left:nav.scrollLeft+item.left-container.left-(container.width-item.width)/2,behavior:reduced?'instant':'smooth'})}},[cat,reduced]);
 const navigation=(mobile=false)=><nav className={mobile?'categories':'category-links'} aria-label={t('categories')}>{categories.map((c,index)=>{const Icon=icons[defaultCategories.indexOf(c)]??UtensilsCrossed;return <Button key={c} aria-current={cat===c?'true':undefined} className={cat===c?'active':''} onClick={()=>jump(c)}><>{!mobile&&<Icon size={17}/>}<span>{defaultCategories.includes(c)?t('category'+defaultCategories.indexOf(c)):c}</span>{mobile&&cat===c&&<motion.span className="category-indicator" layoutId="mobile-category-indicator" transition={reduced?{duration:0}:{type:"spring",stiffness:400,damping:35}}/>}</></Button>})}</nav>;
 const lines=liveItems.filter(x=>cart[x.id]>0);
 const summary=<>{lines.map(x=><div className="cart-item" key={x.id}><div><b>{menuText(x.name)}</b><span>{money(price(x)*cart[x.id])}</span></div><div className="line-actions"><QuantityControl quantity={cart[x.id]} name={menuText(x.name)} onChange={delta=>qty(x.id,delta)}/><Button variant="ghost" size="icon-sm" className="remove-line" aria-label={t('remove')+' '+menuText(x.name)} onClick={()=>setCart(c=>({...c,[x.id]:0}))}><X size={15}/></Button></div></div>)}</>;
 return <div className="storefront"><header className="topbar"><div className="identity"><b>{restaurant.name}</b><span><MapPin size={14}/> {restaurant.address}</span></div><div className="header-search"><Search size={18} aria-hidden="true"/><Input type="search" aria-label={t('search')} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('search')}/></div><LanguagePicker/></header>

 {menuError&&<p role="alert" className="menu-load-status">{t(menuError)}</p>}{!menuError&&!ready&&<p role="status" className="menu-load-status">{t('menuLoading')}</p>}{ready&&!liveItems.length&&<p role="status" className="menu-load-status">{t('menuUnavailable')}</p>}<div className="ordering-layout"><aside className="category-sidebar"><h2>{t('categories')}</h2>{navigation()}</aside><main className="catalog"><section className="hero"><div><h1>{t('hero')}</h1><p>{t('heroSubtitle')}</p></div></section><div className="mobile-navigation">{navigation(true)}</div>
 {sections.every(s=>s.foods.length===0)&&<p className="empty">{t('empty')}</p>}
 {sections.filter(s=>s.foods.length).map(section=><section className="menu-section" id={'category-'+section.index} data-category={section.name} key={section.name}><div className="section-head"><h2>{defaultCategories.includes(section.name)?t('category'+defaultCategories.indexOf(section.name)):section.name}</h2><span>{section.foods.length}</span></div>{section.index===0&&<p className="offer-caption">{t('offerDemo')}</p>}<div className="grid">{section.foods.map(item=><motion.article layout initial={false} animate={{opacity:1}} whileTap={reduced?undefined:{scale:.99}} transition={{duration:reduced?0:.2}} className={'item '+(section.index===0?'offer-item':'')} key={item.id}><div className="photo"><img src={item.image} alt="" loading="lazy"/>{section.index===0&&<span className="discount">−{Math.round((1-price(item)/item.price)*100)}%</span>}{cart[item.id]>0&&<span className="badge">{cart[item.id]}</span>}</div><div className="item-body"><h3>{menuText(item.name)}</h3><p>{menuText(item.description)}</p><div className="row"><strong>{money(price(item))} {offers[item.id]&&<del>{money(item.price)}</del>}</strong><QuantityControl quantity={cart[item.id]??0} name={menuText(item.name)} onChange={delta=>qty(item.id,delta)}/></div></div></motion.article>)}</div></section>)}
 </main><aside className="cart-sidebar"><h2><ShoppingBag size={20}/>{t('cart')}</h2>{!count&&<p className="cart-empty">{t('emptyCart')}</p>}{summary}<div className="total"><b>{t('total')}</b><strong>{money(total)}</strong></div><Button className="checkout" disabled={!count} onClick={()=>{setReceipt(null);setMessage('');setOpen(true)}}>{t('checkout')}</Button></aside></div><MobileCartBar count={count} total={total} onCheckout={()=>{setReceipt(null);setMessage('');setOpen(true)}}/>
 {<CheckoutDialog open={open} onClose={()=>setOpen(false)}>{receipt?<OrderSuccess receipt={receipt} address={restaurant.address} onClose={()=>setOpen(false)}/>:<><div className="modal-heading"><h2><span className="desktop-checkout-title">{t('checkoutTitle')}</span><span className="mobile-checkout-title">{t('payment')}</span></h2></div><div className="checkout-body"><section className="recipient"><h3>{t('recipient')}</h3><div className="contact-grid"><Label>{t('name')} *<Input required autoComplete="name" value={customer.name} onChange={e=>setCustomer(c=>({...c,name:e.target.value}))}/></Label><Label>{t('phone')} *<Input required type="tel" autoComplete="tel" value={customer.phone} onChange={e=>setCustomer(c=>({...c,phone:e.target.value}))}/></Label></div><Label>{t('address')}<Input required autoComplete="street-address" value={customer.address} onChange={e=>setCustomer(c=>({...c,address:e.target.value}))}/></Label><Label>{t('note')}<Input value={customer.note} onChange={e=>setCustomer(c=>({...c,note:e.target.value}))}/></Label></section><section><div className="modal-section-title"><b>{t('orderLines',{count})}</b><Button type="button" disabled={sending} onClick={()=>setOpen(false)}>{t('change')}</Button></div><div className="bill-lines">{lines.map(x=><div className="bill-line" key={x.id}><span className="bill-quantity">{cart[x.id]}×</span><span className="bill-name">{menuText(x.name)}</span><span className="bill-price">{money(price(x)*cart[x.id])}</span></div>)}</div></section><div className="price-breakdown"><div><span>{t('subtotal')}</span><b>{money(liveItems.reduce((sum,x)=>sum+x.price*(cart[x.id]??0),0))}</b></div><div className="discount-row"><span>{t('discount')}</span><b>{money(total-liveItems.reduce((sum,x)=>sum+x.price*(cart[x.id]??0),0))}</b></div><div className="total"><span>{t('paymentTotal')}</span><strong>{money(total)}</strong></div></div></div><div className="checkout-footer"><p role="status">{message?t(message):''}</p><Button className="checkout" onClick={submit} disabled={!ready||sending||!count||customer.name.trim().length<2||customer.phone.trim().length<7||customer.address.trim().length<3}>{sending?t('sending'):t('confirm')}</Button></div></>}</CheckoutDialog>}
 </div>
}
createRoot(document.getElementById('root')!).render(location.pathname.startsWith('/admin')?<Suspense fallback={<p role="status">Đang tải quản trị…</p>}><AdminPortal/></Suspense>:<Storefront/>);