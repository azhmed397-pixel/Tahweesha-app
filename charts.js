/* تحويشة — رسوم بيانية بسيطة بدون مكتبات */
window.Charts=(function(){
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#888';}
  function setup(cv){var dpr=window.devicePixelRatio||1,w=cv.clientWidth||320,h=+cv.getAttribute('height');cv.width=w*dpr;cv.height=h*dpr;cv.style.height=h+'px';var c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c:c,w:w,h:h};}
  function rr(c,x,y,w,h,r){if(h<=0)return;r=Math.min(r,h,w/2);c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h);c.closePath();c.fill();}
  function donut(cv,data,label,sub){if(!cv)return;var s=setup(cv),c=s.c,w=s.w,h=s.h,tot=data.reduce(function(a,d){return a+d[0];},0),cx=w/2,cy=h/2,R=Math.min(w,h)/2-6,a=-Math.PI/2;
    data.forEach(function(d){var g=d[0]/tot*Math.PI*2;c.beginPath();c.arc(cx,cy,R,a,a+g);c.arc(cx,cy,R*.62,a+g,a,true);c.closePath();c.fillStyle=d[1];c.fill();c.strokeStyle=css('--card');c.lineWidth=2;c.stroke();a+=g;});
    c.textAlign='center';c.fillStyle=css('--mut');c.font='500 12px Tj,sans-serif';c.fillText(sub||'',cx,cy-10);c.fillStyle=css('--ink');c.font='800 18px Tj,sans-serif';c.fillText(label,cx,cy+14);}
  function bars(cv,groups,lab){if(!cv)return;var s=setup(cv),c=s.c,w=s.w,h=s.h,max=0;groups.forEach(function(g){g.forEach(function(b){max=Math.max(max,b[0]);});});
    var top=12,bot=22,ch=h-top-bot,n=groups.length,gw=w/n;c.strokeStyle=css('--line');c.lineWidth=1;
    for(var k=0;k<=3;k++){var y=top+ch*k/3;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    if(!max){c.fillStyle=css('--mut');c.font='500 13px Tj,sans-serif';c.textAlign='center';c.fillText('مفيش بيانات لسه',w/2,h/2);return;}
    groups.forEach(function(g,i){var bw=Math.max(2,Math.min(26,(gw*.72)/g.length)),x0=i*gw+(gw-bw*g.length)/2;
      g.forEach(function(b,j){var bh=b[0]/max*ch;c.fillStyle=b[1];rr(c,x0+j*bw+.5,top+ch-bh,bw-1,bh,4);});
      var L=lab(i);if(L){c.fillStyle=css('--mut');c.font='500 10px Tj,sans-serif';c.textAlign='center';c.fillText(L,i*gw+gw/2,h-6);}});
    c.fillStyle=css('--mut');c.font='500 10px Tj,sans-serif';c.textAlign='left';c.fillText(Math.round(max).toLocaleString('en-US'),2,top+9);}
  return {donut:donut,bars:bars,css:css};
})();
