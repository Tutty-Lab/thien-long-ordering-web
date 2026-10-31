import {Toaster as Sonner,type ToasterProps} from 'sonner';

export function Toaster(props:ToasterProps){
 return <Sonner position="top-center" closeButton toastOptions={{style:{background:'#fff',color:'#171717',border:'1px solid #e8e8e8',fontFamily:'Be Vietnam Pro, sans-serif',boxShadow:'0 4px 20px rgb(0 0 0 / 8%)'}}} {...props}/>;
}
