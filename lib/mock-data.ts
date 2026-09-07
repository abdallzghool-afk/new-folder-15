export const restaurants = [
 { id:'um-ali', name:'أم علي للشاورما', cuisine:'شاورما • وجبات سريعة', rating:'4.8', time:'20-30 دقيقة', fee:'0.75', badge:'الأكثر طلباً', image:'/unigo-restaurant.png' },
 { id:'burger', name:'ورشة البرغر', cuisine:'برغر • بطاطا', rating:'4.7', time:'25-35 دقيقة', fee:'0.50', badge:'توصيل مجاني', image:'/unigo-restaurant.png' },
 { id:'falestini', name:'البيت الفلسطيني', cuisine:'أكل بيتي • مشاوي', rating:'4.9', time:'30-40 دقيقة', fee:'1.00', badge:'خصم الطلاب', image:'/unigo-restaurant.png' },
 { id:'pizza', name:'البيتزا الإيطالية', cuisine:'بيتزا • باستا', rating:'4.6', time:'25-35 دقيقة', fee:'0.75', badge:'جديد', image:'/unigo-restaurant.png' },
]
export const menu = [
 { name:'وجبة شاورما عربي', desc:'شاورما دجاج، بطاطا، مخلل وثوم', price:'2.75', image:'/unigo-restaurant.png' },
 { name:'برغر يونيفيرسيتي', desc:'لحم مشوي، جبنة، صوص خاص وبطاطا', price:'3.50', image:'/unigo-restaurant.png' },
 { name:'صحن فلافل', desc:'فلافل طازجة، حمص، سلطة وخبز', price:'1.50', image:'/unigo-restaurant.png' },
 { name:'بيتزا خضار صغيرة', desc:'صلصة طماطم، جبنة وخضار موسمية', price:'2.25', image:'/unigo-restaurant.png' },
]
export const orders = [
 { id:'#UG-2048', restaurant:'أم علي للشاورما', date:'اليوم، ١:٢٥ م', total:'8.25', status:'جاري التوصيل' },
 { id:'#UG-1983', restaurant:'ورشة البرغر', date:'١٢ مايو ٢٠٢٦', total:'6.50', status:'تم التوصيل' },
 { id:'#UG-1820', restaurant:'البيت الفلسطيني', date:'٣ مايو ٢٠٢٦', total:'11.75', status:'تم التوصيل' },
]
export const formatPrice = (price: string | number) => `${price} د.أ`
