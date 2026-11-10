/* Demo-Admin: Gerichte hinzufügen, bearbeiten, löschen (LocalStorage) */
(function(){
 var M=KHMenu,$=function(s){return document.getElementById(s)};
 var items=M.load(),editId=null,img=null,tt;
 var SK='khb_admin_session';
 
 function toast(t){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){e.classList.remove('on')},2400)}
 function view(){var on=sessionStorage.getItem(SK)==='1';$('login').hidden=on;$('app').hidden=!on;if(on)render()}
 
 // Login (nur Demo)
 $('lf').addEventListener('submit',function(e){
  e.preventDefault();
  if($('lu').value.trim()==='admin'&&$('lp').value==='123'){sessionStorage.setItem(SK,'1');$('lerr').hidden=true;$('lp').value='';view()}
  else $('lerr').hidden=false;
 });
 $('logout').addEventListener('click',function(){sessionStorage.removeItem(SK);view()});
 
 // Liste
 function render(){
  var e=M.esc;
  $('list').innerHTML=items.length?items.map(function(x){
   return '<article class="item"><div class="thumb">'+(x.img?'<img src="'+e(x.img)+'" alt="'+e(x.n)+'" loading="lazy">':M.EMOJI[x.c]||'🥙')+'</div><div class="ib"><div class="it"><b>'+e(x.n)+'</b><span>'+M.fmt(x.p)+'</span></div><div class="cat">'+e(M.CATS[x.c]||x.c)+'</div><p>'+e(x.d)+'</p><div class="acts"><button class="btn btn-o sm" data-a="edit" data-id="'+e(x.id)+'">Bearbeiten</button><button class="btn btn-d sm" data-a="del" data-id="'+e(x.id)+'">Löschen</button></div></div></article>'
  }).join(''):'<p class="empty">Noch keine Gerichte. Füge dein erstes Gericht hinzu.</p>';
  $('list').querySelectorAll('img').forEach(function(i){i.onerror=function(){i.replaceWith(document.createTextNode('🥙'))}});
 }
 $('fc').innerHTML=Object.keys(M.CATS).map(function(k){return '<option value="'+k+'">'+M.CATS[k]+'</option>'}).join('');
 
 function commit(next,msg){
  try{M.save(next)}catch(err){return false}
  items=next;render();toast(msg);return true;
 }
 
 // Formular
 function open(x){
  editId=x?x.id:null;img=x&&x.img||null;
  $('dt').textContent=x?'Gericht bearbeiten':'Neues Gericht';
  $('fn').value=x?x.n:'';$('fd').value=x?x.d:'';
  $('fp').value=x?String(x.p.toFixed(2)).replace('.',','):'';
  $('fc').value=x?x.c:'doener';$('fi').value='';$('ferr').hidden=true;
  prev();$('dlg').showModal();$('fn').focus();
 }
 function prev(){var p=$('prev');if(img){p.src=img;p.hidden=false}else{p.removeAttribute('src');p.hidden=true}}
 $('add').addEventListener('click',function(){open(null)});
 $('cancel').addEventListener('click',function(){$('dlg').close()});
 $('list').addEventListener('click',function(e){
  var b=e.target.closest('button[data-a]');if(!b)return;
  var x=items.filter(function(i){return i.id===b.dataset.id})[0];if(!x)return;
  if(b.dataset.a==='edit')open(x);
  else if(confirm('„'+x.n+'“ wirklich löschen?'))commit(items.filter(function(i){return i!==x}),'Gericht gelöscht');
 });
 
 // Bild verkleinern, damit es in den LocalStorage passt
 $('fi').addEventListener('change',function(){
  var f=this.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){var im=new Image();
   im.onload=function(){
    var s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');
    c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
    var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
    img=c.toDataURL('image/jpeg',.8);prev();
   };
   im.onerror=function(){$('ferr').textContent='Das Bild konnte nicht gelesen werden.';$('ferr').hidden=false};
   im.src=r.result};
  r.readAsDataURL(f);
 });
 
 $('df').addEventListener('submit',function(e){
  e.preventDefault();
  var p=parseFloat($('fp').value.replace(',','.'));
  if(isNaN(p)||p<0){$('ferr').textContent='Bitte einen gültigen Preis eingeben, z. B. 7,50.';$('ferr').hidden=false;return}
  var d={id:editId||('d'+Date.now()),n:$('fn').value.trim(),d:$('fd').value.trim(),p:Math.round(p*100)/100,c:$('fc').value,img:img};
  var next=editId?items.map(function(i){return i.id===editId?d:i}):items.concat([d]);
  if(commit(next,editId?'Änderungen gespeichert':'Gericht hinzugefügt'))$('dlg').close();
  else{$('ferr').textContent='Speicher voll. Bitte ein kleineres Bild wählen.';$('ferr').hidden=false}
 });
 
 view();
})();
 