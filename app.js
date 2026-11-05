/* تحويشة v2 — مساعدك الشخصي للتوفير (أوفلاين بالكامل) */
(()=>{'use strict';
const KEY='tahweesha_v2', VERSION='3.1.0';
const EXP=[['food','أكل وشرب','🍔','#f97316'],['trans','مواصلات','🚌','#3b82f6'],['bills','فواتير','💡','#eab308'],['shop','تسوق','🛍️','#ec4899'],['fun','خروج وترفيه','🎉','#8b5cf6'],['health','صحة','💊','#10b981'],['edu','تعليم','📚','#0ea5e9'],['net','موبايل ونت','📱','#6366f1'],['gift','هدايا','🎁','#f43f5e'],['home','البيت','🏠','#a16207'],['coffee','قهوة ومشروبات','☕','#92400e'],['other','أخرى','📦','#64748b']];
const INC=[['salary','مرتب','💼','#16a34a'],['free','شغل حر','💻','#0d9488'],['allow','مصروف','🪙','#ca8a04'],['igift','هدية','🎁','#db2777'],['iother','أخرى','➕','#475569']];
const PALETTE=['#f97316','#3b82f6','#eab308','#ec4899','#8b5cf6','#10b981','#0ea5e9','#6366f1','#f43f5e','#84cc16','#14b8a6','#a855f7'];
const MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS=['الأحد','الاتنين','التلات','الأربع','الخميس','الجمعة','السبت'];
// ---------- helpers
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{v=String(v==null?'':v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,]/g,'.').replace(/[^\d.]/g,'');const n=parseFloat(v);return isFinite(n)?n:0;};
const pad=n=>(n<10?'0':'')+n;
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>iso(new Date());
const ym=d=>d.slice(0,7);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const addDays=(s,n)=>{const d=new Date(s+'T12:00');d.setDate(d.getDate()+n);return iso(d);};
const diffDays=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
const daysIn=m=>new Date(+m.slice(0,4),+m.slice(5,7),0).getDate();
const prevYM=(m,k=1)=>{const d=new Date(+m.slice(0,4),+m.slice(5,7)-1-k,1);return d.getFullYear()+'-'+pad(d.getMonth()+1);};
const mName=m=>MONTHS[+m.slice(5,7)-1]+' '+m.slice(0,4);
const dName=s=>{const d=new Date(s+'T12:00');return DAYS[d.getDay()]+' '+d.getDate()+' '+MONTHS[d.getMonth()];};
const hsh=s=>{let h=5381;for(const c of 'tw$'+s)h=((h<<5)+h+c.charCodeAt(0))|0;return String(h>>>0);};
// ---------- storage
let canStore=true,mem=null;
try{localStorage.setItem('__t','1');localStorage.removeItem('__t');}catch(e){canStore=false;}
const DEF=()=>({v:2,tx:[],goals:[],budgets:{},debts:[],recurring:[],wallets:[{id:'cash',name:'كاش',emoji:'💵',start:0}],wish:[],gam:[],c52:{base:10,done:[]},customCats:[],templates:[],wishSaved:0,learn:{},dismissSubs:[],set:{remind:'21:00',notif:false,lastNotif:'',theme:'auto',currency:'ج',saveTarget:20,pin:'',hide:false,swipe:true,haptic:true,gHint:false}});
function normalize(d){const D=DEF();d=(d&&typeof d==='object')?d:{};for(const k in D)if(d[k]==null)d[k]=D[k];d.set=Object.assign(D.set,d.set||{});
  if(!Array.isArray(d.wallets)||!d.wallets.length)d.wallets=D.wallets;d.c52=Object.assign({base:10,done:[]},d.c52||{});
  d.tx=(d.tx||[]).filter(t=>t&&t.date&&t.amount>0).map(t=>Object.assign({wallet:d.wallets[0].id,ts:0,note:''},t));d.v=2;return d;}
function load(){let raw=null;try{raw=canStore?localStorage.getItem(KEY):mem;}catch(e){}let d=null;try{d=raw?JSON.parse(raw):null;}catch(e){}return normalize(d);}
let S=load();
function save(){const s=JSON.stringify(S);try{if(canStore)localStorage.setItem(KEY,s);else mem=s;}catch(e){mem=s;toast('⚠️ مش قادر أحفظ — اعمل نسخة احتياطية');}}
// ---------- domain
const expCats=()=>EXP.concat(S.customCats.filter(c=>c.type==='exp').map(c=>[c.id,c.name,c.emoji,c.color]));
const incCats=()=>INC.concat(S.customCats.filter(c=>c.type==='inc').map(c=>[c.id,c.name,c.emoji,c.color]));
const cat=id=>expCats().concat(incCats()).find(c=>c[0]===id)||['other','أخرى','📦','#64748b'];
const wal=id=>S.wallets.find(w=>w.id===id)||{id:id,name:'محفظة محذوفة',emoji:'👛',start:0};
const fmt=n=>{if(S.set.hide)return '•••• '+(S.set.currency||'ج');n=Math.round((+n||0)*100)/100;return n.toLocaleString('en-US',{maximumFractionDigits:2})+' '+(S.set.currency||'ج');};
const monthTx=m=>S.tx.filter(t=>ym(t.date)===m);
const sum=(a,type)=>a.reduce((s,t)=>s+(t.type===type?t.amount:0),0);
const byCat=a=>{const o={};a.forEach(t=>{if(t.type==='exp')o[t.cat]=(o[t.cat]||0)+t.amount;});return o;};
function walletBal(id){let b=+wal(id).start||0;S.tx.forEach(t=>{if(t.type==='inc'&&t.wallet===id)b+=t.amount;else if(t.type==='exp'&&t.wallet===id)b-=t.amount;else if(t.type==='tr'){if(t.wallet===id)b-=t.amount;if(t.to===id)b+=t.amount;}});return b;}
const totalBal=()=>S.wallets.reduce((a,w)=>a+walletBal(w.id),0);
function nextDue(r,from){const d=new Date(from+'T12:00');
  if(r.freq==='weekly'){d.setDate(d.getDate()+((+r.day-d.getDay()+7)%7));return iso(d);}
  let y=d.getFullYear(),m=d.getMonth(),day=Math.min(+r.day,new Date(y,m+1,0).getDate());
  if(d.getDate()>day){m++;day=Math.min(+r.day,new Date(y,m+1,0).getDate());}return iso(new Date(y,m,day,12));}
function runRecurring(){const t=today();let n=0;S.recurring.forEach(r=>{if(!r.active)return;let g=0;while(r.next&&r.next<=t&&g++<60){S.tx.push({id:uid(),type:r.type,amount:r.amount,cat:r.cat,wallet:r.wallet||S.wallets[0].id,note:(r.name||'')+' 🔁',date:r.next,ts:Date.now()+n});n++;r.next=nextDue(r,addDays(r.next,1));}});
  if(n){save();setTimeout(()=>toast('🔁 اتسجّلت '+n+' عملية متكررة تلقائيًا'),700);}}
const monthlyOf=r=>r.freq==='weekly'?r.amount*52/12:r.amount;
function logStreak(){const s=new Set(S.tx.map(t=>t.date));let d=today(),n=0;if(!s.has(d))d=addDays(d,-1);while(s.has(d)){n++;d=addDays(d,-1);}return n;}
function maxLogStreak(){const ds=[...new Set(S.tx.map(t=>t.date))].sort();let best=0,c=0,prev=null;ds.forEach(d=>{c=(prev&&diffDays(prev,d)===1)?c+1:1;best=Math.max(best,c);prev=d;});return best;}
const firstDate=()=>S.tx.reduce((a,t)=>t.date<a?t.date:a,today());
function noSpendDays(m){const t=today(),f=firstDate(),ex=new Set(S.tx.filter(x=>x.type==='exp').map(x=>x.date));let c=0;for(let i=1;i<=daysIn(m);i++){const ds=m+'-'+pad(i);if(ds>=t)break;if(ds>=f&&!ex.has(ds))c++;}return S.tx.length?c:0;}
function noSpendStreak(){if(!S.tx.length)return 0;const ex=new Set(S.tx.filter(x=>x.type==='exp').map(x=>x.date)),f=firstDate();let d=addDays(today(),-1),n=0;while(d>=f&&!ex.has(d)){n++;d=addDays(d,-1);}return n;}
function safeToday(){const m=ym(today()),tx=monthTx(m),inc=sum(tx,'inc');if(!inc)return null;const t=today(),spentToday=tx.filter(x=>x.type==='exp'&&x.date===t).reduce((a,x)=>a+x.amount,0);
  const upcoming=S.recurring.filter(r=>r.active&&r.type==='exp'&&r.next&&ym(r.next)===m&&r.next>t).reduce((a,r)=>a+r.amount,0);
  const daysLeft=daysIn(m)-new Date().getDate()+1,pool=inc-inc*(+S.set.saveTarget||0)/100-(sum(tx,'exp')-spentToday)-upcoming,per=Math.max(0,pool/daysLeft);return {per:per,left:per-spentToday,spent:spentToday};}
function avgMonthlyExp(){const m=ym(today());let s=0,c=0;for(let k=1;k<=3;k++){const e=sum(monthTx(prevYM(m,k)),'exp');if(e>0){s+=e;c++;}}if(!c){const e=sum(monthTx(m),'exp');return e;}return s/c;}
function weekStats(){const T=today(),A=addDays(T,-6),B=addDays(A,-7);const w=S.tx.filter(x=>x.date>=A&&x.date<=T),p=S.tx.filter(x=>x.date>=B&&x.date<A);return {exp:sum(w,'exp'),inc:sum(w,'inc'),pexp:sum(p,'exp'),bc:byCat(w)};}
const wishWait=w=>w.price>=1000?30:2;
function gamInfo(g){const now=ym(today());let k=(+now.slice(0,4)-+g.start.slice(0,4))*12+(+now.slice(5,7)-+g.start.slice(5,7))+1;const n=+g.members;const turnM=prevYM(g.start,-(+g.myTurn-1));return {k:k,n:n,turnM:turnM,total:g.monthly*n,paid:Math.max(0,Math.min(k,n))*g.monthly,done:k>n,isTurn:k===+g.myTurn,started:k>=1};}
// ---------- tips
function tips(m){const out=[],tx=monthTx(m),inc=sum(tx,'inc'),exp=sum(tx,'exp'),bc=byCat(tx);
  if(!S.tx.length)return [['👋','ابدأ سجّل كل مصروف أول بأول — حتى الصغير. أول أسبوع تسجيل هيكشفلك فلوسك بتروح فين.'],['🎯','حط هدف تحويش واضح (اسم + مبلغ + ميعاد). الهدف الواضح بيخلّي التوفير أسهل.'],['💡','قاعدة شهيرة: 50% احتياجات، 30% رغبات، 20% توفير. ابدأ بأي نسبة تقدر عليها ولو 5%.'],['🔁','سجّل مرتبك وفواتيرك الثابتة كعمليات متكررة من "المزيد ← المتكرر" وهتتسجّل لوحدها كل شهر.']];
  if(inc>0){const r=(inc-exp)/inc;
    if(r<0)out.push(['🚨','مصاريفك ('+fmt(exp)+') أكتر من دخلك ('+fmt(inc)+') بـ '+fmt(exp-inc)+'. وقّف أي مصروف مش ضروري لحد آخر الشهر.']);
    else if(r<.1)out.push(['⚠️','بتوفّر '+Math.round(r*100)+'% بس من دخلك. جرّب "ادفع لنفسك الأول": أول ما القبض ينزل حط 10% على جنب.']);
    else if(r>=.2)out.push(['🏆','ممتاز! بتوفّر '+Math.round(r*100)+'% من دخلك. حوّل الفرق لهدف تحويش علشان ما يتصرفش.']);
    else out.push(['👍','بتوفّر '+Math.round(r*100)+'% من دخلك. لو وصلتها 20% هتوفّر '+fmt(inc*.2)+' في الشهر.']);}
  else if(exp>0)out.push(['💼','سجّل دخلك الشهر ده علشان أحسبلك نسبة التوفير والمبلغ اللي تقدر تصرفه كل يوم.']);
  Object.keys(S.budgets).forEach(c=>{const b=S.budgets[c],s=bc[c]||0;if(!b)return;if(s>b)out.push(['🔴','عدّيت ميزانية '+cat(c)[1]+' بـ '+fmt(s-b)+'.']);else if(s>=.8*b)out.push(['🟠','استهلكت '+Math.round(s/b*100)+'% من ميزانية '+cat(c)[1]+' — فاضل '+fmt(b-s)+'.']);});
  const top=Object.keys(bc).sort((a,b)=>bc[b]-bc[a])[0];
  if(top&&exp>0&&bc[top]/exp>.3){const adv={food:'جرّب تطبخ في البيت أو تجهّز أكلك من بدري.',trans:'شوف بدائل أرخص: اشتراك مواصلات أو مشاركة عربية.',shop:'استخدم "قائمة الأمنيات" واستنّى قبل أي شراية مش ضرورية.',fun:'حط مبلغ ثابت للخروج كل أسبوع، ولما يخلص يخلص.',coffee:'القهوة اليومية برّه بتتجمّع بسرعة — اعملها في البيت أغلب الأيام.',net:'راجع باقتك — ممكن باقة أصغر تكفيك.',bills:'راجع الاشتراكات اللي مش بتستخدمها والغيها.'}[top]||'راجع البند ده وشوف إيه اللي ممكن يتقلّل.';
    out.push([cat(top)[2],cat(top)[1]+' واخد '+Math.round(bc[top]/exp*100)+'% من مصاريفك ('+fmt(bc[top])+'). '+adv]);}
  const pe=sum(monthTx(prevYM(m)),'exp');if(pe>0&&exp>0&&m<ym(today())){const ch=(exp-pe)/pe;out.push([ch>0?'📈':'📉','مصاريفك '+(ch>0?'زادت':'قلّت')+' '+Math.abs(Math.round(ch*100))+'% عن الشهر اللي قبله.']);}
  if(m===ym(today())&&exp>0&&new Date().getDate()>=5){const d=new Date().getDate(),proj=exp/d*daysIn(m);out.push(['🔮','على نفس معدل صرفك ('+fmt(exp/d)+' في اليوم) هتصرف حوالي '+fmt(proj)+' آخر الشهر'+(inc>0?(proj>inc?' — أكتر من دخلك! قلّل دلوقتي.':' وهيفضلك حوالي '+fmt(inc-proj)+'.'):'.')]);}
  const small=tx.filter(t=>t.type==='exp'&&t.amount<=50);if(small.length>=8)out.push(['🪙','عندك '+small.length+' مصروف صغير (50 أو أقل) مجموعهم '+fmt(sum(small,'exp'))+'. الصغير بيتجمّع من غير ما تحس.']);
  const subs=S.recurring.filter(r=>r.active&&r.type==='exp');if(subs.length){const y=subs.reduce((a,r)=>a+monthlyOf(r),0)*12;out.push(['🔁','مصاريفك الثابتة والاشتراكات بتكلفك حوالي '+fmt(y)+' في السنة. راجعها وشوف إيه اللي ممكن يتلغي.']);}
  S.goals.forEach(g=>{if(g.saved>=g.target||!g.deadline)return;const left=diffDays(today(),g.deadline)/30.44;if(left>0)out.push(['🎯','علشان توصل لـ "'+g.name+'" في ميعاده محتاج تحوّش حوالي '+fmt((g.target-g.saved)/Math.max(left,.5))+' في الشهر.']);});
  const od=S.debts.filter(d=>d.kind==='borrowed'&&d.paid<d.amount&&d.due&&d.due<today());if(od.length)out.push(['⏳','عندك '+od.length+' دين ميعاده عدّى. سدّد الأقدم الأول أو اتفق على ميعاد جديد.']);
  const avg=avgMonthlyExp(),tb=totalBal();if(avg>0&&tb<avg*3)out.push(['🛟','صندوق الطوارئ المثالي = مصاريف 3 لـ 6 شهور ('+fmt(avg*3)+' – '+fmt(avg*6)+'). رصيدك دلوقتي '+fmt(tb)+'.']);
  if(!Object.keys(S.budgets).length)out.push(['📊','حدّد ميزانية شهرية لأهم بنودك وهنبّهك قبل ما تعدّيها.']);
  if(!S.goals.length)out.push(['🎯','ضيف هدف تحويش — حتى لو صندوق طوارئ.']);
  return out;}
// ---------- badges
function badgeList(){const months=[...new Set(S.tx.map(t=>ym(t.date)))],cm=ym(today()),bk=Object.keys(S.budgets);
  return [['🌱','أول خطوة','سجّلت أول عملية',S.tx.length>=1],['📝','منتظم','سجّلت 7 أيام ورا بعض',maxLogStreak()>=7],['🔥','مش بتفوّت','سجّلت 30 يوم ورا بعض',maxLogStreak()>=30],['💯','100 عملية','سجّلت 100 عملية',S.tx.length>=100],
  ['🎯','عندك هدف','عملت أول هدف',S.goals.length>=1],['🏆','هدف اتحقق','حققت هدف تحويش',S.goals.some(g=>g.saved>=g.target)],['💪','موفّر محترف','وفّرت 20% من دخل شهر',months.some(m=>{const t=monthTx(m),i=sum(t,'inc');return i>0&&(i-sum(t,'exp'))/i>=.2;})],
  ['🧊','إيد ماسكة','3 أيام من غير صرف في شهر',months.some(m=>noSpendDays(m)>=3)],['📊','ملتزم','شهر كامل جوّه الميزانية',bk.length>0&&months.filter(m=>m<cm).some(m=>{const b=byCat(monthTx(m));return monthTx(m).length>=5&&bk.every(c=>(b[c]||0)<=S.budgets[c]);})],
  ['🤝','خالص','قفلت دين بالكامل',S.debts.some(d=>d.paid>=d.amount)],['🧠','قرار ذكي','شلت حاجة من قائمة الأمنيات',S.wishSaved>0],['📅','نَفَس طويل','10 أسابيع في تحدي الـ 52',S.c52.done.length>=10],
  ['👛','منظّم','عندك أكتر من محفظة',S.wallets.length>=2],['🔁','أوتوماتيك','عملت عملية متكررة',S.recurring.length>=1],['🔄','جمعية','سجّلت جمعية',S.gam.length>=1]];}
// ---------- state / routing
let view='home',cur=new Date();cur.setDate(1);
const ui={txType:'all',txCat:'',txWal:'',txQ:'',txDay:''};
const curYM=()=>cur.getFullYear()+'-'+pad(cur.getMonth()+1);
const VIEWS={home:['💰 تحويشة',vHome,1],tx:['🧾 العمليات',vTx,1],rep:['📈 التقارير',vRep,1],more:['🧰 كل الأدوات',vMore,0],save:['🐷 التحويش',vSave,1],goals:['🐷 التحويش',vSave,1],budget:['📊 الميزانية',vBudget,1],debts:['🤝 الديون والسلف',vDebts,0],wallets:['👛 المحافظ',vWallets,0],recur:['🔁 المتكرر والاشتراكات',vRecur,0],wish:['🛒 قائمة الأمنيات',vWish,0],gam:['🔄 الجمعيات',vGam,0],chal:['🏁 التحديات',vChal,0],badges:['🏅 الإنجازات',vBadges,0],calc:['🧮 الحاسبات',vCalc,0],set:['⚙️ الإعدادات',vSet,0]};
const MAIN=['home','tx','save','rep','more'];
function go(v){view=v;window.scrollTo&&window.scrollTo(0,0);render();}
function render(){const V=VIEWS[view];$('title').textContent=V[0];$('back').classList.toggle('hidden',MAIN.includes(view));$('greet').classList.toggle('hidden',view!=='home');
  $('monBar').classList.toggle('hidden',!V[2]);$('top').classList.toggle('small',!V[2]);$('mLbl').textContent=MONTHS[cur.getMonth()]+' '+cur.getFullYear();
  const tab=MAIN.includes(view)?view:'more';document.querySelectorAll('nav.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
  $('view').innerHTML=V[1]();if(view==='rep')drawRep();}
// ---------- view parts
const empty=(e,t)=>'<div class="empty"><span class="e">'+e+'</span>'+t+'</div>';
const bar=(p,col)=>'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,p))+'%;'+(col?'background:'+col:'')+'"></i></div>';
function txRow(t){let ic,ti,col,sign;if(t.type==='tr'){ic='🔄';ti='تحويل: '+esc(wal(t.wallet).name)+' ← '+esc(wal(t.to).name);col='mut';sign='';}else{const c=cat(t.cat);ic=c[2];ti=esc(c[1]);col=t.type==='inc'?'pos':'neg';sign=t.type==='inc'?'+':'−';}
  const bg=t.type==='tr'?'':' style="background:'+cat(t.cat)[3]+'22"';
  return '<div class="tx" data-id="'+t.id+'"><div class="ic"'+bg+'>'+ic+'</div><div class="m"><div class="t">'+ti+'</div><div class="d">'+dName(t.date)+(S.wallets.length>1&&t.type!=='tr'?' · '+esc(wal(t.wallet).emoji):'')+(t.note?' · '+esc(t.note):'')+'</div></div><div class="a '+col+'">'+sign+fmt(t.amount)+'</div><button class="ibtn" data-a="txEdit" data-id="'+t.id+'" aria-label="تعديل">✏️</button><button class="ibtn" data-a="txDel" data-id="'+t.id+'" aria-label="حذف">🗑</button></div>';}
function calHTML(m){const dim=daysIn(m),first=new Date(+m.slice(0,4),+m.slice(5,7)-1,1).getDay(),off=(first+1)%7,t=today(),f=firstDate();const ex={};S.tx.forEach(x=>{if(x.type==='exp'&&ym(x.date)===m)ex[x.date]=(ex[x.date]||0)+x.amount;});const mx=Math.max(1,...Object.values(ex));
  let h='<div class="cal">'+['س','ح','ن','ث','ر','خ','ج'].map(d=>'<div class="h">'+d+'</div>').join('');for(let i=0;i<off;i++)h+='<div></div>';
  for(let i=1;i<=dim;i++){const ds=m+'-'+pad(i),v=ex[ds]||0,a=v?.18+.72*(v/mx):0,ns=!v&&ds<t&&ds>=f&&S.tx.length;h+='<button data-a="calDay" data-d="'+ds+'" class="'+(ns?'ns ':'')+(ds===t?'td':'')+'" style="'+(v?'background:rgba(225,29,72,'+a.toFixed(2)+');color:'+(a>.5?'#fff':'inherit'):'')+'" aria-label="'+dName(ds)+' '+fmt(v)+'">'+i+'</button>';}
  return h+'</div><p class="note">كل ما اللون أغمق = صرف أكتر. الإطار الأخضر = يوم من غير صرف 🧊. دوس على أي يوم تشوف عملياته.</p>';}
// ---------- views
function vHome(){const m=curYM(),tx=monthTx(m),inc=sum(tx,'inc'),exp=sum(tx,'exp'),bal=inc-exp,now=new Date(),rh=(S.set.remind||'21:00').split(':');let h='';
  if(!S.tx.some(t=>t.date===today())&&(now.getHours()>+rh[0]||(now.getHours()===+rh[0]&&now.getMinutes()>=+rh[1])))h+='<div class="banner rem">⏰ <div>لسه ما سجّلتش مصاريف النهارده</div><button data-a="add">سجّل</button></div>';
  if(now.getDay()===5&&S.tx.length)h+='<div class="banner wk">📅 <div>تقرير الأسبوع جاهز</div><button data-go="rep">شوفه</button></div>';
  S.gam.forEach(g=>{const i=gamInfo(g);if(i.isTurn)h+='<div class="banner ok">🎉 <div>الشهر ده دورك تقبض جمعية "'+esc(g.name)+'" ('+fmt(i.total)+')</div></div>';});
  const od=S.debts.filter(d=>d.paid<d.amount&&d.due&&d.due<today());if(od.length)h+='<div class="banner bad">⏳ <div>'+od.length+' دين/سلفة ميعادها عدّى</div><button data-go="debts">شوف</button></div>';
  const wr=S.wish.filter(w=>diffDays(w.added,today())>=wishWait(w));if(wr.length)h+='<div class="banner wk">🛒 <div>'+wr.length+' حاجة في قائمة الأمنيات خلصت فترة التفكير</div><button data-go="wish">قرّر</button></div>';
  h+='<div class="card"><div class="kpis"><div class="kpi big"><div class="l">المتبقي / التوفير — '+MONTHS[cur.getMonth()]+'</div><div class="v '+(bal>=0?'pos':'neg')+'">'+fmt(bal)+'</div>'+(inc>0?'<div class="l" style="margin-top:4px">نسبة التوفير: <b>'+Math.round(bal/inc*100)+'%</b> · هدفك '+(+S.set.saveTarget||0)+'%</div>':'')+'</div><div class="kpi"><div class="l">⬆️ الدخل</div><div class="v pos">'+fmt(inc)+'</div></div><div class="kpi"><div class="l">⬇️ المصاريف</div><div class="v neg">'+fmt(exp)+'</div></div></div>';
  if(S.wallets.length>1)h+='<div class="wal" style="margin-top:10px">'+S.wallets.map(w=>'<div><span>'+esc(w.emoji)+' '+esc(w.name)+'</span><b class="'+(walletBal(w.id)<0?'neg':'')+'">'+fmt(walletBal(w.id))+'</b></div>').join('')+'</div>';
  h+='</div>';
  const st=safeToday();if(st&&m===ym(today()))h+='<div class="card safe"><div class="l">💸 تقدر تصرف النهارده</div><div class="v '+(st.left<0?'neg':'')+'">'+fmt(Math.max(st.left,0))+'</div><div class="l">'+(st.left<0?'عدّيت حد النهارده بـ '+fmt(-st.left):'من '+fmt(st.per)+' في اليوم · بعد ما شلنا '+(+S.set.saveTarget||0)+'% للتوفير والفواتير الجاية')+'</div></div>';
  h+='<div class="stats"><div class="stat"><b>🔥 '+logStreak()+'</b><span>يوم تسجيل ورا بعض</span></div><div class="stat"><b>🧊 '+noSpendDays(ym(today()))+'</b><span>يوم من غير صرف الشهر ده</span></div><div class="stat"><b>🏅 '+badgeList().filter(b=>b[3]).length+'</b><span>إنجاز</span></div></div>';
  const tp=tips(m);if(tp.length)h+='<div class="card"><h2>💡 نصيحة ليك</h2><div class="tip"><span class="e">'+tp[0][0]+'</span><div>'+esc(tp[0][1])+'</div></div>'+(tp.length>1?'<button class="btn sec sm" data-go="rep">كل النصايح ('+tp.length+')</button>':'')+'</div>';
  const up=S.recurring.filter(r=>r.active&&r.next&&diffDays(today(),r.next)<=7).sort((a,b)=>a.next.localeCompare(b.next));
  if(up.length)h+='<div class="card"><h2>🗓️ جاي قريب <small>خلال 7 أيام</small></h2>'+up.map(r=>'<div class="tx"><div class="ic">'+cat(r.cat)[2]+'</div><div class="m"><div class="t">'+esc(r.name)+'</div><div class="d">'+dName(r.next)+'</div></div><div class="a '+(r.type==='inc'?'pos':'neg')+'">'+fmt(r.amount)+'</div></div>').join('')+'</div>';
  if(S.goals.length)h+='<div class="card"><h2>🎯 أهدافك <button class="btn sec sm" data-go="save">الكل</button></h2>'+S.goals.slice(0,3).map(g=>{const p=g.saved/g.target*100;return '<div class="item"><div class="row"><span class="n">'+esc(g.emoji)+' '+esc(g.name)+'</span><span class="chip">'+Math.round(Math.min(p,100))+'%</span></div><div class="s">'+fmt(g.saved)+' من '+fmt(g.target)+'</div>'+bar(p)+'</div>';}).join('')+'</div>';
  const rec=tx.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.ts-a.ts).slice(0,6);
  h+='<div class="card"><h2>🧾 آخر العمليات '+(rec.length?'<button class="btn sec sm" data-go="tx">الكل</button>':'')+'</h2>'+(rec.length?rec.map(txRow).join(''):empty('✍️','مفيش عمليات الشهر ده — دوس على + وسجّل أول مصروف'))+'</div>';
  return h;}
function vTx(){const m=curYM(),q=ui.txQ.trim();let tx=(ui.txDay?S.tx.filter(t=>t.date===ui.txDay):monthTx(m)).filter(t=>(ui.txType==='all'||t.type===ui.txType)&&(!ui.txCat||t.cat===ui.txCat)&&(!ui.txWal||t.wallet===ui.txWal||t.to===ui.txWal));
  if(q)tx=tx.filter(t=>(t.note+' '+(t.type==='tr'?'تحويل':cat(t.cat)[1])+' '+t.amount).includes(q));
  tx.sort((a,b)=>b.date.localeCompare(a.date)||b.ts-a.ts);
  let h='<div class="card"><input class="inp" id="txQ" placeholder="🔎 دوّر في الملاحظات أو النوع أو المبلغ" value="'+esc(ui.txQ)+'"><div class="filters" style="margin-top:10px">'+[['all','الكل'],['exp','المصاريف'],['inc','الدخل'],['tr','التحويلات']].map(f=>'<button data-a="txType" data-v="'+f[0]+'" aria-pressed="'+(ui.txType===f[0])+'">'+f[1]+'</button>').join('')+'</div>';
  h+='<div class="grid2"><select class="inp" id="txCat" aria-label="النوع"><option value="">كل الأنواع</option>'+expCats().concat(incCats()).map(c=>'<option value="'+c[0]+'"'+(ui.txCat===c[0]?' selected':'')+'>'+c[2]+' '+esc(c[1])+'</option>').join('')+'</select><select class="inp" id="txWal" aria-label="المحفظة"><option value="">كل المحافظ</option>'+S.wallets.map(w=>'<option value="'+w.id+'"'+(ui.txWal===w.id?' selected':'')+'>'+esc(w.emoji+' '+w.name)+'</option>').join('')+'</select></div>';
  if(ui.txDay)h+='<div class="banner wk" style="margin:10px 0 0">📅 <div>عمليات '+dName(ui.txDay)+'</div><button data-a="clearDay">إلغاء</button></div>';
  h+='<div class="row" style="margin-top:12px;font-size:13px"><span class="mut">'+tx.length+' عملية</span><span><span class="pos">+'+fmt(sum(tx,'inc'))+'</span> · <span class="neg">−'+fmt(sum(tx,'exp'))+'</span></span></div></div><div class="card">';
  if(!tx.length)h+=empty('🗂️','مفيش عمليات مطابقة');let last='';
  tx.forEach(t=>{if(t.date!==last){last=t.date;const de=tx.filter(x=>x.date===t.date&&x.type==='exp').reduce((a,x)=>a+x.amount,0);h+='<div class="dayh"><span>'+dName(t.date)+'</span><span>'+(de?'−'+fmt(de):'')+'</span></div>';}h+=txRow(t);});
  return h+'</div><div class="btns"><button class="btn sec sm" data-a="csv">⬇️ تصدير Excel (CSV)</button></div>';}
function vRep(){const m=curYM(),tx=monthTx(m),exp=sum(tx,'exp'),bc=byCat(tx),w=weekStats(),wc=w.pexp>0?Math.round((w.exp-w.pexp)/w.pexp*100):null,wt=Object.keys(w.bc).sort((a,b)=>w.bc[b]-w.bc[a])[0];let h='';
  h+='<div class="card"><h2>📅 آخر 7 أيام</h2><div class="wk-grid"><div><div class="l">صرفت</div><div class="v neg">'+fmt(w.exp)+'</div></div><div><div class="l">دخل</div><div class="v pos">'+fmt(w.inc)+'</div></div><div><div class="l">عن الأسبوع اللي فات</div><div class="v '+(wc>0?'neg':'pos')+'">'+(wc===null?'—':(wc>0?'+':'')+wc+'%')+'</div></div></div>'+(wt?'<p class="note" style="margin:10px 0 0">أكتر بند: '+cat(wt)[2]+' '+esc(cat(wt)[1])+' ('+fmt(w.bc[wt])+') · متوسط يومي '+fmt(w.exp/7)+'</p>':'')+'</div>';
  h+='<div class="card"><h2>🍩 المصاريف حسب النوع <small>'+mName(m)+'</small></h2>'+(exp?'<canvas id="cDonut" height="220"></canvas><div class="legend" id="lg"></div>':empty('📭','مفيش مصاريف الشهر ده'))+'</div>';
  const pb=byCat(monthTx(prevYM(m))),ks=[...new Set(Object.keys(bc).concat(Object.keys(pb)))].sort((a,b)=>(bc[b]||0)-(bc[a]||0));
  if(ks.length)h+='<div class="card"><h2>⚖️ مقارنة بالشهر اللي فات</h2>'+ks.map(k=>{const a=bc[k]||0,b=pb[k]||0,d=a-b;return '<div class="tx"><div class="ic">'+cat(k)[2]+'</div><div class="m"><div class="t">'+esc(cat(k)[1])+'</div><div class="d">الشهر اللي فات: '+fmt(b)+'</div></div><div class="a">'+fmt(a)+'<div style="font-size:12px" class="'+(d>0?'neg':'pos')+'">'+(d>0?'▲ ':d<0?'▼ ':'')+(d?fmt(Math.abs(d)):'—')+'</div></div></div>';}).join('')+'</div>';
  h+='<div class="card"><h2>🗓️ خريطة الصرف</h2>'+calHTML(m)+'</div>';
  h+='<div class="card"><h2>📆 صرفك اليومي</h2><canvas id="cDaily" height="160"></canvas></div>';
  h+='<div class="card"><h2>📊 آخر 6 شهور <small><span class="pos">■</span> دخل <span class="neg">■</span> مصاريف</small></h2><canvas id="cMon" height="190"></canvas></div>';
  const top5=tx.filter(t=>t.type==='exp').sort((a,b)=>b.amount-a.amount).slice(0,5);if(top5.length)h+='<div class="card"><h2>💸 أكبر 5 مصاريف</h2>'+top5.map(txRow).join('')+'</div>';
  h+='<div class="card"><h2>💡 نصايح ذكية ليك</h2>'+tips(m).map(t=>'<div class="tip"><span class="e">'+t[0]+'</span><div>'+esc(t[1])+'</div></div>').join('')+'</div>';
  return h;}
function drawRep(){const m=curYM(),tx=monthTx(m),exp=sum(tx,'exp'),bc=byCat(tx),C=window.Charts;
  if(exp&&$('cDonut')){const ks=Object.keys(bc).sort((a,b)=>bc[b]-bc[a]);C.donut($('cDonut'),ks.map(k=>[bc[k],cat(k)[3]]),fmt(exp),'إجمالي المصاريف');$('lg').innerHTML=ks.map(k=>'<div><i style="background:'+cat(k)[3]+'"></i>'+cat(k)[2]+' '+esc(cat(k)[1])+'<b>'+Math.round(bc[k]/exp*100)+'%</b></div>').join('');}
  const dv=[];for(let i=1;i<=daysIn(m);i++){const ds=m+'-'+pad(i);dv.push(tx.reduce((a,t)=>a+(t.type==='exp'&&t.date===ds?t.amount:0),0));}
  C.bars($('cDaily'),dv.map(v=>[[v,'#14b8a6']]),i=>(i+1)%5===0||i===0?String(i+1):'');
  const ms=[];for(let k=5;k>=0;k--)ms.push(prevYM(m,k));C.bars($('cMon'),ms.map(x=>{const t=monthTx(x);return [[sum(t,'inc'),'#16a34a'],[sum(t,'exp'),'#e11d48']];}),i=>MONTHS[+ms[i].slice(5,7)-1]);drawWd();}
function vMore(){const T=[['budget','📊','الميزانية',Object.keys(S.budgets).length+' بند'],['wallets','👛','المحافظ',S.wallets.length+' محفظة'],['debts','🤝','الديون والسلف',S.debts.filter(d=>d.paid<d.amount).length+' مفتوح'],['recur','🔁','المتكرر والاشتراكات',S.recurring.length+' عملية'],['wish','🛒','قائمة الأمنيات',S.wish.length+' حاجة'],['gam','🔄','الجمعيات',S.gam.length+' جمعية'],['chal','🏁','التحديات','52 أسبوع وأكتر'],['badges','🏅','الإنجازات',badgeList().filter(b=>b[3]).length+'/'+badgeList().length],['calc','🧮','الحاسبات','7 حاسبات'],['set','⚙️','الإعدادات','وضع ليلي، قفل…']];
  return '<div class="tools">'+T.map(t=>'<button data-go="'+t[0]+'"><span>'+t[1]+'</span>'+t[2]+'<small>'+t[3]+'</small></button>').join('')+'</div><p class="note" style="text-align:center;margin-top:16px">تحويشة v'+VERSION+' · بيشتغل أوفلاين · بياناتك على جهازك بس</p>';}
function vSave(){const m=curYM(),tx=monthTx(m),inc=sum(tx,'inc'),exp=sum(tx,'exp'),net=inc-exp,tot=S.goals.reduce((a,g)=>a+g.saved,0),open=S.goals.filter(g=>g.saved<g.target),done=S.goals.length-open.length,rate=inc>0?Math.round(net/inc*100):0,tgt=+S.set.saveTarget||0;
  let h='<div class="card"><div class="kpis"><div class="kpi big"><div class="l">🐷 إجمالي اللي حوّشته في الأهداف</div><div class="v pos">'+fmt(tot)+'</div></div><div class="kpi"><div class="l">🎯 أهداف</div><div class="v">'+S.goals.length+'</div></div><div class="kpi"><div class="l">✅ اتحققت</div><div class="v">'+done+'</div></div></div>';
  h+='<button class="btn" data-a="saveNow" style="margin-top:12px">💰 حوّش دلوقتي</button></div>';
  let near=open.slice().sort((a,b)=>b.saved/b.target-a.saved/a.target)[0];
  if(near&&open.length>1)h+='<div class="card"><h2>🔥 أقرب هدف ليك</h2><div class="item" style="border:0;padding-bottom:0"><div class="row"><span class="n">'+esc(near.emoji)+' '+esc(near.name)+'</span><span class="chip">'+Math.round(near.saved/near.target*100)+'%</span></div><div class="s">فاضل '+fmt(near.target-near.saved)+' من '+fmt(near.target)+'</div>'+bar(near.saved/near.target*100)+'</div></div>';
  if(inc>0||exp>0){const ok=tgt&&rate>=tgt;h+='<div class="card"><h2>📅 التوفير في '+MONTHS[cur.getMonth()]+'</h2><div class="row"><b class="'+(net>=0?'pos':'neg')+'">'+(net>=0?'+':'−')+fmt(Math.abs(net))+'</b><span class="mut">'+rate+'% من الدخل'+(tgt?' · هدفك '+tgt+'%':'')+'</span></div>'+(tgt?bar(Math.max(0,rate)/tgt*100,ok?'var(--grn)':''):'')+'<p class="note">'+(net<=0?'الشهر ده مفيش فرق بين الدخل والمصروف. أي مبلغ تفصله للتحويش أول الشهر بيفرق.':ok?'ممتاز، عدّيت هدف التوفير 🎉 حوّل الفرق لهدف من اللي فوق.':'حوّل الفرق لهدف علشان ما يتصرفش.')+'</p></div>';}
  return h+vGoals();}
function vGoals(){let h='<div class="card">';if(!S.goals.length)h+=empty('🏁','لسه مفيش أهداف. ابدأ بهدف صغير تقدر توصله!');
  S.goals.forEach(g=>{const p=g.saved/g.target*100,done=g.saved>=g.target;let ch='';if(done)ch='<span class="chip">🎉 اتحقق!</span>';else if(g.deadline){const dl=diffDays(today(),g.deadline);ch=dl>=0?'<span class="chip w">فاضل '+dl+' يوم</span>':'<span class="chip r">الميعاد عدّى</span>';}
    let need='';if(!done&&g.deadline){const mo=diffDays(today(),g.deadline)/30.44;if(mo>0)need=' · محتاج '+fmt((g.target-g.saved)/Math.max(mo,.5))+'/شهر';}
    h+='<div class="item"><div class="row"><span class="n">'+esc(g.emoji)+' '+esc(g.name)+'</span>'+ch+'</div><div class="s">'+fmt(g.saved)+' من '+fmt(g.target)+' · '+Math.round(Math.min(p,100))+'%'+(done?'':' · فاضل '+fmt(g.target-g.saved))+need+'</div>'+bar(p,done?'var(--grn)':'')+'<div class="btns"><button class="btn sm" data-a="goalMoney" data-id="'+g.id+'" data-s="1">+ حوّش</button><button class="btn sec sm" data-a="goalMoney" data-id="'+g.id+'" data-s="-1">− سحب</button><button class="btn sec sm" data-a="goalEdit" data-id="'+g.id+'">✏️</button><button class="btn dng sm" data-a="goalDel" data-id="'+g.id+'">🗑</button></div></div>';});
  return h+'<button class="btn" data-a="goalNew" style="margin-top:12px">+ هدف جديد</button></div>';}
function vBudget(){const m=curYM(),bc=byCat(monthTx(m));let tb=0,ts=0,rows='';
  expCats().forEach(c=>{const b=S.budgets[c[0]]||0,s=bc[c[0]]||0;if(b){tb+=b;ts+=s;}const col=!b?'var(--line)':s>b?'var(--red)':s>=.8*b?'var(--amb)':'';
    rows+='<div class="item"><div class="row"><span class="n">'+c[2]+' '+esc(c[1])+'</span><input class="inp" style="width:120px;padding:8px;text-align:center;direction:ltr" inputmode="decimal" placeholder="بدون حد" aria-label="ميزانية '+esc(c[1])+'" data-bud="'+c[0]+'" value="'+(b||'')+'"></div><div class="s">صرفت '+fmt(s)+(b?' · '+(s>b?'<b class="neg">عدّيت بـ '+fmt(s-b)+'</b>':'فاضل '+fmt(b-s)):'')+'</div>'+bar(b?s/b*100:0,col)+'</div>';});
  return '<div class="card"><div class="kpis"><div class="kpi"><div class="l">إجمالي الميزانية</div><div class="v">'+fmt(tb)+'</div></div><div class="kpi"><div class="l">صرفت منها</div><div class="v '+(ts>tb?'neg':'')+'">'+fmt(ts)+'</div></div></div>'+(tb?'<div style="margin-top:10px">'+bar(ts/tb*100,ts>tb?'var(--red)':'')+'</div>':'')+'</div><div class="card"><h2>الحد الشهري لكل بند</h2>'+rows+'<p class="note">بتتطبّق على كل شهر. البار برتقالي عند 80% وأحمر لما تعدّي، وهيجيلك تنبيه أول ما تسجّل.</p><button class="btn sec" data-a="budgetAuto">✨ اقترحلي ميزانية من مصاريفي</button></div>';}
function vDebts(){const open=S.debts.filter(d=>d.paid<d.amount),lent=open.filter(d=>d.kind==='lent').reduce((a,d)=>a+d.amount-d.paid,0),bor=open.filter(d=>d.kind==='borrowed').reduce((a,d)=>a+d.amount-d.paid,0);
  let h='<div class="card"><div class="kpis"><div class="kpi"><div class="l">💚 ليك عند الناس</div><div class="v pos">'+fmt(lent)+'</div></div><div class="kpi"><div class="l">❤️ عليك للناس</div><div class="v neg">'+fmt(bor)+'</div></div></div></div><div class="card">';
  if(!S.debts.length)h+=empty('🤝','مفيش ديون ولا سلف مسجّلة');
  S.debts.slice().sort((a,b)=>(a.paid>=a.amount)-(b.paid>=b.amount)||(a.due||'9').localeCompare(b.due||'9')).forEach(d=>{const done=d.paid>=d.amount,rem=d.amount-d.paid;let ch=done?'<span class="chip">✅ خالص</span>':d.due?(d.due<today()?'<span class="chip r">متأخر</span>':'<span class="chip w">'+dName(d.due)+'</span>'):'';
    h+='<div class="item"><div class="row"><span class="n">'+(d.kind==='lent'?'💚 ليا عند ':'❤️ عليا لـ ')+esc(d.person)+'</span>'+ch+'</div><div class="s">'+fmt(d.amount)+(d.paid?' · اتسدد '+fmt(d.paid):'')+(done?'':' · فاضل <b>'+fmt(rem)+'</b>')+(d.note?' · '+esc(d.note):'')+'</div>'+bar(d.paid/d.amount*100,d.kind==='lent'?'var(--grn)':'var(--red)')+(done?'<div class="btns"><button class="btn dng sm" data-a="debtDel" data-id="'+d.id+'">🗑 حذف</button></div>':'<div class="btns"><button class="btn sm" data-a="debtPay" data-id="'+d.id+'">سداد جزء</button><button class="btn sec sm" data-a="debtFull" data-id="'+d.id+'">اتسدد كله</button><button class="btn dng sm" data-a="debtDel" data-id="'+d.id+'">🗑</button></div>')+'</div>';});
  return h+'<button class="btn" data-a="debtNew" style="margin-top:12px">+ دين أو سلفة جديدة</button></div><p class="note">الديون هنا للمتابعة بس ومش بتأثر على رصيد محافظك.</p>';}
function vWallets(){let h='<div class="card"><div class="kpi big"><div class="l">إجمالي رصيدك في كل المحافظ</div><div class="v '+(totalBal()<0?'neg':'pos')+'">'+fmt(totalBal())+'</div></div></div><div class="card">';
  S.wallets.forEach(w=>{const n=S.tx.filter(t=>t.wallet===w.id||t.to===w.id).length;h+='<div class="tx"><div class="ic">'+esc(w.emoji)+'</div><div class="m"><div class="t">'+esc(w.name)+'</div><div class="d">'+n+' عملية · رصيد البداية '+fmt(w.start)+'</div></div><div class="a '+(walletBal(w.id)<0?'neg':'')+'">'+fmt(walletBal(w.id))+'</div><button class="ibtn" data-a="walEdit" data-id="'+w.id+'" aria-label="تعديل">✏️</button>'+(S.wallets.length>1?'<button class="ibtn" data-a="walDel" data-id="'+w.id+'" aria-label="حذف">🗑</button>':'')+'</div>';});
  return h+'<div class="acts"><button class="btn" data-a="walNew">+ محفظة جديدة</button>'+(S.wallets.length>1?'<button class="btn sec" data-a="transfer">🔄 تحويل</button>':'')+'</div><p class="note">مثال: كاش، حساب البنك، فودافون كاش، إنستاباي. اختار المحفظة وانت بتسجّل أي عملية.</p></div>';}
function vRecur(){const ex=S.recurring.filter(r=>r.active&&r.type==='exp'),mo=ex.reduce((a,r)=>a+monthlyOf(r),0);
  let h='<div class="card"><div class="kpis"><div class="kpi"><div class="l">مصاريف ثابتة في الشهر</div><div class="v neg">'+fmt(mo)+'</div></div><div class="kpi"><div class="l">يعني في السنة</div><div class="v neg">'+fmt(mo*12)+'</div></div></div></div><div class="card">';
  if(!S.recurring.length)h+=empty('🔁','ضيف مرتبك، الإيجار، النت، نتفليكس… وهيتسجّلوا لوحدهم في ميعادهم');
  S.recurring.forEach(r=>{h+='<div class="tx" style="'+(r.active?'':'opacity:.5')+'"><div class="ic">'+cat(r.cat)[2]+'</div><div class="m"><div class="t">'+esc(r.name)+'</div><div class="d">'+(r.freq==='weekly'?'كل '+DAYS[r.day]:'يوم '+r.day+' كل شهر')+(r.active?' · الجاي: '+dName(r.next):' · متوقف')+'</div></div><div class="a '+(r.type==='inc'?'pos':'neg')+'">'+fmt(r.amount)+'</div><button class="ibtn" data-a="recToggle" data-id="'+r.id+'" aria-label="'+(r.active?'إيقاف':'تشغيل')+'">'+(r.active?'⏸':'▶️')+'</button><button class="ibtn" data-a="recDel" data-id="'+r.id+'" aria-label="حذف">🗑</button></div>';});
  return h+'<button class="btn" data-a="recNew" style="margin-top:12px">+ عملية متكررة / اشتراك</button></div>';}
function vWish(){let h='<div class="card"><div class="kpi big"><div class="l">🧠 وفّرت بقراراتك الذكية</div><div class="v pos">'+fmt(S.wishSaved)+'</div></div><p class="note" style="margin-bottom:0">قاعدة التفكير: أي حاجة بأقل من 1,000 استنّى يومين، وأكتر من 1,000 استنّى 30 يوم قبل ما تشتريها. أغلب الرغبات بتختفي!</p></div><div class="card">';
  if(!S.wish.length)h+=empty('🛒','نفسك في حاجة؟ ضيفها هنا بدل ما تشتريها على طول');
  S.wish.forEach(w=>{const left=wishWait(w)-diffDays(w.added,today()),ready=left<=0;h+='<div class="item"><div class="row"><span class="n">'+esc(w.emoji)+' '+esc(w.name)+'</span>'+(ready?'<span class="chip">✅ خلصت فترة التفكير</span>':'<span class="chip w">⏳ استنّى '+left+' يوم</span>')+'</div><div class="s">'+fmt(w.price)+' · اتضافت '+dName(w.added)+'</div><div class="btns"><button class="btn dng sm" data-a="wishSkip" data-id="'+w.id+'">🧠 مش محتاجها</button><button class="btn sec sm" data-a="wishGoal" data-id="'+w.id+'">🎯 حوّلها لهدف</button><button class="btn sm" data-a="wishBuy" data-id="'+w.id+'"'+(ready?'':' style="opacity:.6"')+'>🛍️ اشتريتها</button></div></div>';});
  return h+'<button class="btn" data-a="wishNew" style="margin-top:12px">+ حاجة نفسي فيها</button></div>';}
function vGam(){let h='<div class="card">';if(!S.gam.length)h+=empty('🔄','سجّل جمعيتك وتابع دورك وكام دفعت');
  S.gam.forEach(g=>{const i=gamInfo(g);let ch=i.done?'<span class="chip g">خلصت</span>':!i.started?'<span class="chip w">لسه ما بدأتش</span>':i.isTurn?'<span class="chip">🎉 دورك الشهر ده</span>':'<span class="chip w">الشهر '+i.k+' من '+i.n+'</span>';
    h+='<div class="item"><div class="row"><span class="n">🔄 '+esc(g.name)+'</span>'+ch+'</div><div class="s">'+fmt(g.monthly)+' شهريًا × '+i.n+' أفراد = <b>'+fmt(i.total)+'</b> · دورك: الشهر رقم '+g.myTurn+' ('+mName(i.turnM)+')</div><div class="s">دفعت لحد دلوقتي '+fmt(i.paid)+' من '+fmt(i.total)+'</div>'+bar(i.paid/i.total*100)+'<div class="btns"><button class="btn dng sm" data-a="gamDel" data-id="'+g.id+'">🗑 حذف</button></div></div>';});
  return h+'<button class="btn" data-a="gamNew" style="margin-top:12px">+ جمعية جديدة</button></div>';}
function vChal(){const b=+S.c52.base||10,done=S.c52.done,saved=done.reduce((a,w)=>a+w*b,0),goal=1378*b;let h='<div class="card"><h2>📅 تحدي الـ 52 أسبوع</h2><p class="note" style="margin-top:0">الأسبوع 1 تحوّش '+fmt(b)+'، الأسبوع 2 تحوّش '+fmt(b*2)+'… لحد الأسبوع 52. في الآخر هيبقى معاك <b>'+fmt(goal)+'</b>.</p>';
  h+='<label class="f" for="c52b">مبلغ الأسبوع الأول</label><input class="inp" id="c52b" inputmode="decimal" value="'+b+'" style="direction:ltr;text-align:center">';
  h+='<div class="row" style="margin:12px 0 8px"><b class="pos">'+fmt(saved)+'</b><span class="mut">'+done.length+'/52 أسبوع</span></div>'+bar(saved/goal*100)+'<div class="w52" style="margin-top:12px">';
  for(let i=1;i<=52;i++)h+='<button data-a="c52" data-w="'+i+'" aria-pressed="'+done.includes(i)+'" aria-label="الأسبوع '+i+'">'+i+'</button>';
  h+='</div></div><div class="card"><h2>🧊 تحدي أيام من غير صرف</h2><div class="kpis"><div class="kpi"><div class="l">الشهر ده</div><div class="v">'+noSpendDays(ym(today()))+' يوم</div></div><div class="kpi"><div class="l">السلسلة الحالية</div><div class="v">'+noSpendStreak()+' يوم</div></div></div><p class="note">حاول توصل لـ 8 أيام في الشهر من غير أي صرف. خريطة الشهر:</p>'+calHTML(ym(today()))+'</div>';
  h+='<div class="card"><h2>🔥 سلسلة التسجيل</h2><div class="kpis"><div class="kpi"><div class="l">الحالية</div><div class="v">'+logStreak()+' يوم</div></div><div class="kpi"><div class="l">أطول سلسلة</div><div class="v">'+maxLogStreak()+' يوم</div></div></div></div>';
  return h;}
function vBadges(){const L=badgeList();return '<div class="card"><h2>🏅 إنجازاتك <small>'+L.filter(b=>b[3]).length+' من '+L.length+'</small></h2><div class="badges">'+L.map(b=>'<div class="badge'+(b[3]?'':' off')+'"><div class="e">'+b[0]+'</div><b>'+b[1]+'</b><small>'+b[2]+'</small></div>').join('')+'</div></div>';}
function ci(id,label,val){return '<label class="f" for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" data-calc="1" inputmode="decimal" value="'+(val==null?'':val)+'" style="direction:ltr;text-align:center">';}
function vCalc(){const avg=avgMonthlyExp();return '<div class="card"><h2>⏱️ هوصل لهدفي إمتى؟</h2><div class="grid2">'+ci('k1t','المبلغ المطلوب','')+ci('k1s','محوّش كام','0')+'</div>'+ci('k1m','هحوّش كام في الشهر','')+'<div class="res" id="r1">اكتب الأرقام…</div></div>'+
  '<div class="card"><h2>📆 محتاج أحوّش كام في الشهر؟</h2><div class="grid2">'+ci('k2t','المبلغ المطلوب','')+ci('k2s','محوّش كام','0')+'</div>'+ci('k2n','عاوز أوصله خلال كام شهر','12')+'<div class="res" id="r2">اكتب الأرقام…</div></div>'+
  '<div class="card"><h2>📈 التحويش مع عائد (وديعة/صندوق)</h2><div class="grid2">'+ci('k3p','مبلغ البداية','0')+ci('k3m','إيداع شهري','')+ci('k3r','العائد السنوي %','')+ci('k3y','عدد السنين','3')+'</div><div class="res" id="r3">اكتب الأرقام…</div><p class="note">تقدير بعائد مركّب شهري. الأرقام الحقيقية بتختلف حسب البنك والضرايب.</p></div>'+
  '<div class="card"><h2>🏦 شهادة بعائد شهري</h2><div class="grid2">'+ci('k4a','مبلغ الشهادة','')+ci('k4r','العائد السنوي %','')+'</div>'+ci('k4y','مدة الشهادة (سنين)','3')+'<div class="res" id="r4">اكتب الأرقام…</div></div>'+
  '<div class="card"><h2>💳 حاسبة التقسيط</h2><div class="grid2">'+ci('k5p','سعر الحاجة','')+ci('k5d','المقدم','0')+ci('k5n','عدد الشهور','12')+ci('k5r','فايدة سنوية ثابتة %','0')+'</div><div class="res" id="r5">اكتب الأرقام…</div></div>'+
  '<div class="card"><h2>🍕 تقسيم الحساب</h2><div class="grid2">'+ci('k6t','إجمالي الحساب','')+ci('k6n','عدد الأفراد','2')+'</div>'+ci('k6s','خدمة/تيب %','0')+'<div class="res" id="r6">اكتب الأرقام…</div></div>'+
  '<div class="card"><h2>🛟 صندوق الطوارئ</h2>'+ci('k7e','متوسط مصاريفك الشهرية',avg?Math.round(avg):'')+ci('k7h','معاك كام دلوقتي',Math.round(Math.max(0,totalBal())))+'<div class="res" id="r7">اكتب الأرقام…</div></div>';}
function calcAll(){const g=id=>num(($(id)||{}).value),set=(id,h)=>{if($(id))$(id).innerHTML=h;};
  {const t=g('k1t'),s=g('k1s'),m=g('k1m');if(t&&m){const n=Math.ceil(Math.max(0,t-s)/m),d=new Date();d.setMonth(d.getMonth()+n);set('r1','هتوصل خلال <b>'+n+'</b> شهر — تقريبًا في <b>'+MONTHS[d.getMonth()]+' '+d.getFullYear()+'</b>');}}
  {const t=g('k2t'),s=g('k2s'),n=g('k2n');if(t&&n)set('r2','محتاج تحوّش <b>'+fmt(Math.max(0,t-s)/n)+'</b> في الشهر، يعني حوالي <b>'+fmt(Math.max(0,t-s)/n/30)+'</b> في اليوم');}
  {const p=g('k3p'),m=g('k3m'),r=g('k3r')/100/12,n=g('k3y')*12;if(n&&(p||m)){const fv=r?p*Math.pow(1+r,n)+m*(Math.pow(1+r,n)-1)/r:p+m*n,dep=p+m*n;set('r3','هيبقى معاك حوالي <b>'+fmt(fv)+'</b><br>منهم إيداعاتك <b>'+fmt(dep)+'</b> وأرباح <b>'+fmt(fv-dep)+'</b>');}}
  {const a=g('k4a'),r=g('k4r')/100,y=g('k4y');if(a&&r)set('r4','العائد الشهري حوالي <b>'+fmt(a*r/12)+'</b><br>في السنة <b>'+fmt(a*r)+'</b> · طول المدة <b>'+fmt(a*r*y)+'</b> (قبل الضرايب)');}
  {const p=g('k5p'),d=g('k5d'),n=g('k5n'),r=g('k5r')/100;if(p&&n){const b=Math.max(0,p-d),tot=b*(1+r*n/12),q=tot/n;set('r5','القسط الشهري <b>'+fmt(q)+'</b><br>إجمالي اللي هتدفعه <b>'+fmt(tot+d)+'</b> — يعني زيادة <b>'+fmt(tot+d-p)+'</b> عن الكاش');}}
  {const t=g('k6t'),n=g('k6n'),s=g('k6s');if(t&&n)set('r6','كل واحد يدفع <b>'+fmt(t*(1+s/100)/n)+'</b> (الإجمالي بالخدمة '+fmt(t*(1+s/100))+')');}
  {const e=g('k7e'),h=g('k7h');if(e){const a=e*3,b=e*6;set('r7','الصندوق الآمن من <b>'+fmt(a)+'</b> لـ <b>'+fmt(b)+'</b><br>'+(h>=b?'🏆 ممتاز! صندوقك كامل':h>=a?'👍 وصلت للحد الأدنى — كمّل لـ 6 شهور':'فاضلك <b>'+fmt(a-h)+'</b> توصل للحد الأدنى (3 شهور)'));}}}
function vSet(){const s=S.set;let h='<div class="card"><h2>🎨 الشكل</h2><div class="seg">'+[['auto','تلقائي'],['light','☀️ فاتح'],['dark','🌙 داكن']].map(t=>'<button data-a="theme" data-v="'+t[0]+'" aria-pressed="'+(s.theme===t[0])+'">'+t[1]+'</button>').join('')+'</div>';
  h+='<div class="grid2"><div><label class="f" for="sCur">رمز العملة</label><input class="inp" id="sCur" maxlength="5" value="'+esc(s.currency)+'"></div><div><label class="f" for="sTgt">هدف التوفير الشهري %</label><input class="inp" id="sTgt" inputmode="numeric" value="'+(+s.saveTarget||0)+'" style="direction:ltr;text-align:center"></div></div></div>';
  h+='<div class="card"><h2>⏰ التذكير</h2><label class="f" for="sRem">ميعاد تذكيرك بتسجيل المصاريف</label><input type="time" id="sRem" class="inp" value="'+esc(s.remind)+'"><button class="btn sec" data-a="notif" style="margin-top:10px">🔔 '+(s.notif?'الإشعارات شغّالة':'فعّل الإشعارات')+'</button><p class="note">التنبيه بيظهر جوّه التطبيق لما تفتحه بعد الميعاد، وكإشعار لو التطبيق مفتوح.</p></div>';
  h+='<div class="card"><h2>🔒 قفل التطبيق</h2><p class="note" style="margin-top:0">رقم سري من 4 أرقام يتطلب كل ما تفتح التطبيق (للخصوصية — مش تشفير).</p>'+(s.pin?'<button class="btn dng" data-a="pinOff">إلغاء الرقم السري</button>':'<button class="btn sec" data-a="pinOn">حط رقم سري</button>')+'</div>';
  h+='<div class="card"><h2>🏷️ أنواع خاصة بيك</h2>'+(S.customCats.length?S.customCats.map(c=>'<div class="tx"><div class="ic" style="background:'+c.color+'22">'+esc(c.emoji)+'</div><div class="m"><div class="t">'+esc(c.name)+'</div><div class="d">'+(c.type==='exp'?'مصروف':'دخل')+'</div></div><button class="ibtn" data-a="catDel" data-id="'+c.id+'" aria-label="حذف">🗑</button></div>').join(''):'<p class="note">مثلاً: جيم، سجاير، دروس، عربية…</p>')+'<button class="btn sec" data-a="catNew">+ نوع جديد</button></div>';
  h+='<div class="card"><h2>⭐ القوالب السريعة</h2>'+(S.templates.length?S.templates.map(t=>'<div class="tx"><div class="ic">'+cat(t.cat)[2]+'</div><div class="m"><div class="t">'+esc(t.note||cat(t.cat)[1])+'</div><div class="d">'+fmt(t.amount)+'</div></div><button class="ibtn" data-a="tplDel" data-id="'+t.id+'" aria-label="حذف">🗑</button></div>').join(''):'<p class="note">وانت بتسجّل عملية علّم على "احفظها كقالب" وهتظهرلك كزرار سريع.</p>')+'</div>';
  h+='<div class="card"><h2>💾 بياناتك</h2><p class="note" style="margin-top:0">بياناتك على الجهاز ده بس. اعمل نسخة احتياطية كل فترة.</p><div class="acts"><button class="btn" data-a="backup">⬇️ نسخة احتياطية</button><button class="btn sec" data-a="restore">⬆️ استرجاع</button></div><button class="btn sec" data-a="csv" style="margin-top:10px">📄 تصدير Excel (CSV)</button><input type="file" id="impF" accept=".json,application/json" class="hidden"></div>';
  if(deferredPrompt)h+='<div class="card"><button class="btn" data-a="install">📲 ثبّت التطبيق على الموبايل</button></div>';
  h+='<div class="card"><h2>🧪 أخرى</h2><button class="btn sec" data-a="demo">ضيف بيانات تجريبية</button><button class="btn dng" data-a="wipe" style="margin-top:10px">🗑 مسح كل البيانات</button><p class="note">'+S.tx.length+' عملية · '+S.goals.length+' هدف · نسخة '+VERSION+(canStore?'':' · ⚠️ الحفظ مش متاح هنا')+'</p></div>';
  return h;}
// ---------- sheets
function openSheet(h){$('sheet').innerHTML=h;$('sheetBg').classList.add('on');const f=$('sheet').querySelector('input:not([type=checkbox]):not([type=date])');if(f)setTimeout(()=>{try{f.focus();}catch(e){}},80);}
function closeSheet(){$('sheetBg').classList.remove('on');}
const F=(id,label,attrs)=>'<label class="f" for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" '+(attrs||'')+'>';
const actions=(saveA,label)=>'<div class="acts"><button class="btn" data-a="'+saveA+'">'+(label||'حفظ')+'</button><button class="btn sec" data-a="close">إلغاء</button></div>';
const walSel=(id,v)=>'<select class="inp" id="'+id+'">'+S.wallets.map(w=>'<option value="'+w.id+'"'+(w.id===v?' selected':'')+'>'+esc(w.emoji+' '+w.name)+'</option>').join('')+'</select>';
let nt={type:'exp',cat:'food',wallet:'cash',edit:null};
function addSheet(pre){if(pre)nt=Object.assign({type:'exp',cat:'food',wallet:S.wallets[0].id,edit:null,amount:'',note:'',date:today(),to:''},pre);
  if(!S.wallets.some(w=>w.id===nt.wallet))nt.wallet=S.wallets[0].id;
  const list=nt.type==='inc'?incCats():expCats();if(nt.type!=='tr'&&!list.some(c=>c[0]===nt.cat))nt.cat=list[0][0];
  const tpl=S.templates.filter(t=>t.type===nt.type);
  let h='<h3>'+(nt.edit?'✏️ تعديل عملية':'إضافة عملية')+'</h3><div class="seg">'+[['exp','⬇️ مصروف'],['inc','⬆️ دخل']].concat(S.wallets.length>1?[['tr','🔄 تحويل']]:[]).map(t=>'<button data-a="ntType" data-v="'+t[0]+'" aria-pressed="'+(nt.type===t[0])+'">'+t[1]+'</button>').join('')+'</div>';
  if(tpl.length&&!nt.edit)h+='<div class="tpls">'+tpl.map(t=>'<button data-a="useTpl" data-id="'+t.id+'">'+cat(t.cat)[2]+' '+esc(t.note||cat(t.cat)[1])+' · '+fmt(t.amount)+'</button>').join('')+'</div>';
  h+=F('nA','المبلغ','class="inp amt" inputmode="decimal" placeholder="0" autocomplete="off" value="'+esc(nt.amount||'')+'"');
  if(nt.type==='tr')h+='<div class="grid2"><div><label class="f" for="nW">من</label>'+walSel('nW',nt.wallet)+'</div><div><label class="f" for="nTo">إلى</label>'+walSel('nTo',nt.to||(S.wallets[1]||S.wallets[0]).id)+'</div></div>';
  else{h+='<label class="f">النوع</label><div class="cats">'+list.map(c=>'<button data-a="ntCat" data-v="'+c[0]+'" aria-pressed="'+(nt.cat===c[0])+'"><span>'+c[2]+'</span>'+esc(c[1])+'</button>').join('')+'</div>';if(S.wallets.length>1)h+='<label class="f" for="nW">المحفظة</label>'+walSel('nW',nt.wallet);}
  h+=F('nN','ملاحظة (اختياري)','maxlength="60" placeholder="مثلاً: غدا مع الشغل" value="'+esc(nt.note||'')+'"')+F('nD','التاريخ','type="date" value="'+esc(nt.date||today())+'"');
  if(!nt.edit&&nt.type!=='tr')h+='<label class="chk"><input type="checkbox" id="nTpl"> ⭐ احفظها كقالب سريع</label>';
  openSheet(h+actions('txSave'));}
function readNT(){nt.amount=($('nA')||{}).value;nt.note=($('nN')||{}).value;nt.date=($('nD')||{}).value;if($('nW'))nt.wallet=$('nW').value;if($('nTo'))nt.to=$('nTo').value;}
let deferredPrompt=null,lastDeleted=null;
// ---------- toast
function toast(m,btn,fn){const t=$('toast');$('toastMsg').textContent=m;const b=$('toastBtn');if(btn){b.textContent=btn;b.classList.remove('hidden');b.onclick=()=>{fn();t.classList.remove('on');};}else b.classList.add('hidden');t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),btn?4500:2300);}
const confirmIt=m=>{try{return window.confirm(m);}catch(e){return true;}};
// ---------- actions
const A={
 add:()=>addSheet({}),close:closeSheet,
 ntType:b=>{readNT();nt.type=b.dataset.v;addSheet();},
 ntCat:b=>{nt.cat=b.dataset.v;nt.catTouched=true;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));},
 useTpl:b=>{const t=S.templates.find(x=>x.id===b.dataset.id);if(!t)return;readNT();Object.assign(nt,{cat:t.cat,amount:t.amount,note:t.note,wallet:t.wallet||nt.wallet});addSheet();},
 txSave:()=>{readNT();const amt=calcExpr(nt.amount);if(!amt){toast('اكتب المبلغ الأول');$('nA').focus();return;}
   if(nt.type==='tr'&&nt.wallet===nt.to){toast('اختار محفظتين مختلفتين');return;}
   const rec={type:nt.type,amount:amt,cat:nt.type==='tr'?'':nt.cat,wallet:nt.wallet,note:(nt.note||'').trim(),date:nt.date||today()};if(nt.type==='tr')rec.to=nt.to;
   if(nt.edit){const t=S.tx.find(x=>x.id===nt.edit);if(t){delete t.to;Object.assign(t,rec);}}else S.tx.push(Object.assign({id:uid(),ts:Date.now()},rec));
   if($('nTpl')&&$('nTpl').checked)S.templates.push({id:uid(),type:rec.type,cat:rec.cat,amount:amt,note:rec.note,wallet:rec.wallet});
   save();closeSheet();let msg=nt.edit?'✅ اتعدّلت':'✅ اتسجّلت';const bud=S.budgets[rec.cat];
   if(rec.type==='exp'&&bud){const sp=byCat(monthTx(ym(rec.date)))[rec.cat]||0;if(sp>bud)msg='⚠️ عدّيت ميزانية '+cat(rec.cat)[1];else if(sp>=.8*bud)msg='🟠 قرّبت تخلّص ميزانية '+cat(rec.cat)[1];}
   if(!nt.edit&&rec.type!=='tr'){const nr=S.tx[S.tx.length-1];learnFrom(nr);const u=unusual(nr);if(u)msg+=' · 😮 أعلى من المعتاد (عادةً '+fmt(u)+')';}haptic(15);toast(msg);render();},
 txEdit:b=>{const t=S.tx.find(x=>x.id===b.dataset.id);if(t)addSheet({type:t.type,cat:t.cat,wallet:t.wallet,to:t.to,amount:t.amount,note:t.note,date:t.date,edit:t.id});},
 txDel:b=>{const i=S.tx.findIndex(x=>x.id===b.dataset.id);if(i<0)return;lastDeleted=S.tx.splice(i,1)[0];save();render();toast('🗑 اتحذفت','تراجع',()=>{S.tx.push(lastDeleted);save();render();});},
 txType:b=>{ui.txType=b.dataset.v;render();},clearDay:()=>{ui.txDay='';render();},
 calDay:b=>{ui.txDay=b.dataset.d;ui.txType='all';go('tx');},
 csv:()=>{const rows=[['التاريخ','النوع','التصنيف','المبلغ','المحفظة','إلى','ملاحظة']].concat(S.tx.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(t=>[t.date,t.type==='inc'?'دخل':t.type==='exp'?'مصروف':'تحويل',t.type==='tr'?'':cat(t.cat)[1],t.amount,wal(t.wallet).name,t.to?wal(t.to).name:'',t.note||'']));
   download('tahweesha-'+today()+'.csv','\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8');toast('📄 الملف اتحمّل — افتحه بـ Excel');},
 saveNow:()=>{const o=S.goals.filter(g=>g.saved<g.target);if(!S.goals.length){A.goalNew();return;}if(!o.length){toast('كل أهدافك اتحققت 🎉 ضيف هدف جديد');A.goalNew();return;}if(o.length===1){A.goalMoney({dataset:{id:o[0].id,s:'1'}});return;}openSheet('<h3>💰 تحوّش لأنهي هدف؟</h3>'+o.map(g=>'<button class="btn sec" data-a="goalMoney" data-id="'+g.id+'" data-s="1" style="margin-bottom:8px;text-align:right">'+esc(g.emoji)+' '+esc(g.name)+' · فاضل '+fmt(g.target-g.saved)+'</button>').join('')+'<button class="btn sec" data-a="close">إلغاء</button>');},
 goalNew:()=>openSheet('<h3>🎯 هدف جديد</h3>'+F('gN','اسم الهدف','maxlength="40" placeholder="مثلاً: موبايل جديد"')+'<div class="grid2">'+F('gE','إيموجي','maxlength="4" value="🎯"')+F('gT','المبلغ المطلوب','inputmode="decimal" placeholder="0" style="direction:ltr"')+'</div>'+F('gS','محوّش منه كام؟','inputmode="decimal" placeholder="0" style="direction:ltr"')+F('gD','عاوز توصله إمتى؟ (اختياري)','type="date"')+'<input type="hidden" id="gId">'+actions('goalSave')),
 goalEdit:b=>{const g=S.goals.find(x=>x.id===b.dataset.id);A.goalNew();$('gN').value=g.name;$('gE').value=g.emoji;$('gT').value=g.target;$('gS').value=g.saved;$('gD').value=g.deadline||'';$('gId').value=g.id;},
 goalSave:()=>{const n=$('gN').value.trim(),t=num($('gT').value);if(!n||!t){toast('اكتب اسم الهدف والمبلغ');return;}const d={name:n,emoji:$('gE').value.trim()||'🎯',target:t,saved:num($('gS').value),deadline:$('gD').value||''},id=$('gId').value;
   if(id)Object.assign(S.goals.find(x=>x.id===id),d);else S.goals.push(Object.assign({id:uid()},d));save();closeSheet();render();toast('🎯 اتحفظ');},
 goalMoney:b=>{const g=S.goals.find(x=>x.id===b.dataset.id),s=+b.dataset.s;openSheet('<h3>'+(s>0?'💰 حوّش لـ ':'↩️ سحب من ')+esc(g.name)+'</h3>'+F('mA','المبلغ','class="inp amt" inputmode="decimal" placeholder="0"')+actions('goalMoneySave','تأكيد'));$('sheet').dataset.id=g.id;$('sheet').dataset.s=s;},
 goalMoneySave:()=>{const g=S.goals.find(x=>x.id===$('sheet').dataset.id),v=num($('mA').value);if(!v){toast('اكتب المبلغ');return;}const was=g.saved>=g.target;g.saved=Math.max(0,g.saved+v*(+$('sheet').dataset.s));save();closeSheet();render();toast(!was&&g.saved>=g.target?'🎉 مبروك! حققت هدف '+g.name:'✅ اتحدّث');},
 goalDel:b=>{if(confirmIt('تحذف الهدف ده؟')){S.goals=S.goals.filter(x=>x.id!==b.dataset.id);save();render();}},
 budgetAuto:()=>{const m=ym(today());const tot={};let c=0;for(let k=1;k<=3;k++){const bc=byCat(monthTx(prevYM(m,k)));if(Object.keys(bc).length)c++;for(const x in bc)tot[x]=(tot[x]||0)+bc[x];}
   if(!c){const bc=byCat(monthTx(m));for(const x in bc)tot[x]=bc[x];c=1;}if(!Object.keys(tot).length){toast('سجّل مصاريف الأول علشان أقترح');return;}
   for(const x in tot)S.budgets[x]=Math.ceil(tot[x]/c*.9/10)*10;save();render();toast('✨ اقترحت ميزانية أقل 10% من متوسط صرفك');},
 debtNew:()=>openSheet('<h3>🤝 دين أو سلفة</h3><div class="seg" id="dk"><button data-a="dKind" data-v="borrowed" aria-pressed="true">❤️ عليا لحد</button><button data-a="dKind" data-v="lent" aria-pressed="false">💚 ليا عند حد</button></div>'+F('dP','اسم الشخص','maxlength="30"')+F('dA','المبلغ','class="inp amt" inputmode="decimal" placeholder="0"')+F('dD','ميعاد السداد (اختياري)','type="date"')+F('dN','ملاحظة','maxlength="60"')+actions('debtSave')),
 dKind:b=>b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)),
 debtSave:()=>{const p=$('dP').value.trim(),a=num($('dA').value);if(!p||!a){toast('اكتب الاسم والمبلغ');return;}const k=$('dk').querySelector('[aria-pressed=true]').dataset.v;S.debts.push({id:uid(),kind:k,person:p,amount:a,paid:0,due:$('dD').value||'',note:$('dN').value.trim(),added:today()});save();closeSheet();render();toast('✅ اتسجّل');},
 debtPay:b=>{const d=S.debts.find(x=>x.id===b.dataset.id);openSheet('<h3>سداد جزء — '+esc(d.person)+'</h3><p class="note">فاضل '+fmt(d.amount-d.paid)+'</p>'+F('pA','المبلغ اللي اتسدد','class="inp amt" inputmode="decimal" placeholder="0"')+actions('debtPaySave','تأكيد'));$('sheet').dataset.id=d.id;},
 debtPaySave:()=>{const d=S.debts.find(x=>x.id===$('sheet').dataset.id),v=num($('pA').value);if(!v){toast('اكتب المبلغ');return;}d.paid=Math.min(d.amount,d.paid+v);save();closeSheet();render();toast(d.paid>=d.amount?'🎉 الدين اتقفل!':'✅ اتسجّل');},
 debtFull:b=>{const d=S.debts.find(x=>x.id===b.dataset.id);d.paid=d.amount;save();render();toast('🎉 الدين اتقفل!');},
 debtDel:b=>{if(confirmIt('تحذف ده؟')){S.debts=S.debts.filter(x=>x.id!==b.dataset.id);save();render();}},
 walNew:()=>openSheet('<h3>👛 محفظة جديدة</h3>'+F('wN','الاسم','maxlength="25" placeholder="مثلاً: فودافون كاش"')+'<div class="grid2">'+F('wE','إيموجي','maxlength="4" value="💳"')+F('wS','الرصيد الحالي','inputmode="decimal" value="0" style="direction:ltr"')+'</div><input type="hidden" id="wId">'+actions('walSave')),
 walEdit:b=>{const w=wal(b.dataset.id);A.walNew();$('wN').value=w.name;$('wE').value=w.emoji;$('wS').value=w.start;$('wId').value=w.id;$('sheet').querySelector('label[for=wS]').textContent='رصيد البداية';},
 walSave:()=>{const n=$('wN').value.trim();if(!n){toast('اكتب اسم المحفظة');return;}const d={name:n,emoji:$('wE').value.trim()||'💳',start:num($('wS').value)},id=$('wId').value;if(id)Object.assign(S.wallets.find(x=>x.id===id),d);else S.wallets.push(Object.assign({id:uid()},d));save();closeSheet();render();toast('✅ اتحفظت');},
 walDel:b=>{if(S.tx.some(t=>t.wallet===b.dataset.id||t.to===b.dataset.id)){toast('المحفظة فيها عمليات — مش هينفع تتحذف');return;}if(confirmIt('تحذف المحفظة؟')){S.wallets=S.wallets.filter(x=>x.id!==b.dataset.id);save();render();}},
 transfer:()=>addSheet({type:'tr',wallet:S.wallets[0].id,to:S.wallets[1].id}),
 recNew:()=>{openSheet('<h3>🔁 عملية متكررة</h3><div class="seg" id="rT"><button data-a="rType" data-v="exp" aria-pressed="true">⬇️ مصروف</button><button data-a="rType" data-v="inc" aria-pressed="false">⬆️ دخل</button></div>'+F('rN','الاسم','maxlength="30" placeholder="مثلاً: إيجار، نت، مرتب"')+F('rA','المبلغ','class="inp amt" inputmode="decimal" placeholder="0"')+'<label class="f" for="rC">النوع</label><select class="inp" id="rC"></select>'+(S.wallets.length>1?'<label class="f" for="rW">المحفظة</label>'+walSel('rW',S.wallets[0].id):'')+'<div class="grid2"><div><label class="f" for="rF">بيتكرر</label><select class="inp" id="rF"><option value="monthly">كل شهر</option><option value="weekly">كل أسبوع</option></select></div><div><label class="f" for="rD">يوم</label><select class="inp" id="rD"></select></div></div>'+actions('recSave'));fillRec();},
 rType:b=>{b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));fillRec();},
 recSave:()=>{const n=$('rN').value.trim(),a=num($('rA').value);if(!n||!a){toast('اكتب الاسم والمبلغ');return;}const r={id:uid(),type:$('rT').querySelector('[aria-pressed=true]').dataset.v,name:n,amount:a,cat:$('rC').value,wallet:$('rW')?$('rW').value:S.wallets[0].id,freq:$('rF').value,day:+$('rD').value,active:true};
   r.next=nextDue(r,today());S.recurring.push(r);save();closeSheet();runRecurring();render();toast('🔁 هتتسجّل لوحدها — أول مرة '+dName(r.next));},
 recToggle:b=>{const r=S.recurring.find(x=>x.id===b.dataset.id);r.active=!r.active;if(r.active)r.next=nextDue(r,today());save();render();},
 recDel:b=>{if(confirmIt('توقف وتحذف العملية المتكررة؟ (العمليات اللي اتسجّلت قبل كده هتفضل)')){S.recurring=S.recurring.filter(x=>x.id!==b.dataset.id);save();render();}},
 wishNew:()=>openSheet('<h3>🛒 حاجة نفسي فيها</h3>'+F('yN','إيه هي؟','maxlength="40" placeholder="مثلاً: سماعة لاسلكي"')+'<div class="grid2">'+F('yE','إيموجي','maxlength="4" value="✨"')+F('yP','سعرها','inputmode="decimal" placeholder="0" style="direction:ltr"')+'</div>'+actions('wishSave')),
 wishSave:()=>{const n=$('yN').value.trim(),p=num($('yP').value);if(!n||!p){toast('اكتب الاسم والسعر');return;}const w={id:uid(),name:n,emoji:$('yE').value.trim()||'✨',price:p,added:today()};S.wish.push(w);save();closeSheet();render();toast('⏳ استنّى '+wishWait(w)+' يوم وبعدين قرّر');},
 wishSkip:b=>{const w=S.wish.find(x=>x.id===b.dataset.id);S.wishSaved+=w.price;S.wish=S.wish.filter(x=>x!==w);save();render();toast('🧠 قرار ذكي! وفّرت '+fmt(w.price));},
 wishGoal:b=>{const w=S.wish.find(x=>x.id===b.dataset.id);S.goals.push({id:uid(),name:w.name,emoji:w.emoji,target:w.price,saved:0,deadline:''});S.wish=S.wish.filter(x=>x!==w);save();render();toast('🎯 بقت هدف تحويش');},
 wishBuy:b=>{const w=S.wish.find(x=>x.id===b.dataset.id),left=wishWait(w)-diffDays(w.added,today());if(left>0&&!confirmIt('لسه فاضل '+left+' يوم على فترة التفكير. متأكد إنك عاوز تشتريها دلوقتي؟'))return;
   S.tx.push({id:uid(),type:'exp',amount:w.price,cat:'shop',wallet:S.wallets[0].id,note:w.name,date:today(),ts:Date.now()});S.wish=S.wish.filter(x=>x!==w);save();render();toast('🛍️ اتسجّلت كمصروف');},
 gamNew:()=>openSheet('<h3>🔄 جمعية جديدة</h3>'+F('jN','اسم الجمعية','maxlength="30" placeholder="مثلاً: جمعية الشغل"')+'<div class="grid2">'+F('jM','القسط الشهري','inputmode="decimal" style="direction:ltr"')+F('jC','عدد الأفراد (الشهور)','inputmode="numeric" value="10" style="direction:ltr"')+F('jS','بدأت شهر','type="month" value="'+ym(today())+'"')+F('jT','دورك رقم كام','inputmode="numeric" value="1" style="direction:ltr"')+'</div>'+actions('gamSave')),
 gamSave:()=>{const n=$('jN').value.trim(),m=num($('jM').value),c=Math.round(num($('jC').value)),t=Math.round(num($('jT').value)),s=$('jS').value||ym(today());if(!n||!m||!c){toast('كمّل البيانات');return;}if(t<1||t>c){toast('دورك لازم يكون من 1 لـ '+c);return;}S.gam.push({id:uid(),name:n,monthly:m,members:c,start:s,myTurn:t});save();closeSheet();render();toast('🔄 الجمعية اتسجّلت');},
 gamDel:b=>{if(confirmIt('تحذف الجمعية؟')){S.gam=S.gam.filter(x=>x.id!==b.dataset.id);save();render();}},
 c52:b=>{const w=+b.dataset.w,i=S.c52.done.indexOf(w);if(i>=0)S.c52.done.splice(i,1);else{S.c52.done.push(w);toast('💪 الأسبوع '+w+': حوّشت '+fmt(w*(+S.c52.base||10)));}save();render();},
 theme:b=>{S.set.theme=b.dataset.v;save();applyTheme();render();},
 notif:()=>{if(!('Notification' in window)){toast('المتصفح ده مش بيدعم الإشعارات');return;}Notification.requestPermission().then(p=>{S.set.notif=p==='granted';save();render();toast(S.set.notif?'🔔 اتفعّلت':'الإشعارات مرفوضة من المتصفح');});},
 pinOn:()=>openSheet('<h3>🔒 رقم سري جديد</h3>'+F('p1','4 أرقام','type="password" inputmode="numeric" maxlength="4" style="direction:ltr;text-align:center;font-size:24px;letter-spacing:8px"')+F('p2','اكتبه تاني','type="password" inputmode="numeric" maxlength="4" style="direction:ltr;text-align:center;font-size:24px;letter-spacing:8px"')+actions('pinSave')),
 pinSave:()=>{const a=$('p1').value,b=$('p2').value;if(!/^\d{4}$/.test(a)){toast('لازم 4 أرقام');return;}if(a!==b){toast('الرقمين مش زي بعض');return;}S.set.pin=hsh(a);save();closeSheet();render();toast('🔒 الرقم السري اتحط — متنساهوش!');},
 pinOff:()=>{if(confirmIt('تلغي الرقم السري؟')){S.set.pin='';save();render();}},
 catNew:()=>openSheet('<h3>🏷️ نوع جديد</h3><div class="seg" id="cT"><button data-a="dKind" data-v="exp" aria-pressed="true">مصروف</button><button data-a="dKind" data-v="inc" aria-pressed="false">دخل</button></div>'+F('cN','الاسم','maxlength="20" placeholder="مثلاً: جيم"')+F('cE','إيموجي','maxlength="4" value="🏷️"')+actions('catSave')),
 catSave:()=>{const n=$('cN').value.trim();if(!n){toast('اكتب الاسم');return;}S.customCats.push({id:'c_'+uid(),type:$('cT').querySelector('[aria-pressed=true]').dataset.v,name:n,emoji:$('cE').value.trim()||'🏷️',color:PALETTE[S.customCats.length%PALETTE.length]});save();closeSheet();render();toast('✅ النوع اتضاف');},
 catDel:b=>{if(confirmIt('تحذف النوع؟ العمليات القديمة هتظهر كـ "أخرى"')){S.customCats=S.customCats.filter(x=>x.id!==b.dataset.id);save();render();}},
 tplDel:b=>{S.templates=S.templates.filter(x=>x.id!==b.dataset.id);save();render();},
 backup:()=>{download('tahweesha-backup-'+today()+'.json',JSON.stringify(S),'application/json');toast('⬇️ النسخة اتحمّلت — احتفظ بيها في مكان آمن');},
 restore:()=>$('impF').click(),
 install:()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;render();});},
 demo:()=>{demo();save();runRecurring();render();toast('اتضافت بيانات تجريبية');},
 wipe:()=>{if(confirmIt('متأكد؟ كل البيانات هتتمسح نهائيًا.')){const s=S.set;S=DEF();S.set=s;save();render();toast('اتمسح كل حاجة');}}
};
function fillRec(){const t=$('rT').querySelector('[aria-pressed=true]').dataset.v;$('rC').innerHTML=(t==='inc'?incCats():expCats()).map(c=>'<option value="'+c[0]+'">'+c[2]+' '+esc(c[1])+'</option>').join('');
  const f=$('rF').value;$('rD').innerHTML=f==='weekly'?DAYS.map((d,i)=>'<option value="'+i+'">'+d+'</option>').join(''):Array.from({length:28},(_,i)=>'<option value="'+(i+1)+'"'+(i+1===new Date().getDate()||(new Date().getDate()>28&&i===27)?' selected':'')+'>'+(i+1)+'</option>').join('');}
