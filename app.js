const ctx = document.getElementById('context');
const tone = document.getElementById('tone');
const input = document.getElementById('input');
const output = document.getElementById('output');
const alts = document.getElementById('alts');
const literal = document.getElementById('literal');

const STYLE = {
  casual: ['Low-key', 'Honestly', 'Not gonna lie'],
  hype: ['Yo', 'No cap', 'For real'],
  gaming: ['Ngl', 'Bro', 'Deadass'],
  dating: ['Tbh', 'Low-key', 'Honestly'],
  work: ['Honestly', 'Quick update:', 'To be real']
};

function applyTone(t, toneMode){
  if (toneMode === 'polite') {
    return t
      .replace(/bro/gi, 'my friend')
      .replace(/deadass/gi, 'seriously')
      .replace(/no cap/gi, 'honestly')
      .replace(/gonna/gi, 'going to')
      .replace(/wanna/gi, 'want to')
      .replace(/gotta/gi, 'need to');
  }
  if (toneMode === 'savage') {
    return t
      .replace(/honestly/gi, 'real talk')
      .replace(/quick update/gi, 'real talk')
      .replace(/\.$/, '') + ' 😮‍💨';
  }
  return t;
}

function slangify(text, mode = 'casual', toneMode = 'neutral') {
  let t = text.trim();
  const starter = STYLE[mode][Math.floor(Math.random() * STYLE[mode].length)];
  t = t.replace(/very /gi, 'mad ')
    .replace(/really /gi, 'super ')
    .replace(/I am /gi, "I'm ")
    .replace(/I have to /gi, 'I gotta ')
    .replace(/going to /gi, 'gonna ')
    .replace(/want to /gi, 'wanna ')
    .replace(/do not /gi, "don't ")
    .replace(/cannot /gi, "can't ")
    .replace(/kind of/gi, 'kinda')
    .replace(/a lot/gi, 'a ton')
    .replace(/friends/gi, 'the crew');

  if (mode === 'hype') t = `${starter}, ${t} 🔥`;
  else if (mode === 'gaming') t = `${starter}, ${t}`;
  else if (mode === 'dating') t = `${starter}, ${t} :)`;
  else if (mode === 'work') t = `Quick heads-up: ${t}`;
  else t = `${starter}, ${t}`;

  t = t.charAt(0).toUpperCase() + t.slice(1);
  return applyTone(t, toneMode);
}

function altVersions(base) {
  const v2 = base.replace(/^.*?,\s*/, '').replace(/\.$/, '') + '.';
  const v3 = base.replace(/Quick heads-up:\s*/i, '').replace(/\.$/, '') + ' fr.';
  return [base, v2, v3];
}

async function zhToEn(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url);
  const data = await r.json();
  return data[0].map(x => x[0]).join('');
}

async function doTranslate() {
  const zh = input.value.trim();
  if (!zh) return;
  output.textContent = 'Translating...';
  alts.innerHTML = '';
  try {
    const en = await zhToEn(zh);
    literal.textContent = en;
    const main = slangify(en, ctx.value, tone.value);
    output.textContent = main;
    altVersions(main).forEach(v => {
      const li = document.createElement('li');
      li.textContent = v;
      alts.appendChild(li);
    });
  } catch (e) {
    output.textContent = 'Could not translate right now. Try again.';
  }
}

document.getElementById('translate').onclick = doTranslate;
document.getElementById('copy').onclick = async () => {
  const text = output.textContent.trim();
  if (!text || text === '—' || text.toLowerCase().includes('translating')) return;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById('copy').textContent = 'Copied';
    setTimeout(() => document.getElementById('copy').textContent = 'Copy', 1200);
  } catch {
    alert('Copy failed on this browser. Long-press text to copy.');
  }
};

const voiceBtn = document.getElementById('voice');
voiceBtn.onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Voice input not supported on this browser.'); return; }
  const rec = new SR();
  rec.lang = 'zh-CN';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    input.value = e.results[0][0].transcript;
  };
  rec.start();
};