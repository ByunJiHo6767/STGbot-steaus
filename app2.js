const IDH=['b57d7e5cc921449f61d69b6e6368d2f17b4799d7cb5be2d32c3bbf81e6b15dc8','d7106ac960aa5e3bd334c07c428247d740ae5e91a318c66f4949afa45b8c0b2b','05492158e10f2c35512f1085e3c96dd81be40d01d640584cf8c87fb107416033','ede4415bcbdbe0bd324049b71606939bbb9e0c7f4e85def28f95078f4d76efbd'];
const IA=['b57d7e5cc921449f61d69b6e6368d2f17b4799d7cb5be2d32c3bbf81e6b15dc8','ede4415bcbdbe0bd324049b71606939bbb9e0c7f4e85def28f95078f4d76efbd'];
const setLogin=()=>{$('login').innerHTML=ic('user')+'<span>'+(user||'STG 로그인')+'</span>';$('login').classList.toggle('on',!!user)};
const reloadChats=()=>{let sv=null;try{sv=JSON.parse(localStorage.getItem(ckey)||'null')}catch(e){}chats=sv&&sv.length?sv:[{m:[]}];cur=chats.length-1};
function openDlg(){
  const D=$('dlg'),b=el('div','bx'),close=el('button','o','닫기');D.innerHTML='';
  close.onclick=()=>D.classList.remove('on');
  if(user){
    const out=el('button','o','로그아웃');
    out.onclick=()=>{saveChats();user=null;ckey='stg-chats';try{localStorage.removeItem('stg-user')}catch(e){}reloadChats();setLogin();showChat();render();D.classList.remove('on');toast('로그아웃했어요')};
    b.append(el('h3',null,user),el('p',null,'로그인 중이에요. 대화는 이 아이디로 저장돼요.'),out,close);
  }else{
    const ii=el('input','inp'),g2=el('button','o','로그인');ii.placeholder='아이디';ii.autocomplete='off';ii.autocapitalize='none';
    const tryIt=async()=>{const id=ii.value.trim().toLowerCase();if(!id)return;let h='';try{h=await sha(id)}catch(e){toast('이 환경에서는 로그인을 확인할 수 없어요');return}
      if(!IDH.includes(h)){ii.value='';toast('등록되지 않은 아이디예요');return}
      saveChats();user=id;ckey='stg-chats:'+id;try{localStorage.setItem('stg-user',id)}catch(e){}
      reloadChats();setLogin();showChat();render();D.classList.remove('on');toast(id+' 로그인했어요')};
    g2.onclick=tryIt;ii.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)tryIt()};
    b.append(el('h3',null,'STG 로그인'),el('p',null,'받은 아이디를 입력하세요'),ii,g2,close);
  }
  D.appendChild(b);D.classList.add('on');
  const f=b.querySelector('input');if(f)f.focus();
}
$('login').onclick=openDlg;
$('dlg').onclick=e=>{if(e.target.id==='dlg')e.target.classList.remove('on')};
const MD={fire:{t:'quick',d:'빠름',v:'4.5'},copter:{t:'default',d:'기본',v:'5.0'},steaus:{t:'complex',d:'정밀',v:'6.0'}};
let model='copter';try{const m=localStorage.getItem('stg-model');if(MD[m])model=m}catch(e){}
const TH={low:{n:'하',e:'low'},medium:{n:'중',e:'medium'},high:{n:'높음',e:'high'},max:{n:'최대',e:'high'}};
let think='medium';try{const t=localStorage.getItem('stg-think');if(TH[t])think=t}catch(e){}
const setModel=()=>{$('mdl').innerHTML=ic('cpu')+'<span>'+model+' '+MD[model].v+' · '+TH[think].n+'</span>'};
function openModel(){const D=$('dlg'),b=el('div','bx');D.innerHTML='';
  b.append(el('h3',null,'AI 모델'));
  const row=(label,items,cur,pick)=>{const w=el('div','seg');
    items.forEach(([k,t])=>{const x=el('button','o'+(k===cur?' on':''),t);x.onclick=()=>{pick(k);setModel();openModel()};w.appendChild(x)});
    b.append(el('p',null,label),w)};
  row('모델',Object.keys(MD).map(k=>[k,k+' '+MD[k].v+' · '+MD[k].d]),model,k=>{model=k;try{localStorage.setItem('stg-model',k)}catch(e){}});
  row('생각하는 정도',Object.keys(TH).map(k=>[k,TH[k].n]),think,k=>{think=k;try{localStorage.setItem('stg-think',k)}catch(e){}});
  b.append(el('p',null,'최대: 이 화면에서는 가장 강한 모델과 높음을 합쳐 처리해요'));
  const c=el('button','o','닫기');c.onclick=()=>D.classList.remove('on');b.appendChild(c);
  D.appendChild(b);D.classList.add('on')}