function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type:type})),l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
function demo(){const d=new Date();if(S.wallets.length<2)S.wallets.push({id:'bank',name:'البنك',emoji:'🏦',start:5000});
  const items=[['food',85],['trans',20],['coffee',35],['food',140],['shop',450],['fun',300],['net',150],['coffee',30],['bills',420],['food',60],['trans',25],['health',120]];
  for(let k=0;k<3;k++){const base=new Date(d.getFullYear(),d.getMonth()-k,1);S.tx.push({id:uid(),type:'inc',amount:9000+k*300,cat:'salary',wallet:'bank',note:'',date:iso(base),ts:Date.now()});
    items.forEach((it,i)=>{const dd=new Date(base);dd.setDate(Math.min(1+i*2,k?28:d.getDate()));S.tx.push({id:uid(),type:'exp',amount:Math.round(it[1]*(1+k*.1)),cat:it[0],wallet:'cash',note:'',date:iso(dd),ts:Date.now()+i});});}
  if(!S.goals.length)S.goals.push({id:uid(),name:'موبايل جديد',emoji:'📱',target:15000,saved:4200,deadline:iso(new Date(d.getFullYear(),d.getMonth()+5,1))});
  if(!Object.keys(S.budgets).length)S.budgets={food:1200,fun:500,shop:600};
  if(!S.debts.length)S.debts.push({id:uid(),kind:'lent',person:'أحمد',amount:500,paid:200,due:'',note:'',added:today()});
  if(!S.wish.length)S.wish.push({id:uid(),name:'سماعة لاسلكي',emoji:'🎧',price:1800,added:addDays(today(),-5)});
  if(!S.gam.length)S.gam.push({id:uid(),name:'جمعية الشغل',monthly:1000,members:10,start:prevYM(ym(today()),2),myTurn:5});}
