const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>n.toLocaleString("vi-VN")+" VNĐ";
const say=(f,t,ok)=>{const n=$(".note",f);if(n){n.textContent=t;n.className="note"+(ok?" ok":"")}};
const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const nextDay=d=>{const x=new Date(d);x.setDate(x.getDate()+1);return x.toISOString().slice(0,10)};
const user=store.get("lux_user",null);

/* Chào người dùng trên thanh bên */
const who=$("#who");
if(who&&user){who.innerHTML=`Xin chào, <strong>${esc(user.name)}</strong> · <button type="button" class="link" id="out">Đăng xuất</button>`;$("#out").onclick=()=>{try{localStorage.removeItem("lux_user")}catch{}location.reload()}}

/* Form demo (trang Liên hệ) */
$$("form[data-demo]").forEach(f=>f.addEventListener("submit",e=>{e.preventDefault();say(f,f.dataset.demo,1);f.reset()}));

/* Form tìm phòng ở trang chủ */
const sf=$("#sf");
if(sf){const [vao,ra]=$$("input[type=date]",sf);vao.min=today;ra.min=nextDay(today);
vao.addEventListener("change",()=>{ra.min=nextDay(vao.value||today);if(ra.value&&ra.value<ra.min)ra.value=""})}

/* Banner trượt */
const sl=$$(".slides img"),dots=$$(".dots button");
if(sl.length){let i=0,t;const hero=$(".hero");
const go=n=>{i=(n+sl.length)%sl.length;sl.forEach((s,k)=>s.classList.toggle("on",k===i));dots.forEach((d,k)=>d.setAttribute("aria-current",k===i))};
const run=()=>{clearInterval(t);if(!matchMedia("(prefers-reduced-motion:reduce)").matches)t=setInterval(()=>go(i+1),5000)};
$(".arrow.l").onclick=()=>go(i-1);$(".arrow.r").onclick=()=>go(i+1);dots.forEach((d,k)=>d.onclick=()=>go(k));
hero.addEventListener("mouseenter",()=>clearInterval(t));hero.addEventListener("mouseleave",run);go(0);run()}

/* Thư viện: lọc + xem ảnh lớn */
const pills=$$(".pill"),lb=$("#lb");
pills.forEach(p=>p.addEventListener("click",()=>{pills.forEach(o=>o.setAttribute("aria-pressed",o===p));$$(".gal figure").forEach(g=>g.hidden=p.dataset.f!=="all"&&g.dataset.c!==p.dataset.f)}));
if(lb)$$(".gal figure").forEach(g=>{g.tabIndex=0;g.setAttribute("role","button");
const open=()=>{const im=$("img",g);$("img",lb).src=im.src;$("img",lb).alt=im.alt;$("#lbc").textContent=$("figcaption",g).textContent;lb.showModal()};
g.addEventListener("click",open);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}})});
$$("dialog").forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close()}));

