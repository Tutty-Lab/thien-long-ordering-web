export type Order = {id:string;customer_name:string;phone:string;address:string;note:string;status:string;total_cents:number;created_at:string;items:{name:string;quantity:number;unitCents:number}[]};
export const statusLabels:Record<string,string>={NEW:'Chờ xác nhận',PREPARING:'Đang chuẩn bị',READY:'Sẵn sàng lấy',DONE:'Đã lấy',CANCELLED:'Đã hủy'};
export const money=(cents:number)=>(cents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
export const previewOrders:Order[]=[
 {id:'demo-9082',customer_name:'Khách minh họa 01',phone:'—',address:'Dữ liệu minh họa',note:'Không hành, để nước dùng riêng.',status:'NEW',total_cents:3150,created_at:new Date().toISOString(),items:[{name:'Phở bò tái lăn đặc biệt',quantity:2,unitCents:1150},{name:'Nem cua bể giòn rụm (2 cuốn)',quantity:1,unitCents:850}]},
 {id:'demo-9083',customer_name:'Khách minh họa 02',phone:'—',address:'Dữ liệu minh họa',note:'',status:'PREPARING',total_cents:1480,created_at:new Date().toISOString(),items:[{name:'Bún chả nướng than hoa',quantity:1,unitCents:1090},{name:'Trà sen long nhãn',quantity:1,unitCents:390}]},
 {id:'demo-9084',customer_name:'Khách minh họa 03',phone:'—',address:'Dữ liệu minh họa',note:'',status:'READY',total_cents:2380,created_at:new Date().toISOString(),items:[{name:'Cơm gà tay cầm Hội An',quantity:2,unitCents:1190}]},
 {id:'demo-9085',customer_name:'Khách minh họa 04',phone:'—',address:'Dữ liệu minh họa',note:'',status:'DONE',total_cents:1300,created_at:new Date().toISOString(),items:[{name:'Nem cua bể giòn rụm (2 cuốn)',quantity:1,unitCents:850},{name:'Chè khúc bạch hạt chia',quantity:1,unitCents:450}]},
];