// ========== 🧠 العقل الذكي (v3) ==========
const AR=s=>String(s==null?'':s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\u064B-\u0652\u0640]/g,'').toLowerCase();
const KW={food:'اكل غدا غداء عشا عشاء فطار فطور مطعم سندوتش سندوتشات فول طعميه كشري بيتزا برجر فراخ لحمه سمك خضار فاكهه عيش بقاله سوبرماركت ماركت حلويات حلو شيبسي بيبسي كانز طلبات ديليفري دليفري كنتاكي ماكدونالدز شاورما كفته كباب جبنه لبن بيض رز مكرونه زيت سكر تموين وجبه',
 coffee:'قهوه كافيه شاي نسكافيه ستاربكس عصير مشروب كابتشينو لاتيه كوفي',
 trans:'مواصلات اوبر كريم تاكسي ميكروباص مترو اتوبيس بنزين سولار عربيه توكتوك تكتك قطر قطار باص جراج ركنه اندرايف ديدي سويفل اجره',
 bills:'كهربا كهرباء غاز فاتوره ايجار صيانه عداد مياه',
 shop:'هدوم لبس جزمه شنطه تيشيرت بنطلون قميص شوز مول امازون نون فستان ساعه جاكيت',
 fun:'سينما خروجه فسحه رحله بلايستيشن العاب نادي حفله مصيف شيشه ملاهي ماتش',
 health:'دكتور صيدليه دوا دواء علاج تحاليل اشعه مستشفي كشف عياده اسنان جيم فيتامين',
 edu:'كتاب كتب كورس درس دروس مدرسه جامعه سنتر ملازم مذكرات كراسه ادوات',
 net:'شحن رصيد كارت باقه نت انترنت موبايل فودافون اورنج اتصالات نتفليكس شاهد سبوتيفاي يوتيوب اشتراك',
 gift:'هديه عيديه نقطه فرح',
 home:'البيت بيت منظفات مسحوق صابون اثاث مطبخ سباك نجار',
 salary:'مرتب راتب قبضت قبض',
 free:'شغل فريلانس مشروع عميل بيعت عموله بونص مكافاه',
 igift:'هديه عيديه'};