/* Loại phòng: lọc, sắp xếp, phân trang, chi tiết, đặt phòng */
const list=$$(".room");
if(list.length){
const q=new URLSearchParams(location.search),khach=+q.get("khach")||0,vao0=q.get("vao")||"",ra0=q.get("ra")||"",PER=3;let page=1;
const flt=$("#flt"),sort=$("#sort"),pager=$("#pager"),rl=$("#rl"),dlg=$("#dlg"),body=$("#dbody"),E=flt.elements;
if(vao0&&ra0){const r=$("#result");r.hidden=false;r.textContent=`Tìm phòng${q.get("diadiem")?" tại "+q.get("diadiem"):""} từ ${vao0} đến ${ra0}${khach?" cho "+khach+" khách":""}.`}

const apply=()=>{
 const g=E.gia.value,v=E.view.checked,b=E.bf.checked,s=sort.value;
 const r=list.filter(e=>{const p=+e.dataset.price;return(g==="all"||(g==="mid"&&p>=1e6&&p<=2e6)||(g==="high"&&p>2e6))&&(!v||e.dataset.view==="1")&&(!b||e.dataset.bf==="1")&&(!khach||+e.dataset.cap>=khach)});
 if(s!=="new")r.sort((a,c)=>s==="asc"?a.dataset.price-c.dataset.price:c.dataset.price-a.dataset.price);
 const pages=Math.max(1,Math.ceil(r.length/PER));page=Math.min(page,pages);
 list.forEach(e=>e.hidden=true);
 r.slice((page-1)*PER,page*PER).forEach(e=>{e.hidden=false;rl.append(e)});
 $("#empty").hidden=r.length>0;say(flt,`${r.length} phòng phù hợp.`);
 pager.innerHTML=r.length?`<span>Phân trang:</span><button type="button" data-p="${page-1}" aria-label="Trang trước"${page===1?" disabled":""}>&lt;</button>`+Array.from({length:pages},(_,i)=>`<button type="button" data-p="${i+1}"${i+1===page?' aria-current="true"':""}>${i+1}</button>`).join("")+`<button type="button" data-p="${page+1}" aria-label="Trang sau"${page===pages?" disabled":""}>&gt;</button>`:""};
flt.addEventListener("submit",e=>{e.preventDefault();page=1;apply()});
flt.addEventListener("change",()=>{page=1;apply()});sort.addEventListener("change",()=>{page=1;apply()});
pager.addEventListener("click",e=>{const b=e.target.closest("button[data-p]");if(b&&!b.disabled){page=+b.dataset.p;apply();scrollTo(0,0)}});

const info=e=>({name:e.dataset.name,area:e.dataset.area,price:+e.dataset.price,cap:+e.dataset.cap,view:e.dataset.view==="1",bf:e.dataset.bf==="1",desc:e.dataset.desc,src:$("img",e).getAttribute("src")});
const detail=e=>{const r=info(e);
 body.innerHTML=`<img class="ph dimg" src="${r.src}" alt="Phòng ${esc(r.name)}"><h2 id="dt">${esc(r.name)}</h2><p>${esc(r.desc)}</p><ul class="chips"><li>${r.area}m2</li><li>Tối đa ${r.cap} khách</li>${r.view?"<li>View biển</li>":""}${r.bf?"<li>Gồm bữa sáng</li>":""}<li>Wifi miễn phí</li><li>Phục vụ 24/7</li></ul><p class="price">Giá: ${money(r.price)}/đêm</p><button type="button" class="btn" id="go">Đặt phòng</button>`;
 $("#go").onclick=()=>book(e);if(!dlg.open)dlg.showModal()};
const book=e=>{const r=info(e);
 body.innerHTML=`<h2 id="dt">Đặt ${esc(r.name)}</h2><form id="bk"><label for="b-ten">Họ và tên</label><input id="b-ten" required value="${esc(user?user.name:"")}"><label for="b-sdt">Số điện thoại</label><input id="b-sdt" type="tel" pattern="[0-9 +]{9,14}" title="Nhập 9-14 chữ số" required><div class="two"><div><label for="b-vao">Ngày nhận phòng</label><input id="b-vao" type="date" min="${today}" value="${vao0}" required></div><div><label for="b-ra">Ngày trả phòng</label><input id="b-ra" type="date" min="${today}" value="${ra0}" required></div></div><label for="b-k">Số khách (tối đa ${r.cap})</label><input id="b-k" type="number" min="1" max="${r.cap}" value="${Math.min(khach||1,r.cap)}" required><p class="note" id="tot" role="status"></p><button class="btn block">Xác nhận đặt phòng</button></form>`;
 const f=$("#bk"),nights=()=>Math.round((new Date($("#b-ra").value)-new Date($("#b-vao").value))/864e5);
 const upd=()=>{const n=nights();$("#tot").textContent=n>0?`${n} đêm · Tổng: ${money(n*r.price)}`:""};
 f.addEventListener("input",upd);upd();
 f.addEventListener("submit",ev=>{ev.preventDefault();const n=nights();
  if(!(n>0)){$("#tot").textContent="Ngày trả phòng phải sau ngày nhận phòng.";return}
  const bk={code:"LX-"+Math.random().toString(36).slice(2,8).toUpperCase(),room:r.name,ten:$("#b-ten").value.trim(),sdt:$("#b-sdt").value.trim(),vao:$("#b-vao").value,ra:$("#b-ra").value,khach:+$("#b-k").value,total:n*r.price};
  store.set("lux_bk",[bk,...store.get("lux_bk",[])]);
  body.innerHTML=`<h2 id="dt">Đặt phòng thành công</h2><p>Cảm ơn ${esc(bk.ten)}. Mã đặt phòng của bạn là <strong>${bk.code}</strong>.</p><p>${esc(bk.room)} · ${bk.vao} đến ${bk.ra} · ${bk.khach} khách</p><p class="price">Tổng: ${money(bk.total)}</p><p><small>Đây là bản demo: thông tin chỉ được lưu trên trình duyệt của bạn.</small></p><button type="button" class="btn" onclick="this.closest('dialog').close()">Đóng</button>`});
 if(!dlg.open)dlg.showModal()};
rl.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(b){const a=b.closest(".room");b.dataset.act==="book"?book(a):detail(a)}});
apply();const t=location.hash&&document.getElementById(location.hash.slice(1));if(t&&t.classList.contains("room"))detail(t)}

