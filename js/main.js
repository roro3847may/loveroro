import { db, ref, onValue } from "./firebase.js";

const countdownEl = document.getElementById("countdown");
const baseDateEl = document.getElementById("baseDate");

const baseDeathDate = new Date("2036-05-26T00:00:00+09:00");

let loveMinutes = 0;
let tokenMinutes = 0;

function parseTokenToMinutes(token) {
  if (!token) return 0;
  const m = token.trim().match(/^([+-])\s*(\d+)\s*([dhm]?)$/i);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  const val = parseInt(m[2], 10);
  const unit = (m[3] || "d").toLowerCase();
  const mult = unit === "d" ? 24*60 : unit === "h" ? 60 : 1;
  return sign * val * mult;
}

async function scanPostTokens() {
  const dirs = ["posts/sooner", "posts/later"];
  let total = 0;

  for (const dir of dirs) {
    for (let i = 1; i <= 500; i++) {
      const url = `${dir}/${i}.html`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) break;
        const html = await res.text();

        const meta = html.match(/<meta[^>]*id=['"]adjustToken['"][^>]*data-adjust=['"]([^'"]+)['"][^>]*>/i);
        if (meta) { total += parseTokenToMinutes(meta[1]); continue; }

        const ptag = html.match(/<p[^>]*class=['"][^'"]*adjust-token[^'"]*['"][^>]*>([^<]+)<\/p>/i);
        if (ptag) { total += parseTokenToMinutes(ptag[1]); continue; }

        const inline = html.match(/([+-]\s*\d+\s*[dhm]?)(?=[^\d\w]*<\/body>)/i);
        if (inline) { total += parseTokenToMinutes(inline[1]); }
      } catch (e) { break; }
    }
  }

  tokenMinutes = total;
  render();
}

function listenLoveCount() {
  const loveRef = ref(db, "loveCount");
  onValue(loveRef, (snap) => {
    const count = snap.val() || 0;
    loveMinutes = count;
    render();
  });
}

function render() {
  if (!countdownEl || !baseDateEl) return;

  const totalMinutes = loveMinutes + tokenMinutes;
  const target = new Date(baseDeathDate.getTime() + totalMinutes * 60 * 1000);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    countdownEl.textContent = "끝났어요.";
    baseDateEl.textContent = "";
    return;
  }

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  countdownEl.textContent = `${d}일 ${h}시간 ${m}분 ${s}초 남음`;
  const dateStr = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false
  }).format(target);
  baseDateEl.textContent = dateStr;
}

listenLoveCount();
scanPostTokens();
setInterval(scanPostTokens, 5 * 60 * 1000);
setInterval(render, 1000);