const INC_RX=/(قبضت|مرتب|راتب|استلمت|جالي|جاتلي|كسبت|مكافاه|بونص|عموله|بيعت|دخلي|دخل )/;
const toks=s=>AR(s).split(/[^\u0621-\u064Aa-z0-9]+/).filter(w=>w.length>=2&&!/^\d+$/.test(w));
const stem=w=>w.replace(/^(وال|بال|لل|ال)(?=..)/,'');
function guessCat(text,type){const list=(type==='inc'?incCats():expCats()).map(c=>c[0]),sc={};
  toks(text).forEach(w=>{const ws=[w,stem(w)];
    ws.forEach(x=>{const L=S.learn[x];if(L)for(const k in L)if(list.includes(k))sc[k]=(sc[k]||0)+3*L[k];});
    for(const k in KW){if(!list.includes(k))continue;if(KW[k].split(' ').some(kw=>ws.includes(kw)||(kw.length>3&&ws.some(x=>x.startsWith(kw)))))sc[k]=(sc[k]||0)+2;}
    S.customCats.forEach(c=>{if(list.includes(c.id)&&ws.includes(AR(c.name)))sc[c.id]=(sc[c.id]||0)+4;});});
  let best=null,bv=0;for(const k in sc)if(sc[k]>bv){bv=sc[k];best=k;}return best;}