/* Tài khoản: đăng ký, đăng nhập (demo lưu trên trình duyệt), góp ý */
const tabs=$$("[role=tab]");
tabs.forEach(t=>t.addEventListener("click",()=>tabs.forEach(o=>{const on=o===t;o.setAttribute("aria-selected",on);document.getElementById(o.getAttribute("aria-controls")).hidden=!on})));
const hash=s=>{let x=5381;for(const c of s)x=(((x<<5)+x)^c.charCodeAt(0))>>>0;return x.toString(36)};
const lf=$("#p-login");
if(lf){const users=()=>store.get("lux_users",[]),rf=$("#p-reg");
 lf.addEventListener("submit",e=>{e.preventDefault();const id=$("#em").value.trim().toLowerCase(),u=users().find(x=>x.email===id||x.name.toLowerCase()===id);
  if(u&&u.pw===hash($("#mk").value)){store.set("lux_user",{name:u.name,email:u.email});say(lf,"Đăng nhập thành công, đang tải lại...",1);setTimeout(()=>location.reload(),600)}
  else say(lf,"Email/tên đăng nhập hoặc mật khẩu chưa đúng.")});
 rf.addEventListener("submit",e=>{e.preventDefault();const name=$("#rn").value.trim(),email=$("#re").value.trim().toLowerCase();
  if($("#rp").value!==$("#rq").value)return say(rf,"Mật khẩu nhập lại chưa khớp.");
  if(users().some(x=>x.email===email))return say(rf,"Email này đã được đăng ký.");
  store.set("lux_users",[...users(),{name,email,pw:hash($("#rp").value)}]);store.set("lux_user",{name,email});
  say(rf,"Đăng ký thành công, đang tải lại...",1);setTimeout(()=>location.reload(),600)})}
const fb=$("#fb");
if(fb){if(user)$("#gn").value=user.name;
 fb.addEventListener("submit",e=>{e.preventDefault();const st=fb.elements.sao.value;if(!st)return say(fb,"Vui lòng chọn số sao đánh giá.");
  store.set("lux_fb",[{name:$("#gn").value.trim(),stars:+st,text:$("#gc").value.trim(),date:today},...store.get("lux_fb",[])]);
  fb.reset();if(user)$("#gn").value=user.name;say(fb,"Cảm ơn bạn! Góp ý đã hiển thị ở trang Đánh giá.",1)})}
const mine=$("#mine"),bks=store.get("lux_bk",[]);
if(mine&&bks.length){mine.hidden=false;$("#mylist").innerHTML=bks.map(b=>`<li><strong>${esc(b.code)}</strong>: ${esc(b.room)}, ${b.vao} đến ${b.ra}, ${b.khach} khách, ${money(b.total)}</li>`).join("")}

/* Trang Đánh giá: hiển thị góp ý đã gửi */
const more=$("#more");
if(more)more.innerHTML=store.get("lux_fb",[]).map(f=>`<article class="box review"><div class="ava">${esc(f.name.charAt(0).toUpperCase())}</div><div><h3>${esc(f.name)}</h3><p>Đánh giá: <span class="stars" role="img" aria-label="${f.stars} trên 5 sao">${"★".repeat(f.stars)+"☆".repeat(5-f.stars)}</span> <small>${f.date}</small></p><blockquote>“${esc(f.text)}”</blockquote></div></article>`).join("");
