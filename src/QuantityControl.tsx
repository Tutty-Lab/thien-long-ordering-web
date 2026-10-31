import {Button} from '@/components/ui/button';
import {Minus,Plus} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export function QuantityControl({quantity,name,onChange}:{quantity:number;name:string;onChange:(delta:number)=>void}){
 const {t}=useTranslation();
 return <div className={quantity?'qty qty-selected':'qty'} role="group" aria-label={name}>
  {quantity>0&&<><Button type="button" variant="ghost" size="icon-sm" aria-label={t('decrease')+' '+name} onClick={()=>onChange(-1)}><Minus aria-hidden="true"/><span className="sr-only">{t('decrease')}</span></Button><b aria-live="polite" aria-atomic="true">{quantity}</b></>}
  <Button type="button" variant={quantity?'ghost':'default'} size="icon-sm" className={quantity?undefined:'add'} aria-label={t(quantity?'increase':'add')+' '+name} onClick={()=>onChange(1)}><Plus aria-hidden="true"/></Button>
 </div>
}