function learnFrom(r){if(!r||r.type==='tr'||!r.note)return;if(Object.keys(S.learn).length>900)return;
  toks(r.note.replace(/🔁/g,'')).slice(0,4).forEach(w=>{w=stem(w);const L=S.learn[w]=S.learn[w]||{};L[r.cat]=(L[r.cat]||0)+1;});}
const NUMW={'عشره':10,'عشرين':20,'تلاتين':30,'اربعين':40,'خمسين':50,'ستين':60,'سبعين':70,'تمانين':80,'تسعين':90,'ميه':100,'ميت':100,'ميتين':200,'تلتميه':300,'ربعميه':400,'خمسميه':500,'ستميه':600,'سبعميه':700,'تمنميه':800,'تسعميه':900,'الف':1000,'الفين':2000};
const DROPW=/^(ب|بـ|ج|جم|جنيه|جنيهات|ك|k|الف|الاف|امبارح|النهارده|انهارده|دلوقتي)$/;
function parseQuick(raw){const r0=String(raw||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.').replace(/(\d),(\d{3})/g,'$1$2');let s=AR(r0),amount=0;
  const m=s.match(/(\d+(?:\.\d+)?)(?:\s*(k|الاف|الف|ك)(?=\s|$))?/);
  if(m){amount=parseFloat(m[1])*(m[2]?1000:1);s=s.replace(m[0],' ');}else{const ws=s.split(/\s+/);for(const w of ws){const x=w.replace(/^ب/,'');if(NUMW[x]){amount=NUMW[x];s=s.replace(w,' ');break;}}}
  let date=today();if(/اول امبارح/.test(s)){date=addDays(today(),-2);s=s.replace(/اول امبارح/,' ');}else if(/امبارح/.test(s)){date=addDays(today(),-1);s=s.replace(/امبارح/,' ');}
  const type=INC_RX.test(' '+s+' ')?'inc':'exp';const wsAll=r0.split(/\s+/);
  const note=wsAll.filter((w,i)=>{const a=AR(w).replace(/[^\u0621-\u064Aa-z0-9.]/g,'');if(!a)return false;if(DROPW.test(a)||NUMW[a]||NUMW[a.replace(/^ب/,'')]||/^ب?\d/.test(a))return false;if(a==='اول'&&AR(wsAll[i+1]||'')==='امبارح')return false;return true;}).join(' ').slice(0,60);
  const cat=guessCat(s,type)||(type==='inc'?(/مرتب|راتب|قبضت/.test(s)?'salary':'iother'):'other');
  return {type,amount,cat,note,date};}
function calcExpr(v){let s=String(v==null?'':v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,]/g,'.').replace(/×|x/gi,'*').replace(/÷/g,'/').replace(/\s/g,'');
  if(!/[+\-*/]/.test(s.replace(/^-/,'')))return num(s);if(!/^[\d.+\-*/()]+$/.test(s))return num(s);
  try{const r=Function('"use strict";return ('+s+')')();return isFinite(r)&&r>0?Math.round(r*100)/100:0;}catch(e){return 0;}}