$('mdl').onclick=openModel;setModel();
let codeMode=false;
const CODE_P='[코드 모드] 당신은 코딩 도우미입니다. 코드는 반드시 ```언어이름 코드 블록으로 쓰고, 코드 앞뒤 설명은 짧게 하세요. 코드를 직접 실행하거나 파일을 열 수는 없으니 실행 방법은 글로 알려 주세요.\n요청: ';
function speechText(t){return t.replace(/<svg[\s\S]*?(<\/svg>|$)/gi,'').replace(/```[\s\S]*?(```|$)/g,(typeof lang!=='undefined'&&lang!=='ko')?' See the code on screen. ':' 코드는 화면에서 확인하세요. ').trim()}
function codeBox(lg,code){const w=el('div','code'),h=el('div','ch2'),sp=el('span',null,lg||'code'),cb=el('button','ib');cb.innerHTML=ic('copy',16);cb.title='복사';
  cb.onclick=()=>copyText(code).then(()=>toast('코드를 복사했어요')).catch(()=>toast('복사할 수 없어요'));
  h.append(sp,cb);const pre=el('pre'),cd=el('code');cd.textContent=code;pre.appendChild(cd);w.append(h,pre);return w}
function fill(b,full,done){
  b.textContent='';
  const sm=done&&full.match(/<svg[\s\S]*?<\/svg>/i);
  if(sm){const i=document.createElement('img');i.alt='그림';i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sm[0]);b.appendChild(i);b.classList.add('has')}
  const t=full.replace(/```svg[\s\S]*?(```|$)/gi,'').replace(/<svg[\s\S]*?(<\/svg>|$)/gi,'');
  let any=false;
  t.split('```').forEach((p,i)=>{
    if(i%2===0){const x=p.trim();if(x){any=true;const d=el('div','tx');d.textContent=x;b.appendChild(d)}}
    else{any=true;const nl=p.indexOf('\n'),lg=nl<0?'':p.slice(0,nl).trim(),code=(nl<0?p:p.slice(nl+1)).replace(/\n$/,'');b.appendChild(codeBox(lg,code))}});
  if(!any&&!sm)b.textContent=/<svg/i.test(full)?'그리는 중…':'…';
}
function madeList(){const out=[];
  chats.forEach(c=>c.m.forEach(m=>{if(m.r!=='a'||!m.t)return;
    (m.t.match(/<svg[\s\S]*?<\/svg>/gi)||[]).forEach(s=>out.push({k:'img',s}));
    const t=m.t.replace(/```svg[\s\S]*?```/gi,''),re=/```([^\n`]*)\n([\s\S]*?)```/g;let x;
    while(x=re.exec(t))out.push({k:'code',lg:x[1].trim(),code:x[2].replace(/\n$/,'')})}));
  return out.reverse().slice(0,50)}
function openMade(){const D=$('dlg'),b=el('div','bx wide');D.innerHTML='';
  b.append(el('h3',null,'만든 것'));
  const L=madeList();
  if(!L.length)b.append(el('p',null,'아직 만든 것이 없어요. 그림이나 코드를 만들어 달라고 해 보세요.'));
  L.forEach(it=>{if(it.k==='img'){const i=document.createElement('img');i.alt='그림';i.className='mimg';i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(it.s);b.appendChild(i)}else b.appendChild(codeBox(it.lg,it.code))});
  const c=el('button','o','닫기');c.onclick=()=>D.classList.remove('on');b.appendChild(c);
  D.appendChild(b);D.classList.add('on')}
function madeList(all){const out=[];
  chats.forEach(c=>c.m.forEach(m=>{if(m.r!=='a'||!m.t)return;
    (m.t.match(/<svg[\s\S]*?<\/svg>/gi)||[]).forEach(s=>out.push({k:'img',s,raw:s,m}));
    const t=m.t.replace(/```svg[\s\S]*?```/gi,''),re=/```([^\n`]*)\n([\s\S]*?)```/g;let x;
    while(x=re.exec(t))out.push({k:'code',lg:x[1].trim(),code:x[2].replace(/\n$/,''),raw:x[0],m})}));
  out.reverse();return all?out:out.slice(0,50)}
