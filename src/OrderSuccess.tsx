import {Button} from '@/components/ui/button';
import {CheckCircle2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import type {OrderReceipt} from './lib/order-receipt';
export function OrderSuccess({receipt,address,onClose}:{receipt:OrderReceipt;address:string;onClose:()=>void}){
 const {t}=useTranslation();
 return <section className="order-success" aria-labelledby="order-success-title"><CheckCircle2 aria-hidden="true" size={48}/><h2 id="order-success-title" role="status">{t('orderSuccess')}</h2><dl><div><dt>{t('orderNumber')}</dt><dd>{receipt.id.slice(0,8)}</dd></div></dl>{receipt.customer&&<div className="success-customer"><b>{receipt.customer.name}</b><span>{receipt.customer.phone}</span>{receipt.customer.note&&<p>{t('note')}: {receipt.customer.note}</p>}</div>}{receipt.items&&<ul className="success-items" aria-label={t('orderedItems')}>{receipt.items.map(item=><li key={item.id}><span>{item.quantity}×</span><span>{item.name}</span></li>)}</ul>}<dl><div><dt>{t('total')}</dt><dd>{receipt.total.toLocaleString('de-DE',{style:'currency',currency:'EUR'})}</dd></div></dl><p>{t('pickupAt')}<br/><strong>{address}</strong></p><Button autoFocus className="checkout" onClick={onClose}>{t('close')}</Button></section>
}