function median(a){if(!a.length)return 0;a=a.slice().sort((x,y)=>x-y);const h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2;}
function unusual(r){if(r.type!=='exp')return 0;const from=addDays(today(),-120),a=S.tx.filter(t=>t.type==='exp'&&t.cat===r.cat&&t.date>=from&&t!==r&&t.id!==r.id).map(t=>t.amount);
  if(a.length<4)return 0;const md=median(a);return (r.amount>2.5*md&&r.amount-md>50)?md:0;}
function forecast(){const m=ym(today()),tx=monthTx(m),d=new Date().getDate(),dim=daysIn(m),t=today(),exp=sum(tx,'exp'),inc=sum(tx,'inc');
  const isRec=x=>/🔁$/.test(x.note||'');const fixed=tx.filter(x=>x.type==='exp'&&isRec(x)).reduce((a,x)=>a+x.amount,0),vari=exp-fixed;
  const upE=S.recurring.filter(r=>r.active&&r.type==='exp'&&r.next&&ym(r.next)===m&&r.next>t).reduce((a,r)=>a+r.amount,0);
  const upI=S.recurring.filter(r=>r.active&&r.type==='inc'&&r.next&&ym(r.next)===m&&r.next>t).reduce((a,r)=>a+r.amount,0);
  const recM=S.recurring.filter(r=>r.active&&r.type==='exp').reduce((s,r)=>s+monthlyOf(r),0),hist=Math.max(0,avgMonthlyExp()-recM),pace=vari/Math.max(d,3)*dim,al=Math.min(1,d/12),hasHist=[1,2,3].some(k=>sum(monthTx(prevYM(m,k)),'exp')>0);
  const proj=fixed+upE+(hasHist?al*pace+(1-al)*Math.max(vari,hist):pace),projInc=inc+upI,bc={};tx.forEach(x=>{if(x.type==='exp'&&!isRec(x))bc[x.cat]=(bc[x.cat]||0)+x.amount;});const warn=[];
  Object.keys(S.budgets).forEach(k=>{const b=S.budgets[k],sp=byCat(tx)[k]||0;if(sp>=b)return;const rate=(bc[k]||0)/d;if(rate>0&&d>=5){const day=Math.ceil((b-(sp-(bc[k]||0)))/rate);if(day<=dim&&day>d)warn.push([k,day]);}});
  return {proj,projInc,projSave:projInc-proj,warn,exp,inc,day:d,dim};}
function avgInc(){const m=ym(today());let s=0,c=0;for(let k=0;k<=3;k++){const i=sum(monthTx(prevYM(m,k)),'inc');if(i>0){s+=i;c++;}}return c?s/c:0;}
function avgSave(){const m=ym(today());let s=0,c=0;for(let k=1;k<=3;k++){const t=monthTx(prevYM(m,k)),i=sum(t,'inc');if(i>0){s+=i-sum(t,'exp');c++;}}if(!c){const f=forecast();return f.projInc>0?f.projSave:0;}return s/c;}
function health(){if(S.tx.length<3)return null;const m=ym(today());let inc=0,exp=0;for(let k=0;k<=2;k++){const t=monthTx(prevYM(m,k));inc+=sum(t,'inc');exp+=sum(t,'exp');}
  const P=[],cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const r=inc>0?(inc-exp)/inc:-1;P.push(['💰','نسبة التوفير',Math.round(cl(r/.2,0,1)*30),30,inc>0?Math.round(r*100)+'% من دخلك':'سجّل دخلك']);
  const av=avgMonthlyExp(),em=av>0?totalBal()/av:0;P.push(['🛟','صندوق الطوارئ',Math.round(cl(em/3,0,1)*20),20,em.toFixed(1)+' شهر مصاريف']);
  const bk=Object.keys(S.budgets),bc=byCat(monthTx(m));const ok=bk.filter(k=>(bc[k]||0)<=S.budgets[k]).length;P.push(['📊','الالتزام بالميزانية',bk.length?Math.round(ok/bk.length*15):5,15,bk.length?ok+' من '+bk.length+' بند تمام':'محطتش ميزانية']);
  const owe=S.debts.filter(d=>d.kind==='borrowed').reduce((a,d)=>a+Math.max(0,d.amount-d.paid),0),mi=inc/3||avgInc();const dr=mi>0?owe/mi:(owe?9:0);P.push(['🤝','الديون',Math.round(cl(1-dr/2,0,1)*15),15,owe?fmt(owe)+' عليك':'مفيش ديون عليك 👏']);
  const ds=new Set(S.tx.map(t=>t.date));let lg=0;for(let i=0;i<14;i++)if(ds.has(addDays(today(),-i)))lg++;P.push(['✍️','انتظام التسجيل',Math.round(lg/14*10),10,lg+' يوم من آخر 14']);
  const gs=S.goals.length?S.goals.reduce((a,g)=>a+Math.min(1,g.saved/g.target),0)/S.goals.length:0;P.push(['🎯','الأهداف',S.goals.length?Math.round(4+gs*6):0,10,S.goals.length?Math.round(gs*100)+'% متوسط التقدم':'حط هدف']);
  const sc=P.reduce((a,p)=>a+p[2],0);const g=sc>=80?['ممتاز','#16a34a']:sc>=60?['كويس','#65a30d']:sc>=40?['محتاج شغل','#d97706']:['خطر','#e11d48'];return {sc,P,g};}
function detectSubs(){const g={};S.tx.forEach(t=>{if(t.type!=='exp'||!t.note||/🔁$/.test(t.note))return;const k=AR(t.note).trim()+'|'+Math.round(t.amount);const o=g[k]=g[k]||{n:t.note,a:t.amount,cat:t.cat,w:t.wallet,ms:new Set(),last:t.date};o.ms.add(ym(t.date));if(t.date>o.last)o.last=t.date;});
  return Object.values(g).filter(x=>x.ms.size>=2&&!S.recurring.some(r=>AR(r.name)===AR(x.n))&&!S.dismissSubs.includes(AR(x.n))).slice(0,3);}
function afford(p,name){const bal=totalBal(),st=safeToday(),f=forecast(),ai=avgInc(),as=avgSave(),L=[];let v='ok';
  if(p>bal){v='no';L.push('❌ رصيدك كله '+fmt(bal)+' — مش هتقدر تشتريها دلوقتي من غير ما تستلف.');}
  else if(f.projInc>0&&f.projSave-p<0){v='warn';L.push('⚠️ لو اشتريتها هتخلّص الشهر بعجز حوالي '+fmt(p-f.projSave)+'.');}
  else if(st&&p<=st.left){L.push('✅ آه تقدر — في حدود المسموح بيه النهارده ('+fmt(st.left)+').');}
  else if(f.projInc>0){v='mid';L.push('🟡 تقدر، بس توفيرك المتوقع الشهر ده هيقل من '+fmt(f.projSave)+' لـ '+fmt(f.projSave-p)+'.');}
  else L.push('🟡 رصيدك يسمح ('+fmt(bal)+')، بس سجّل دخلك عشان أحسبهالك صح.');
  if(ai>0)L.push('⏱️ دي تساوي تقريبًا '+Math.max(1,Math.round(p/(ai/176)))+' ساعة شغل من وقتك.');
  const g=S.goals.find(x=>x.saved<x.target);if(g&&as>0)L.push('🎯 هتأخّر هدف «'+g.name+'» حوالي '+Math.max(1,Math.round(p/as*30))+' يوم.');
  if(p>=1000&&v!=='no')L.push('🧊 نصيحة: حطها في قائمة الأمنيات واستنى 30 يوم — لو لسه عايزها اشتريها وانت مرتاح.');
  else if(v!=='no')L.push('🧊 نصيحة: استنى يومين قبل ما تشتري — لو لسه عايزها يبقى تستاهل.');
  return {v,L};}
// ---------- 💬 المساعد
function periodOf(a){const t=today(),m=ym(t);
  if(/النهارده|انهارده|اليوم/.test(a))return [t,t,'النهارده'];if(/اول امبارح/.test(a)){const d=addDays(t,-2);return [d,d,'أول امبارح'];}if(/امبارح/.test(a)){const d=addDays(t,-1);return [d,d,'امبارح'];}
  if(/الاسبوع اللي فات|الاسبوع الماضي/.test(a))return [addDays(t,-13),addDays(t,-7),'الأسبوع اللي فات'];if(/الاسبوع|اسبوع|7 ايام/.test(a))return [addDays(t,-6),t,'آخر 7 أيام'];
  if(/الشهر اللي فات|الشهر الماضي|الشهر الي فات/.test(a)){const p=prevYM(m);return [p+'-01',p+'-'+pad(daysIn(p)),'الشهر اللي فات'];}
  if(/السنه|سنه/.test(a)){const y=t.slice(0,4);return [y+'-01-01',t,'السنة دي'];}
  for(let i=0;i<12;i++)if(a.includes(AR(MONTHS[i]))){const y=+t.slice(0,4)-((i+1)>+t.slice(5,7)?1:0),mm=y+'-'+pad(i+1);return [mm+'-01',mm+'-'+pad(daysIn(mm)),MONTHS[i]];}
  return [m+'-01',t,'الشهر ده'];}