function delMade(it){it.m.t=it.m.t.replace(it.raw,'');if(!it.m.t.trim())it.m.t='(삭제했어요)';render();openMade()}
function openMade(){const D=$('dlg'),b=el('div','bx wide');D.innerHTML='';
  b.append(el('h3',null,'만든 것'));
  const L=madeList();
  if(!L.length)b.append(el('p',null,'아직 만든 것이 없어요. 그림이나 코드를 만들어 달라고 해 보세요.'));
  L.forEach(it=>{const w=el('div','mitem'+(it.k==='code'?' c':''));
    if(it.k==='img'){const i=document.createElement('img');i.alt='그림';i.className='mimg';i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(it.s);w.appendChild(i)}else w.appendChild(codeBox(it.lg,it.code));
    const d=el('button','ib mdel');d.innerHTML=ic('trash',16);d.title='삭제';d.onclick=()=>delMade(it);w.appendChild(d);b.appendChild(w)});
  if(L.length){let arm=false;const a=el('button','o','모두 삭제');
    a.onclick=()=>{if(!arm){arm=true;a.textContent='정말 지울까요? 한 번 더 누르세요';return}
      const all=madeList(true);all.forEach(it=>{it.m.t=it.m.t.replace(it.raw,'')});all.forEach(it=>{if(!it.m.t.trim())it.m.t='(삭제했어요)'});render();openMade()};
    b.appendChild(a)}
  const c=el('button','o','닫기');c.onclick=()=>D.classList.remove('on');b.appendChild(c);
  D.appendChild(b);D.classList.add('on')}
$('made').onclick=openMade;
$('cmode').onclick=()=>{codeMode=!codeMode;$('cmode').classList.toggle('on',codeMode);if(codeMode&&resMode){resMode=false;setRes(false)}inp.placeholder=codeMode?'코드 질문이나 요청을 입력하세요':'메시지를 입력하세요';toast(codeMode?'코드 모드: 코드는 복사 버튼이 있는 코드 칸으로 보여줘요':'코드 모드를 껐어요')};
setLogin();
if(user)sha(user).then(h=>{if(!IDH.includes(h)){user=null;ckey='stg-chats';try{localStorage.removeItem('stg-user')}catch(e){}reloadChats();setLogin();render()}}).catch(()=>{});
const WM=['STGbot이랑 게임 하실래요?','오늘은 무엇이 궁금하세요?','심심하면 끝말잇기 어때요?','수학 문제, 같이 풀어볼까요?','그리고 싶은 그림이 있나요?','오늘 하루는 어땠어요?','궁금한 건 뭐든 물어보세요!','새로운 걸 하나 배워볼까요?'];
let wi=-1;
function pickMsg(){let i;do{i=Math.floor(Math.random()*WM.length)}while(i===wi&&WM.length>1);wi=i;$('wh').textContent=WM[i]}
pickMsg();
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,listening=false,vcOn=false,speakingNow=false,spk=0,micMode='dict';
const setVC=()=>$('vc').classList.toggle('on',vcOn);
function listen(mode){
  if(listening||speakingNow||go.disabled)return;
  if(!SR){toast('이 브라우저는 음성 인식을 지원하지 않아요');vcOn=false;setVC();return}
  micMode=typeof mode==='string'?mode:(vcOn?'vc':'dict');
  let got=false,fatal=false;
  try{rec=new SR();rec.lang=LANGS[lang].sr;rec.interimResults=true;rec.continuous=false;
    rec.onstart=()=>{listening=true;$('mic').classList.add('on');toast(micMode==='vc'?'듣고 있어요…':'말씀하세요…')};
    rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;inp.value=t;got=true};
    rec.onerror=e=>{
      if(e.error==='not-allowed'||e.error==='service-not-allowed'||e.error==='audio-capture'){fatal=true;vcOn=false;setVC();toast('마이크를 쓸 수 없어요. 권한을 허용했는지, 이 화면에서 마이크가 막혀 있는지 확인해 주세요')}
      else if(e.error==='network'){fatal=true;vcOn=false;setVC();toast('음성 인식 서버에 연결할 수 없어요')}};
    rec.onend=()=>{listening=false;$('mic').classList.remove('on');
      if(fatal||micMode!=='vc'||!vcOn)return;
      if(got&&inp.value.trim())send();else setTimeout(listen,600)};
    rec.start();
  }catch(e){listening=false;vcOn=false;setVC();toast('음성 인식을 시작할 수 없어요')}
}
$('mic').onclick=()=>{if(listening){try{rec.stop()}catch(e){}return}if(vcOn)return;listen('dict')};
$('vc').onclick=()=>{
  if(vcOn){vcOn=false;setVC();try{rec&&rec.abort()}catch(e){}try{speechSynthesis.cancel()}catch(e){}toast('음성 대화를 껐어요');return}
  if(!SR){toast('이 브라우저는 음성 인식을 지원하지 않아요');return}
  vcOn=true;setVC();showChat();toast('음성 대화를 시작해요. 말씀하세요');listen('vc')};