function answer(q){const a=' '+AR(q)+' ',T=S.tx;if(!a.trim())return 'اكتب سؤالك 🙂';
  const n=(a.match(/(\d+(?:\.\d+)?)\s*(k|الف|ك)?/)||[]);const N=n[1]?parseFloat(n[1])*(n[2]?1000:1):0;
  if(/(اهلا|هاي|السلام|ازيك|صباح|مساء)/.test(a)&&a.length<20)return 'أهلًا بيك 👋 أنا تحويشة، اسألني عن مصاريفك أو رصيدك أو لو تقدر تشتري حاجة.';
  if(N&&/(اقدر|ينفع|اشتري|هشتري|اجيب|اشتري)/.test(a)){const r=afford(N);return r.L.join('\n');}
  if(/(صحه|سكور|تقييم|درجه|حالتي الماليه|وضعي)/.test(a)){const h=health();if(!h)return 'سجّل كام عملية الأول وأنا أقيّملك وضعك 📊';return 'درجتك المالية: '+h.sc+'/100 — '+h.g[0]+'\n'+h.P.map(p=>p[0]+' '+p[1]+': '+p[2]+'/'+p[3]+' ('+p[4]+')').join('\n');}
  if(/(توقع|اخر الشهر|نهايه الشهر|هقفل)/.test(a)){const f=forecast();return '🔮 بالمعدّل ده هتصرف حوالي '+fmt(f.proj)+' الشهر ده'+(f.projInc>0?' وهتوفّر '+fmt(f.projSave)+(f.projSave<0?' (يعني عجز ⚠️)':' ✅'):'')+'.'+(f.warn.length?'\n'+f.warn.map(w=>'⚠️ هتعدّي ميزانية '+cat(w[0])[1]+' يوم '+w[1]).join('\n'):'');}
  if(/(هدف|اهداف|هوصل|احوش|احوش)/.test(a)){if(!S.goals.length)return 'لسه مفيش أهداف — ضيف هدف من «المزيد ← الأهداف» 🎯';const as=avgSave();
    return S.goals.map(g=>{const r=g.target-g.saved;if(r<=0)return '✅ '+g.name+': خلصته 🎉';let s='🎯 '+g.name+': فاضل '+fmt(r);if(g.deadline){const mo=Math.max(1,Math.ceil(diffDays(today(),g.deadline)/30));s+=' — محتاج '+fmt(r/mo)+' في الشهر عشان تلحق ميعادك';}else if(as>0)s+=' — بتوفيرك الحالي هتوصل خلال ~'+Math.ceil(r/as)+' شهر';return s;}).join('\n');}
  if(/(دين|ديون|سلف|عليا|ليا|مديون)/.test(a)){const o=S.debts.filter(d=>d.paid<d.amount);if(!o.length)return 'مفيش ديون مفتوحة 👏';const b=o.filter(d=>d.kind==='borrowed'),l=o.filter(d=>d.kind!=='borrowed');const rs=x=>x.reduce((s,d)=>s+d.amount-d.paid,0);
    return '❤️ عليك: '+fmt(rs(b))+(b.length?' ('+b.map(d=>d.person).join('، ')+')':'')+'\n💚 ليك: '+fmt(rs(l))+(l.length?' ('+l.map(d=>d.person).join('، ')+')':'');}
  if(/(اشتراك|اشتراكات|متكرر|ثابت)/.test(a)){const r=S.recurring.filter(x=>x.active&&x.type==='exp');if(!r.length)return 'مفيش مصاريف متكررة متسجلة.';const tot=r.reduce((s,x)=>s+monthlyOf(x),0);return '🔁 مصاريفك الثابتة '+fmt(tot)+' في الشهر ('+fmt(tot*12)+' في السنة):\n'+r.map(x=>'• '+x.name+' '+fmt(x.amount)).join('\n');}
  if(/(نصيحه|نصايح|اوفر|ازاي|ساعدني)/.test(a)){const tp=tips(ym(today()));return tp.slice(0,3).map(t=>t[0]+' '+t[1]).join('\n\n')||'كمّل كده 👏';}
  const pr=periodOf(a),inP=t=>t.date>=pr[0]&&t.date<=pr[1];
  if(/(اكتر|اعلي|فين فلوسي|بتروح فين|بصرف علي ايه)/.test(a)){const bc=byCat(T.filter(inP)),ks=Object.keys(bc).sort((x,y)=>bc[y]-bc[x]).slice(0,5);if(!ks.length)return 'مفيش مصاريف في '+pr[2]+'.';const tot=Object.values(bc).reduce((s,v)=>s+v,0);return '📊 أكتر حاجات صرفت عليها ('+pr[2]+'):\n'+ks.map((k,i)=>(i+1)+'. '+cat(k)[2]+' '+cat(k)[1]+' — '+fmt(bc[k])+' ('+Math.round(bc[k]/tot*100)+'%)').join('\n');}
  if(/(رصيد|معايا|فاضل|متبقي|فلوسي كام)/.test(a)){const st=safeToday();return '👛 رصيدك الكلي: '+fmt(totalBal())+(S.wallets.length>1?'\n'+S.wallets.map(w=>w.emoji+' '+w.name+': '+fmt(walletBal(w.id))).join('\n'):'')+(st?'\n💸 تقدر تصرف النهارده: '+fmt(Math.max(0,st.left)):'');}
  if(/(دخلي|قبضت|دخل|كسبت)/.test(a)){const x=T.filter(t=>t.type==='inc'&&inP(t));return '⬆️ دخلك في '+pr[2]+': '+fmt(sum(x,'inc'))+' ('+x.length+' عملية)';}
  if(/(صرفت|مصاريف|مصروف|دفعت|كام)/.test(a)){const c=guessCat(a.replace(/صرفت|مصاريف|مصروفات|دفعت|كام|علي/g,' '),'exp');const x=T.filter(t=>t.type==='exp'&&inP(t)&&(!c||t.cat===c));const s=sum(x,'exp');
    let r='⬇️ صرفت '+(c?'على '+cat(c)[2]+' '+cat(c)[1]+' ':'')+'في '+pr[2]+': '+fmt(s)+' ('+x.length+' عملية)';if(x.length){const mx=x.reduce((p,t)=>t.amount>p.amount?t:p);r+='\n📌 أكبر عملية: '+fmt(mx.amount)+(mx.note?' — '+mx.note:'')+' ('+dName(mx.date)+')';}
    if(/الشهر ده/.test(pr[2])&&(!c||new Date().getDate()>=7)){const f=forecast();r+='\n🔮 متوقع توصل لـ '+fmt(c?s/f.day*f.dim:f.proj)+' آخر الشهر';}return r;}
  return '🤔 مفهمتش قوي. جرّب تسألني:\n• صرفت كام على الأكل الشهر ده؟\n• أقدر أشتري موبايل بـ 8000؟\n• رصيدي كام؟\n• هوصل لهدفي امتى؟\n• توقع آخر الشهر\n• حالتي المالية\n• بصرف على إيه أكتر؟';}
const chat=[];
function chatHTML(){return chat.map(m=>'<div class="msg '+m[0]+'">'+esc(m[1]).replace(/\n/g,'<br>')+'</div>').join('')||'<div class="msg bot">أهلًا 👋 أنا تحويشة — اسألني أي حاجة عن فلوسك، وكل ده بيتحسب على جهازك من غير نت.</div>';}
function askSheet(){const Q=['صرفت كام الشهر ده؟','بصرف على إيه أكتر؟','رصيدي كام؟','أقدر أشتري حاجة بـ 2000؟','توقع آخر الشهر','حالتي المالية','هوصل لهدفي امتى؟','ديوني'];
  openSheet('<h3 class="hx">💬 اسأل تحويشة <button class="ibtn" data-a="close" aria-label="إغلاق">✕</button></h3><div class="chat" id="chat">'+chatHTML()+'</div><div class="qchips">'+Q.map(q=>'<button data-a="askChip" data-q="'+esc(q)+'">'+esc(q)+'</button>').join('')+'</div><div class="qrow"><input class="inp" id="askIn" placeholder="اكتب سؤالك…" autocomplete="off"><button class="btn qgo" data-a="ask" aria-label="إرسال">➤</button></div>');
  const c=$('chat');if(c)c.scrollTop=1e6;}
function doAsk(q){q=String(q||'').trim();if(!q)return;chat.push(['me',q]);chat.push(['bot',answer(q)]);if(chat.length>40)chat.splice(0,2);const c=$('chat');if(c){c.innerHTML=chatHTML();c.scrollTop=1e6;}const i=$('askIn');if(i){i.value='';}haptic();}
function affordSheet(){openSheet('<h3>🤔 أقدر أشتريها؟</h3><p class="note">اكتب السعر وأنا أحسبلك تأثيرها على شهرك وأهدافك.</p>'+F('afN','بتفكر تشتري إيه؟','maxlength="40" placeholder="مثلاً: سماعة"')+F('afP','السعر','class="inp amt" inputmode="decimal" placeholder="0"')+'<div id="afR"></div><div class="acts"><button class="btn" data-a="affordGo">احسبها</button><button class="btn sec" data-a="close">إغلاق</button></div>');}
// ---------- 🏠 كروت ذكية
function quickBar(){return '<div class="card qa"><div class="qrow"><input class="inp" id="qIn" placeholder="✨ اكتب بسرعة: غدا 85 · قبضت 8000 · بنزين 300 امبارح" autocomplete="off" enterkeyhint="done">'+(SR?'<button class="ibtn mic" data-a="mic" aria-label="سجّل بصوتك">🎤</button>':'')+'<button class="btn qgo" data-a="quick" aria-label="سجّل">➕</button></div><div class="qprev" id="qPrev"></div></div>';}
function smartCard(){const h=health(),cm=curYM()===ym(today());let s='<div class="card brain"><h2>🧠 تحليل ذكي <button class="btn sec sm" data-a="askOpen">💬 اسألني</button></h2>';
  if(h)s+='<div class="hs" data-a2="health"><div class="ring" style="--p:'+h.sc+';--c:'+h.g[1]+'"><b>'+h.sc+'</b></div><div><div class="t">درجتك المالية: <b style="color:'+h.g[1]+'">'+h.g[0]+'</b></div><div class="note">'+h.P.slice().sort((a,b)=>a[2]/a[3]-b[2]/b[3])[0].slice(0,2).join(' ')+' هو أكتر حاجة محتاجة شغل</div><button class="btn sec sm" data-a="healthOpen">التفاصيل</button></div></div>';
  if(cm&&S.tx.length){const f=forecast();if(f.exp>0)s+='<div class="tip"><span class="e">🔮</span><div>متوقع تصرف <b>'+fmt(f.proj)+'</b> الشهر ده'+(f.projInc>0?'، وتوفّر <b class="'+(f.projSave<0?'neg':'pos')+'">'+fmt(f.projSave)+'</b>':'')+'.</div></div>';
    f.warn.slice(0,2).forEach(w=>{s+='<div class="tip"><span class="e">⚠️</span><div>بالمعدّل ده هتعدّي ميزانية '+cat(w[0])[2]+' '+esc(cat(w[0])[1])+' يوم <b>'+w[1]+'</b> — هدّي شوية.</div></div>';});}
  detectSubs().forEach(x=>{s+='<div class="tip"><span class="e">🔁</span><div>«'+esc(x.n)+'» بـ '+fmt(x.a)+' بتتكرر كل شهر. أخليها تتسجّل لوحدها؟<div class="acts2"><button class="btn sm" data-a="subAdd" data-n="'+esc(x.n)+'">آه</button><button class="btn sec sm" data-a="subNo" data-n="'+esc(x.n)+'">لأ</button></div></div></div>';});
  s+='<div class="acts2"><button class="btn sec sm" data-a="affordOpen">🤔 أقدر أشتريها؟</button></div>';
  return s+'</div>';}
function homeV3(){let h=vHome();const i=h.indexOf('<div class="stats">');const sc=smartCard();h=i>=0?h.slice(0,i)+sc+h.slice(i):h+sc;
  if(!S.set.gHint)h='<div class="banner ok gh">👆 <div><b>جديد!</b> اسحب يمين/شمال تتنقل بين الصفحات · اسحب العملية شمال تمسحها ويمين تعدّلها · دوس مطوّل للمزيد · زرار الرجوع بتاع الموبايل شغال · دبل كليك على الرصيد يخفي الأرقام</div><button data-a="ghOk">تمام</button></div>'+h;
  return quickBar()+h;}
function repV3(){let h='';const m=curYM(),tx=monthTx(m),exp=sum(tx,'exp');
  if(S.tx.length){const from=addDays(today(),-90),wd=[0,0,0,0,0,0,0],wc=[0,0,0,0,0,0,0];for(let i=0;i<91;i++){const d=addDays(today(),-i);if(d<firstDate())break;wc[new Date(d+'T12:00').getDay()]++;}
    S.tx.forEach(t=>{if(t.type==='exp'&&t.date>=from)wd[new Date(t.date+'T12:00').getDay()]+=t.amount;});const av=wd.map((v,i)=>wc[i]?v/wc[i]:0),mx=av.indexOf(Math.max(...av));
    h+='<div class="card"><h2>📆 بتصرف أكتر إمتى؟ <small>آخر 3 شهور</small></h2><canvas id="cWd" height="150"></canvas>'+(av[mx]>0?'<p class="note">أغلى يوم عندك: <b>'+DAYS[mx]+'</b> (متوسط '+fmt(av[mx])+') — خطّط له من بدري.</p>':'')+'</div>';
    const ins=[];const bc=byCat(tx),top=Object.keys(bc).sort((a,b)=>bc[b]-bc[a])[0];if(top)ins.push(['✂️','لو قلّلت '+cat(top)[1]+' 10% بس، هتوفّر '+fmt(bc[top]*.1*12)+' في السنة.']);
    const odd=tx.filter(t=>t.type==='exp').map(t=>[t,unusual(t)]).filter(x=>x[1]).slice(0,3);odd.forEach(x=>ins.push(['😮',fmt(x[0].amount)+' على '+cat(x[0].cat)[1]+(x[0].note?' ('+x[0].note+')':'')+' — أعلى بكتير من المعتاد ('+fmt(x[1])+').']));
    const wds=toks(tx.filter(t=>t.type==='exp').map(t=>t.note.replace(/🔁/g,'')).join(' ')).map(stem),fr={};wds.forEach(w=>fr[w]=(fr[w]||0)+1);const fw=Object.keys(fr).sort((a,b)=>fr[b]-fr[a])[0];
    if(fw&&fr[fw]>=3){const tt=tx.filter(t=>t.type==='exp'&&toks(t.note).map(stem).includes(fw)).reduce((a,t)=>a+t.amount,0);ins.push(['🔎','«'+fw+'» اتكررت '+fr[fw]+' مرة الشهر ده بإجمالي '+fmt(tt)+'.']);}
    const sm=tx.filter(t=>t.type==='exp'&&t.amount<50);if(sm.length>=5)ins.push(['🪙','المصاريف الصغيرة (أقل من 50) عددها '+sm.length+' وإجماليها '+fmt(sum(sm,'exp'))+' — الصغير بيتجمع!']);
    if(cm3())ins.push(cm3());
    if(ins.length)h='<div class="card"><h2>🧠 تحليلات ذكية</h2>'+ins.map(t=>'<div class="tip"><span class="e">'+t[0]+'</span><div>'+esc(t[1])+'</div></div>').join('')+'</div>'+h;}
  return vRep()+h;}
function cm3(){const f=forecast();if(f.projInc>0&&curYM()===ym(today())){const r=f.projSave/f.projInc;if(r>=.2)return ['🏆','بالمعدّل ده هتوفّر '+Math.round(r*100)+'% من دخلك — أداء ممتاز!'];if(r<0)return ['🚨','الشهر ده ماشي ناحية عجز '+fmt(-f.projSave)+' — وقّف الكماليات.'];}return null;}
function drawWd(){const cv=$('cWd');if(!cv||!window.Charts)return;const from=addDays(today(),-90),wd=[0,0,0,0,0,0,0],wc=[0,0,0,0,0,0,0];for(let i=0;i<91;i++){const d=addDays(today(),-i);if(d<firstDate())break;wc[new Date(d+'T12:00').getDay()]++;}
  S.tx.forEach(t=>{if(t.type==='exp'&&t.date>=from)wd[new Date(t.date+'T12:00').getDay()]+=t.amount;});const order=[6,0,1,2,3,4,5];const av=order.map(i=>wc[i]?wd[i]/wc[i]:0),mx=Math.max(...av);
  window.Charts.bars(cv,av.map(v=>[[v,v===mx&&v>0?'#e11d48':'#14b8a6']]),i=>DAYS[order[i]].replace('ال',''));}
function moreV3(){return '<div class="card smartbox"><button data-a="askOpen"><span>💬</span>اسأل تحويشة<small>مساعد ذكي أوفلاين</small></button><button data-a="affordOpen"><span>🤔</span>أقدر أشتريها؟<small>قرار شرا ذكي</small></button><button data-a="healthOpen"><span>❤️‍🩹</span>درجتك المالية<small>من 100</small></button><button data-a="gestures"><span>👆</span>الإيماءات<small>اسحب ودوس مطوّل</small></button></div>'+vMore();}
function setV3(){const s=S.set,tg=(a,on,l)=>'<button data-a="'+a+'" aria-pressed="'+!!on+'">'+l+'</button>';
  return vSet().replace('<div class="card"><h2>🧪 أخرى','<div class="card"><h2>👆 الإيماءات والاهتزاز</h2><div class="seg">'+tg('togSwipe',s.swipe,'👆 السحب '+(s.swipe?'شغال':'مقفول'))+tg('togHaptic',s.haptic,'📳 الاهتزاز '+(s.haptic?'شغال':'مقفول'))+'</div><p class="note">زرار/إيماءة الرجوع في الموبايل: بيقفل النافذة المفتوحة ← يرجع للصفحة اللي قبلها ← للرئيسية ← ولو دوست تاني بسرعة يخرج.</p><button class="btn sec sm" data-a="gestures">📖 دليل الإيماءات</button></div><div class="card"><h2>🧪 أخرى');}
VIEWS.home[1]=homeV3;VIEWS.rep[1]=repV3;VIEWS.more[1]=moreV3;VIEWS.set[1]=setV3;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const haptic=ms=>{try{if(S.set.haptic!==false&&navigator.vibrate)navigator.vibrate(ms||10);}catch(e){}};
Object.assign(A,{
 quick:()=>{const i=$('qIn');if(!i)return;const p=parseQuick(i.value);if(!p.amount){toast('اكتب المبلغ — مثلاً: غدا 85');i.focus();return;}
   const r={id:uid(),ts:Date.now(),type:p.type,amount:p.amount,cat:p.cat,wallet:S.wallets[0].id,note:p.note,date:p.date};S.tx.push(r);learnFrom(r);save();haptic(15);
   const u=unusual(r);render();toast((p.type==='inc'?'⬆️ ':'⬇️ ')+cat(p.cat)[2]+' '+cat(p.cat)[1]+' · '+fmt(p.amount)+(u?' · 😮 أعلى من المعتاد':''),'تراجع',()=>{S.tx=S.tx.filter(x=>x.id!==r.id);save();render();});},
 mic:()=>{if(!SR){toast('المتصفح مش بيدعم الصوت');return;}try{const r=new SR();r.lang='ar-EG';r.interimResults=false;r.onresult=e=>{const t=e.results[0][0].transcript;const i=$('qIn');if(i){i.value=t;i.dispatchEvent(new Event('input',{bubbles:true}));}};r.onerror=()=>toast('🎤 مقدرتش أسمعك — الصوت ممكن يحتاج نت');r.start();toast('🎤 اتكلم… مثلاً: «غدا خمسين جنيه»');haptic(20);}catch(e){toast('🎤 الصوت مش متاح');}},
 askOpen:()=>askSheet(),ask:()=>doAsk(($('askIn')||{}).value),askChip:b=>doAsk(b.dataset.q),
 affordOpen:()=>affordSheet(),
 affordGo:()=>{const p=calcExpr($('afP').value),n=$('afN').value.trim();if(!p){toast('اكتب السعر');return;}const r=afford(p,n);const col={ok:'ok',mid:'wk',warn:'bad',no:'bad'}[r.v];
   $('afR').innerHTML='<div class="banner '+col+'" style="display:block">'+r.L.map(esc).join('<br>')+'</div><div class="acts2"><button class="btn sec sm" data-a="afWish">🛒 حطها في الأمنيات</button><button class="btn sm" data-a="afBuy">اشتريتها — سجّلها</button></div>';haptic();},
 afWish:()=>{const p=calcExpr($('afP').value),n=$('afN').value.trim()||'حاجة نفسي فيها';const w={id:uid(),name:n,emoji:'✨',price:p,added:today()};S.wish.push(w);save();closeSheet();render();toast('🛒 اتحطت في الأمنيات — استنى '+wishWait(w)+' يوم');},
 afBuy:()=>{const p=calcExpr($('afP').value),n=$('afN').value.trim();addSheet({type:'exp',amount:p,note:n,cat:guessCat(n,'exp')||'shop'});},
 healthOpen:()=>{const h=health();if(!h){toast('سجّل كام عملية الأول');return;}openSheet('<h3>❤️‍🩹 درجتك المالية</h3><div class="hs"><div class="ring big" style="--p:'+h.sc+';--c:'+h.g[1]+'"><b>'+h.sc+'</b></div><div class="t">'+h.g[0]+'<div class="note">محسوبة من آخر 3 شهور</div></div></div>'+h.P.map(p=>'<div class="item"><div class="row"><span class="n">'+p[0]+' '+p[1]+'</span><span class="chip">'+p[2]+'/'+p[3]+'</span></div><div class="s">'+esc(p[4])+'</div>'+bar(p[2]/p[3]*100)+'</div>').join('')+'<button class="btn sec" data-a="close" style="margin-top:12px">تمام</button>');},
 subAdd:b=>{const x=detectSubs().find(s=>s.n===b.dataset.n);if(!x)return;const r={id:uid(),type:'exp',name:x.n,amount:x.a,cat:x.cat,wallet:x.w||S.wallets[0].id,freq:'monthly',day:+x.last.slice(8,10),active:true};r.next=nextDue(r,addDays(today(),1));S.recurring.push(r);save();render();toast('🔁 تمام — هتتسجّل لوحدها كل شهر');},
 subNo:b=>{S.dismissSubs.push(AR(b.dataset.n));save();render();},
 ghOk:()=>{S.set.gHint=true;save();render();},
 togSwipe:()=>{S.set.swipe=!S.set.swipe;save();render();toast(S.set.swipe?'👆 السحب اشتغل':'السحب اتقفل');},
 togHaptic:()=>{S.set.haptic=!S.set.haptic;save();render();haptic(30);},
 gestures:()=>openSheet('<h3>👆 دليل الإيماءات</h3>'+[['↔️','اسحب يمين أو شمال في الصفحات الرئيسية عشان تتنقل بينها'],['⬅️','في أي صفحة فرعية: اسحب بالعرض عشان ترجع'],['🔙','زرار/إيماءة الرجوع في الموبايل: بيقفل النافذة ← يرجع ← للرئيسية ← دوستين ورا بعض = خروج'],['👈','اسحب أي عملية لشمال = حذف (وتقدر تتراجع)'],['👉','اسحب أي عملية ليمين = تعديل'],['✋','دوس مطوّل على عملية = تعديل، تكرار، قالب، حذف'],['⬇️','اسحب أي نافذة لتحت عشان تقفلها'],['👆👆','دبل كليك على الرصيد = إخفاء/إظهار الأرقام (خصوصية)'],['🎤','سجّل مصروف بصوتك من الشريط السريع'],['🧮','في خانة المبلغ تقدر تكتب عملية حسابية زي 45+30+12']].map(t=>'<div class="tip"><span class="e">'+t[0]+'</span><div>'+t[1]+'</div></div>').join('')+'<button class="btn" data-a="close" style="margin-top:12px">تمام</button>'),
 lpEdit:b=>{closeSheet();A.txEdit(b);},
 lpDup:b=>{const t=S.tx.find(x=>x.id===b.dataset.id);if(!t)return;const c=Object.assign({},t,{id:uid(),ts:Date.now(),date:today()});S.tx.push(c);save();closeSheet();render();toast('📄 اتكررت النهارده','تراجع',()=>{S.tx=S.tx.filter(x=>x.id!==c.id);save();render();});},
 lpTpl:b=>{const t=S.tx.find(x=>x.id===b.dataset.id);if(!t)return;S.templates.push({id:uid(),type:t.type,cat:t.cat,amount:t.amount,note:t.note,wallet:t.wallet});save();closeSheet();toast('⭐ اتحفظت كقالب سريع');},
 lpDel:b=>{closeSheet();A.txDel(b);},
 hideToggle:()=>{S.set.hide=!S.set.hide;save();render();haptic(15);toast(S.set.hide?'🙈 الأرقام مخفية':'👁 الأرقام ظاهرة');}
});
function lpSheet(id){const t=S.tx.find(x=>x.id===id);if(!t)return;haptic(35);const c=t.type==='tr'?['','تحويل','🔄']:cat(t.cat);
  openSheet('<h3>'+c[2]+' '+esc(c[1])+' · '+fmt(t.amount)+'</h3><p class="note">'+dName(t.date)+(t.note?' · '+esc(t.note):'')+'</p><div class="lpm"><button data-a="lpEdit" data-id="'+id+'">✏️ تعديل</button><button data-a="lpDup" data-id="'+id+'">📄 كررها النهارده</button>'+(t.type!=='tr'?'<button data-a="lpTpl" data-id="'+id+'">⭐ احفظها قالب</button>':'')+'<button data-a="lpDel" data-id="'+id+'" class="dng">🗑 حذف</button></div><button class="btn sec" data-a="close">إلغاء</button>');}
// ---------- 🔙 زرار الرجوع
let guarded=false,exitT=0;
const sheetOn=()=>$('sheetBg').classList.contains('on');
function guard(){if(guarded||!window.history||!history.pushState)return;try{history.pushState({tw:1},'');guarded=true;}catch(e){}}
function backAction(){if(!$('lock').classList.contains('hidden'))return false;
  if(sheetOn()){closeSheet();return true;}
  if(view==='tx'&&ui.txDay){ui.txDay='';render();return true;}
  if(!MAIN.includes(view)){go('more');return true;}
  if(view!=='home'){go('home');return true;}
  return false;}
if(window.history&&history.replaceState){try{history.replaceState({tw:0},'');}catch(e){}guard();
  window.addEventListener('popstate',()=>{guarded=false;if(backAction()){haptic();guard();return;}
    toast('👋 اضغط رجوع تاني عشان تخرج');clearTimeout(exitT);exitT=setTimeout(()=>{exitT=0;guard();},2200);});}
document.addEventListener('click',()=>{if(!guarded){clearTimeout(exitT);exitT=0;guard();}},true);
if($('eyeBtn'))$('eyeBtn').onclick=()=>A.hideToggle();
// ---------- 👆 السحب والدوس المطوّل
let tS=null,lpT=0,lastTap=0;
const skipEl=el=>!!(el.closest&&el.closest('input,textarea,select,canvas,.tpls,.seg,.cats,.keypad,.chat,.qchips,.cal'));
document.addEventListener('touchstart',e=>{clearTimeout(lpT);if(e.touches.length!==1){tS=null;return;}const t=e.touches[0],el=e.target;
  const row=el.closest&&el.closest('.tx[data-id]');tS={x:t.clientX,y:t.clientY,t:Date.now(),row:row,inSheet:!!(el.closest&&el.closest('#sheet')),skip:skipEl(el),top:$('sheet').scrollTop<=0,kpi:!!(el.closest&&el.closest('.kpi.big'))};
  if(row&&!tS.inSheet)lpT=setTimeout(()=>{if(tS&&!tS.moved){tS.lp=1;lpSheet(row.dataset.id);}},560);},{passive:true});
document.addEventListener('touchmove',e=>{if(!tS)return;const t=e.touches[0],dx=t.clientX-tS.x,dy=t.clientY-tS.y;if(Math.abs(dx)>10||Math.abs(dy)>10){tS.moved=1;clearTimeout(lpT);}
  if(tS.inSheet){if(tS.top&&!tS.skip&&dy>0&&dy>Math.abs(dx)){const sh=$('sheet');sh.style.transition='none';sh.style.transform='translateY('+dy+'px)';tS.drag=1;}return;}
  if(S.set.swipe&&tS.row&&!tS.skip&&(tS.rowDrag||(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.4))){tS.rowDrag=1;const r=tS.row;r.style.transition='none';r.style.transform='translateX('+dx+'px)';r.classList.toggle('sw-del',dx<-30);r.classList.toggle('sw-edit',dx>30);}},{passive:true});
document.addEventListener('touchend',e=>{clearTimeout(lpT);if(!tS)return;const s=tS;tS=null;const t=e.changedTouches[0],dx=t.clientX-s.x,dy=t.clientY-s.y,dt=Date.now()-s.t,W=window.innerWidth||360;
  if(s.lp){e.preventDefault();return;}
  if(s.inSheet){const sh=$('sheet');sh.style.transition='';if(s.drag&&dy>110){haptic();closeSheet();}sh.style.transform='';return;}
  if(s.rowDrag){const r=s.row,id=r.dataset.id;r.style.transition='';r.style.transform='';r.classList.remove('sw-del','sw-edit');
    const TH=Math.min(W*.3,140);if(dx<-TH){haptic(25);A.txDel({dataset:{id:id}});}else if(dx>TH){haptic();A.txEdit({dataset:{id:id}});}return;}
  if(s.kpi&&!s.moved&&dt<300){const n=Date.now();if(n-lastTap<350){lastTap=0;e.preventDefault();A.hideToggle();return;}lastTap=n;}
  if(!S.set.swipe||s.skip||sheetOn()||Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.7||dt>800)return;
  if(MAIN.includes(view)){const j=MAIN.indexOf(view)+(dx>0?1:-1);if(j>=0&&j<MAIN.length){haptic();if(MAIN[j]==='tx')ui.txDay='';go(MAIN[j]);$('view').classList.remove('sl','sr');void $('view').offsetWidth;$('view').classList.add(dx>0?'sl':'sr');}}
  else if(Math.abs(dx)>90){haptic();go('more');}},{passive:false});
document.addEventListener('contextmenu',e=>{const r=e.target.closest&&e.target.closest('.tx[data-id]');if(r){e.preventDefault();lpSheet(r.dataset.id);}});
document.addEventListener('dblclick',e=>{if(e.target.closest&&e.target.closest('.kpi.big'))A.hideToggle();});
// ---------- ⌨️ ذكاء الإدخال
document.addEventListener('input',e=>{const t=e.target;
  if(t.id==='qIn'){const p=parseQuick(t.value),pv=$('qPrev');if(pv)pv.innerHTML=t.value.trim()?(p.amount?'هيتسجّل: '+cat(p.cat)[2]+' '+esc(cat(p.cat)[1])+' · <b class="'+(p.type==='inc'?'pos':'neg')+'">'+(p.type==='inc'?'+':'−')+fmt(p.amount)+'</b> · '+(p.date===today()?'النهارده':dName(p.date))+(p.note?' · '+esc(p.note):''):'✍️ اكتب المبلغ كمان'):'';}
  else if(t.id==='nN'&&nt.type!=='tr'&&!nt.catTouched&&!nt.edit){const g=guessCat(t.value,nt.type);const b=g&&$('sheet').querySelector('[data-a=ntCat][data-v="'+g+'"]');if(b&&nt.cat!==g){nt.cat=g;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));let hn=$('aiHint');if(!hn){hn=document.createElement('div');hn.id='aiHint';hn.className='qprev';t.parentNode.insertBefore(hn,t.nextSibling);}hn.textContent='🧠 اخترتلك «'+cat(g)[1]+'» تلقائي';}}
  else if(t.id==='nA'||t.id==='afP'){let hn=$(t.id+'Calc');const has=/[+\-*/×÷]/.test(t.value.replace(/^-/,''));if(has){if(!hn){hn=document.createElement('div');hn.id=t.id+'Calc';hn.className='qprev';t.parentNode.insertBefore(hn,t.nextSibling);}hn.textContent='🧮 = '+fmt(calcExpr(t.value));}else if(hn)hn.remove();}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target.id==='qIn'){e.preventDefault();A.quick();}else if(e.target.id==='askIn'){e.preventDefault();e.stopPropagation();A.ask();}},true);

// ---------- events
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b){if(e.target===$('sheetBg'))closeSheet();return;}
  if(b.dataset.tab){if(b.dataset.tab==='tx')ui.txDay='';go(b.dataset.tab);return;}
  if(b.dataset.go){go(b.dataset.go);return;}
  if(b.id==='fab'){addSheet({});return;}
  if(b.dataset.a&&A[b.dataset.a]){A[b.dataset.a](b);}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.calc)calcAll();if(t.id==='txQ'){ui.txQ=t.value;clearTimeout(A._q);A._q=setTimeout(()=>{const pos=t.selectionStart;render();const n=$('txQ');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(x){}}},250);}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.bud){const v=num(t.value);if(v)S.budgets[t.dataset.bud]=v;else delete S.budgets[t.dataset.bud];save();render();toast('✅ الميزانية اتحفظت');}
  else if(t.id==='txCat'){ui.txCat=t.value;render();}else if(t.id==='txWal'){ui.txWal=t.value;render();}
  else if(t.id==='rF')fillRec();
  else if(t.id==='sRem'){S.set.remind=t.value||'21:00';save();toast('⏰ التذكير الساعة '+S.set.remind);}
  else if(t.id==='sCur'){S.set.currency=t.value.trim()||'ج';save();toast('✅ اتحفظ');}
  else if(t.id==='sTgt'){S.set.saveTarget=Math.max(0,Math.min(90,Math.round(num(t.value))));save();render();toast('🎯 هدف التوفير '+S.set.saveTarget+'%');}
  else if(t.id==='c52b'){S.c52.base=num(t.value)||10;save();render();}
  else if(t.id==='impF'&&t.files[0]){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.tx))throw 0;if(!confirmIt('البيانات الحالية هتتبدل بالنسخة دي. موافق؟'))return;S=normalize(d);save();applyTheme();render();toast('✅ البيانات رجعت');}catch(x){toast('❌ الملف ده مش نسخة تحويشة');}};r.readAsText(t.files[0]);t.value='';}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();if(e.key==='Enter'&&$('sheetBg').classList.contains('on')&&e.target.tagName==='INPUT'){const s=$('sheet').querySelector('.acts .btn:not(.sec)');if(s){e.preventDefault();s.click();}}});
$('mPrev').onclick=()=>{cur.setMonth(cur.getMonth()-1);ui.txDay='';render();};
$('mNext').onclick=()=>{cur.setMonth(cur.getMonth()+1);ui.txDay='';render();};
$('back').onclick=()=>go('more');
$('themeBtn').onclick=()=>{const d=document.documentElement.dataset.theme==='dark';S.set.theme=d?'light':'dark';save();applyTheme();render();};
let rT;window.addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{if(view==='rep')drawRep();},200);});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(view==='set')render();});
// ---------- theme
const mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function applyTheme(){const t=S.set.theme==='auto'?(mq&&mq.matches?'dark':'light'):S.set.theme;document.documentElement.dataset.theme=t;const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#0b3d39':'#0f766e';}
if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(S.set.theme==='auto'){applyTheme();render();}});
// ---------- lock
function lockScreen(){if(!S.set.pin)return;let code='';const L=$('lock');L.classList.remove('hidden');
  const dots=()=>$('dots').querySelectorAll('i').forEach((d,i)=>d.classList.toggle('on',i<code.length));
  $('keypad').innerHTML=['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k?'<button data-k="'+k+'" aria-label="'+(k==='⌫'?'مسح':k)+'">'+k+'</button>':'<span></span>').join('');
  $('keypad').onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const k=b.dataset.k;if(k==='⌫')code=code.slice(0,-1);else if(code.length<4)code+=k;dots();
    if(code.length===4){if(hsh(code)===S.set.pin){L.classList.add('hidden');code='';}else{$('dots').classList.add('err');setTimeout(()=>{$('dots').classList.remove('err');code='';dots();},450);}}};dots();}
// ---------- reminders while open
setInterval(()=>{if(!S.set.notif||!('Notification' in window)||Notification.permission!=='granted')return;const n=new Date(),hm=pad(n.getHours())+':'+pad(n.getMinutes());
  if(hm===S.set.remind&&S.set.lastNotif!==today()&&!S.tx.some(t=>t.date===today())){S.set.lastNotif=today();save();try{new Notification('تحويشة 💰',{body:'متنساش تسجّل مصاريف النهارده!',icon:'icon-192.png'});}catch(e){}}},30000);
// ---------- boot
const hr=new Date().getHours();$('greet').textContent=(hr<12?'صباح الخير ☀️':'مساء الخير 🌙')+' — يلا نحوّش';
applyTheme();runRecurring();render();lockScreen();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