const LANGS={ko:{n:'한국어',ai:'한국어',en:'Korean',sr:'ko-KR'},en:{n:'English',ai:'영어',en:'English',sr:'en-US'},ja:{n:'日本語',ai:'일본어',en:'Japanese',sr:'ja-JP'}};
let lang='ko';try{const l=localStorage.getItem('stg-lang');if(LANGS[l])lang=l}catch(e){}
const LR=()=>lang==='ko'?'':'Always reply in '+LANGS[lang].en+', even though these instructions are written in Korean.';
const T=[
['새 채팅','New chat','新しいチャット'],['정보 입수','Info','情報収集'],['연구','Research','調査'],['연구 모드 켜짐','Research on','調査オン'],['STG 로그인','STG login','STGログイン'],
['메시지를 입력하세요','Type a message','メッセージを入力'],['연구할 주제나 질문을 입력하세요','Enter a topic or question','テーマや質問を入力'],['전송','Send','送信'],
['카메라','Camera','カメラ'],['사진','Photo','写真'],['파일','File','ファイル'],['기록','History','履歴'],['궁금한 걸 자유롭게 물어보세요','Ask me anything','気軽に質問してください'],
['공유','Share','共有'],['음성 입력','Voice input','音声入力'],['음성 대화','Voice chat','音声会話'],['기록창 접기/펴기','Collapse/expand history','履歴の開閉'],['새 채팅으로 분기','Branch to new chat','新しいチャットに分岐'],
['아직 기록이 없어요','No history yet','履歴はまだありません'],['새 대화','New chat','新しいチャット'],
['카드 추가','Add card','カードを追加'],['새 카드 제목','New card title','新しいカードのタイトル'],['카드를 추가해 정보를 모아 보세요.','Add cards to collect information.','カードを追加して情報を集めましょう。'],
['내용 추가','Add item','内容を追加'],['AI로 채우기','Fill with AI','AIで埋める'],['카드 삭제','Delete card','カードを削除'],['내용 삭제','Delete item','内容を削除'],['채팅으로 돌아가기','Back to chat','チャットに戻る'],
['비밀번호를 입력하세요','Enter password','パスワー드を入力'],['비밀번호','Password','パスワード'],['확인','OK','確認'],['받은 아이디를 입력하세요','Enter your ID','IDを入力してください'],['아이디','ID','ID'],['로그인','Log in','ログイン'],['로그아웃','Log out','ログアウト'],['닫기','Close','閉じる'],
['로그인 중이에요. 대화는 이 아이디로 저장돼요.','Logged in. Chats are saved under this ID.','ログイン中です。会話はこのIDで保存されます。'],
['복사했어요','Copied','コピーしました'],['답변을 복사했어요','Answer copied','回答をコピーしました'],['대화를 복사했어요','Chat copied','会話をコピーしました'],['복사할 수 없어요','Can’t copy','コピーできません'],['공유할 수 없어요','Can’t share','共有できません'],['공유할 대화가 없어요','Nothing to share','共有する会話がありません'],
['새 채팅으로 분기했어요','Branched to a new chat','新しいチャットに分岐しました'],['이미 새 채팅이에요','Already a new chat','すでに新しいチャットです'],['대화를 저장하고 새 채팅을 시작했어요','Saved and started a new chat','保存して新しいチャットを開始しました'],['로그아웃했어요','Logged out','ログアウトしました'],
['등록되지 않은 아이디예요','ID not registered','登録されていないIDです'],['비밀번호가 맞지 않아요','Wrong password','パスワードが違います'],['정보 입수는 허용된 아이디로 로그인해야 해요','Log in with an allowed ID to use Info','情報収集は許可されたIDでログインが必要です'],['이 아이디는 정보 입수를 쓸 수 없어요','This ID can’t use Info','このIDは情報収集を使えません'],
['듣고 있어요…','Listening…','聞いています…'],['말씀하세요…','Speak now…','話してください…'],['음성 대화를 껐어요','Voice chat off','音声会話をオフにしました'],['음성 대화를 시작해요. 말씀하세요','Voice chat started. Speak now','音声会話を開始します。話してください'],['이 브라우저는 음성 인식을 지원하지 않아요','Voice recognition isn’t supported here','このブラウザは音声認識に対応していません'],['마이크를 쓸 수 없어요. 권한을 허용했는지, 이 화면에서 마이크가 막혀 있는지 확인해 주세요','Can’t use the microphone. Check permission or whether it is blocked here','マイクを使えません。権限を確認してください'],
['AI가 정리하는 중…','AI is working…','AIが整理中…'],['AI로 채우지 못했어요','Couldn’t fill with AI','AIで埋められませんでした'],['사용 한도에 도달했거나 요청이 많아요. 잠시 후 다시 시도해 주세요','Usage limit reached or too many requests. Try again later','利用上限に達したか、リクエストが多すぎます。しばらくして再試行してください'],['오류가 발생했어요. 다시 보내 주세요','Something went wrong. Please resend','エラーが発生しました。もう一度送信してください'],['연구 모드를 껐어요','Research mode off','調査モードをオフにしました'],['연구 모드: 주제를 보내면 정리하고, 이어서 질문하며 함께 연구해요 (실시간 검색은 불가)','Research mode: send a topic, then keep asking follow-ups (no live web search)','調査モード：テーマを送り、続けて質問できます（リアルタイム検索なし）'],['이 기기는 읽어 주기를 지원하지 않아요','Read-aloud isn’t supported','読み上げに対応していません'],
['STGbot이랑 게임 하실래요?','Want to play a game with STGbot?','STGbotとゲームしませんか？'],['오늘은 무엇이 궁금하세요?','What are you curious about today?','今日は何が気になりますか？'],['심심하면 끝말잇기 어때요?','Bored? How about a word game?','暇なら言葉遊びはどうですか？'],['수학 문제, 같이 풀어볼까요?','Shall we solve a math problem?','数学の問題を一緒に解きませんか？'],['그리고 싶은 그림이 있나요?','Any picture you want drawn?','描いてほしい絵はありますか？'],['오늘 하루는 어땠어요?','How was your day?','今日はどんな一日でしたか？'],['궁금한 건 뭐든 물어보세요!','Ask me anything!','何でも聞いてください！'],['새로운 걸 하나 배워볼까요?','Want to learn something new?','新しいことを学びませんか？']];
T.push(['만든 것','Creations','作ったもの'],['코드 모드','Code mode','コードモード'],['AI 모델','AI model','AIモデル'],['모델','Model','モデル'],['생각하는 정도','Thinking level','思考レベル'],
['하','Low','低'],['중','Med','中'],['높음','High','高'],['최대','Max','最大'],
['최대: 이 화면에서는 가장 강한 모델과 높음을 합쳐 처리해요','Max: on this screen, uses the strongest model with High','最大：この画面では最強モデルと「高」を組み合わせます'],
['아직 만든 것이 없어요. 그림이나 코드를 만들어 달라고 해 보세요.','Nothing yet. Ask for a drawing or code.','まだありません。絵やコードを頼んでみてください。'],
['모두 삭제','Delete all','すべて削除'],['정말 지울까요? 한 번 더 누르세요','Really delete? Tap once more','本当に削除しますか？もう一度タップ'],['삭제','Delete','削除'],['복사','Copy','コピー'],
['코드를 복사했어요','Code copied','コードをコピーしました'],['코드 모드: 코드는 복사 버튼이 있는 코드 칸으로 보여줘요','Code mode: code appears in boxes with a copy button','コードモード：コピーボタン付きのコード欄で表示します'],
['코드 모드를 껐어요','Code mode off','コードモードをオフにしました'],['코드 질문이나 요청을 입력하세요','Enter a code question or request','コードの質問や依頼を入力'],
['음성 인식 서버에 연결할 수 없어요','Cannot reach the speech service','音声認識サービスに接続できません'],['음성 인식을 시작할 수 없어요','Cannot start speech recognition','音声認識を開始できません'],
['이 형식은 아직 읽을 수 없어요 (텍스트 파일만 가능)','This format is not supported (text files only)','この形式は未対応です（テキストファイルのみ）'],
['이 환경에서는 AI 기능을 쓸 수 없어요','AI is not available here','ここではAI機能を使えません'],['이 환경에서는 로그인을 확인할 수 없어요','Cannot verify login here','ここではログインを確認できません'],
['이 환경에서는 잠금을 확인할 수 없어요','Cannot verify the lock here','ここではロックを確認できません'],['이 환경에서는 확인할 수 없어요','Cannot verify here','ここでは確認できません'],
['지금은 사진을 읽을 수 없어요','Cannot read photos right now','今は写真を読み取れません'],['AI 사용 권한이 허용되지 않았어요','AI permission not granted','AIの使用が許可されていません']);
const DD={en:{},ja:{}};T.forEach(r=>{DD.en[r[0]]=r[1];DD.ja[r[0]]=r[2]});
const PT=[[/^(.+) · 하$/,'$1 · Low','$1 · 低'],[/^(.+) · 중$/,'$1 · Med','$1 · 中'],[/^(.+) · 높음$/,'$1 · High','$1 · 高'],[/^(.+) · 최대$/,'$1 · Max','$1 · 最大'],[/^(.+) · 빠름$/,'$1 · Fast','$1 · 高速'],[/^(.+) · 기본$/,'$1 · Default','$1 · 標準'],[/^(.+) · 정밀$/,'$1 · Precise','$1 · 高精度'],[/^(\d+)개 메시지$/,'$1 messages','$1件のメッセージ'],[/^(.+) 로그인했어요$/,'$1 logged in','$1 でログインしました']];
const tr=s=>{if(lang==='ko')return s;const d=DD[lang],t=s.trim();if(d[t])return s.replace(t,d[t]);for(const p of PT){if(p[0].test(t))return s.replace(t,t.replace(p[0],lang==='en'?p[1]:p[2]))}return s};
const orig=new WeakMap(),oattr=new WeakMap(),AT=['placeholder','aria-label','title'];
let raf=0;
const obs=new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(apply)});
function apply(){
  obs.disconnect();
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){
    const p=n.parentElement;if(!p||p.closest('.msg,textarea,script,style'))continue;
    let o=orig.get(n);if(o===undefined){o=n.nodeValue;orig.set(n,o)}
    const v=tr(o);if(n.nodeValue!==v)n.nodeValue=v;
  }
  document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{
    let m=oattr.get(e);if(!m){m={};oattr.set(e,m)}
    AT.forEach(a=>{if(!e.hasAttribute(a))return;const cur=e.getAttribute(a);
      if(m[a]===undefined||cur!==m[a+'t'])m[a]=cur;
      const v=tr(m[a]);m[a+'t']=v;if(cur!==v)e.setAttribute(a,v)});
  });
  obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:AT});
}
const setLangBtn=()=>{$('lang').innerHTML=ic('globe')+'<span>'+lang.toUpperCase()+'</span>'};
function openLang(){
  const D2=$('dlg'),b=el('div','bx'),close=el('button','o','닫기');D2.innerHTML='';
  close.onclick=()=>D2.classList.remove('on');
  b.append(el('h3',null,'Language'));
  Object.keys(LANGS).forEach(k=>{const x=el('button','o'+(k===lang?' on':''),LANGS[k].n);x.onclick=()=>{lang=k;try{localStorage.setItem('stg-lang',k)}catch(e){}document.documentElement.lang=k;setLangBtn();pickMsg();apply();D2.classList.remove('on')};b.appendChild(x)});
  b.appendChild(close);D2.appendChild(b);D2.classList.add('on');
}
$('lang').onclick=openLang;
setLangBtn();
document.querySelectorAll('#chips span').forEach(c=>c.onclick=()=>{inp.value=c.textContent;send()});
render();
apply();
