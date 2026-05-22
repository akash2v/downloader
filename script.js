(function () {
  "use strict";

  const UNLOCK_TTL = 60 * 60 * 1000; // 1 hour in ms

  function storageKey(v) { return 'st_unlock_' + v; }

  function isUnlocked(v) {
    try {
      const raw = localStorage.getItem(storageKey(v));
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return (Date.now() - ts) < UNLOCK_TTL;
    } catch (e) { return false; }
  }

  function saveUnlock(v) {
    try { localStorage.setItem(storageKey(v), JSON.stringify({ ts: Date.now() })); } catch (e) {}
  }

  function getExpiryMins(v) {
    try {
      const raw = localStorage.getItem(storageKey(v));
      if (!raw) return 0;
      const { ts } = JSON.parse(raw);
      return Math.max(0, Math.ceil((UNLOCK_TTL - (Date.now() - ts)) / 60000));
    } catch (e) { return 0; }
  }

  const taskPool = [
    { id: 1, title: "Subscribe On YouTube", description: "Follow our channel for official file updates and tutorials.", duration: 15, link: "https://youtube.com/@skytup/?sub_confirmation=1", buttonText: "Subscribe Now" },
    { id: 2, title: "Follow us on Instagram", description: "Stay connected with our team on Instagram for news.", duration: 15, link: "https://instagram.com/skytupnet", buttonText: "Follow Us" },
    { id: 3, title: "Follow Telegram Channel", description: "Join our community for instant download alerts.", duration: 15, link: "https://t.me/skytupnet", buttonText: "Join Channel" },
    { id: 4, title: "Follow on Facebook", description: "Like our official page to join the community.", duration: 15, link: "https://facebook.com/skytup", buttonText: "Like Page" },
    { id: 6, title: "Follow on X", description: "Get real-time updates and community news.", duration: 15, link: "https://twitter.com/skythecoder", buttonText: "Follow Updates" },
  ];

  class Verifier {
    constructor() {
      this.data = null;
      this.selected = [];
      this.done = new Set();
      this.timers = {};
      this.init();
    }

    init() {
      this.initParticles();
      this.extract();
      if (!this.data || !this.data.url) return this.showError();
      this.renderUI();
      if (isUnlocked(this.vParam)) {
        this.showAlreadyUnlocked();
      } else {
        this.renderTasks();
      }
    }

    initParticles() {
      if (typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: "#6366f1" },
            opacity: { value: 0.3 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#6366f1", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2 }
          },
          interactivity: {
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } }
          },
          retina_detect: true
        });
      }
    }

    unforge(auth) {
      try {
        const pad = (s) => s + '='.repeat((4 - s.length % 4) % 4);
        let s1 = atob(pad(auth));
        if (!s1.startsWith("st_") || !s1.endsWith("_tp")) return null;
        let c = atob(pad(s1.substring(3, s1.length - 3)));
        let clean = "";
        for (let i = 0; i < c.length; i++) {
          if (i % 6 !== 1) {
            clean += c[i];
          }
        }
        let json = clean.split('').map(x => String.fromCharCode(x.charCodeAt(0) - 3)).join('');
        return JSON.parse(decodeURIComponent(escape(atob(pad(json)))));
      } catch (e) { return null; }
    }

    extract() {
      const p = new URLSearchParams(window.location.search);
      this.vParam = p.get("v") || '';
      if (this.vParam) this.data = this.unforge(this.vParam);
    }

    renderUI() {
      const title    = document.getElementById('fileTitle');
      const fileDesc = document.getElementById('fileDesc');
      const logo     = document.getElementById('logoArea');
      const media    = document.getElementById('mediaBox');
      const bodyBg   = document.getElementById('bodyBg');

      if (this.data.title) {
        title.innerText = this.data.title;
        document.title = this.data.title;
      }

      if (fileDesc) {
        fileDesc.innerText = this.data.desc
          ? this.data.desc
          : 'Complete the steps on the right to unlock your secure download link.';
      }

      if (this.data.cover) {
        bodyBg.style.backgroundImage = `url('${this.data.cover}')`;
      }

      if (this.data.album) {
        logo.innerHTML = `<img src="${this.data.album}" alt="Brand Logo">`;
        logo.style.background = 'none';
        logo.style.border = 'none';
        logo.style.boxShadow = 'none';
      }

      if (this.data.yt) {
        const embedSrc = this.data.ytSrc || ('https://www.youtube.com/embed/' + this.data.yt);
        const thumbId  = this.data.yt;
        const autoSrc  = embedSrc + (embedSrc.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';

        media.innerHTML = `
          <div class="yt-wrapper" id="ytBox">
            <div id="ytThumb" style="cursor:pointer;position:absolute;inset:0;background:#000 url('https://i.ytimg.com/vi/${thumbId}/hqdefault.jpg') center/cover no-repeat;display:flex;align-items:center;justify-content:center;border-radius:inherit;">
              <div class="yt-play-btn">
                <svg viewBox='0 0 24 24' width='30' height='30' fill='white'><path d='M8 5v14l11-7z'/></svg>
              </div>
            </div>
          </div>`;

        document.getElementById('ytThumb').addEventListener('click', function () {
          this.remove();
          const f = document.createElement('iframe');
          f.src = autoSrc;
          f.setAttribute('frameborder', '0');
          f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
          f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          f.setAttribute('allowfullscreen', '');
          f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
          document.getElementById('ytBox').appendChild(f);
        });
      } else if (this.data.cover) {
        media.innerHTML = `
          <div class="yt-wrapper">
            <img src="${this.data.cover}" alt="Cover" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;">
          </div>`;
      }
    }

    renderTasks() {
      // Use custom links if provided, else fall back to default pool
      if (this.data.customLinks && this.data.customLinks.length) {
        this.selected = this.data.customLinks.map((cl, i) => ({
          id: i + 1,
          title: cl.title,
          description: cl.link,
          duration: 15,
          link: cl.link,
          buttonText: cl.buttonText || 'Visit'
        }));
      } else {
        this.selected = [...taskPool].sort(() => 0.5 - Math.random()).slice(0, 3);
      }
      const list = document.getElementById('tasksList');
      list.innerHTML = "";

      this.selected.forEach((t, i) => {
        const el = document.createElement('div');
        el.className = `task-item ${i === 0 ? 'active' : ''}`;
        el.id = `task-${t.id}`;
        el.innerHTML = `
          <div class="task-info">
            <div class="task-title">Step ${i+1}: ${t.title}</div>
            <div class="task-desc">${t.description}</div>
          </div>
          <button class="btn btn-primary task-btn" data-id="${t.id}" ${i !== 0 ? 'disabled' : ''}>
            <i class="fas fa-external-link-alt"></i>
            <span>${t.buttonText}</span>
          </button>
          <div class="timer" id="timer-${t.id}" style="display:none"></div>
        `;
        list.appendChild(el);
        el.querySelector('.task-btn').onclick = () => this.startTask(t.id);
      });
    }

    startTask(id) {
      const t = this.selected.find(x => x.id === id);
      const el = document.getElementById(`task-${id}`);
      const btn = el.querySelector('.task-btn');
      const timer = document.getElementById(`timer-${id}`);

      window.open(t.link, "_blank");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> <span>Verifying...</span>`;
      timer.style.display = "block";

      let left = t.duration;
      this.timers[id] = setInterval(() => {
        if (document.hidden) {
          timer.innerHTML = `<i class="fas fa-pause"></i> Paused: Please stay focused`;
          return;
        }
        left--;
        timer.innerHTML = `<i class="fas fa-clock"></i> Verification in ${left}s`;
        if (left <= 0) this.completeTask(id);
      }, 1000);
    }

    completeTask(id) {
      clearInterval(this.timers[id]);
      const el = document.getElementById(`task-${id}`);
      const btn = el.querySelector('.task-btn');
      const timer = document.getElementById(`timer-${id}`);

      el.classList.remove('active');
      el.classList.add('completed');
      btn.innerHTML = `<i class="fas fa-check-circle"></i> <span>Verified</span>`;
      btn.className = "btn btn-success";
      timer.style.display = "none";

      this.done.add(id);
      const prog = (this.done.size / this.selected.length) * 100;
      document.getElementById('progressBar').style.width = `${prog}%`;

      const idx = this.selected.findIndex(x => x.id === id);
      if (idx < this.selected.length - 1) {
        const next = this.selected[idx + 1];
        const nextEl = document.getElementById(`task-${next.id}`);
        nextEl.classList.add('active');
        nextEl.querySelector('.task-btn').disabled = false;
      } else {
        saveUnlock(this.vParam);
        const dBtn = document.getElementById('downloadBtn');
        dBtn.disabled = false;
        dBtn.innerHTML = `<i class="fas fa-unlock-alt"></i> <span>Download File</span>`;
        dBtn.onclick = () => window.open(this.data.url, "_blank");
      }
    }

    showAlreadyUnlocked() {
      const mins = getExpiryMins(this.vParam);
      const tasksList = document.getElementById('tasksList');
      tasksList.innerHTML = `
        <div style="background:rgba(16,185,129,0.07);border:1.5px solid rgba(16,185,129,0.35);border-radius:18px;padding:22px 20px;display:flex;align-items:center;gap:16px;">
          <div style="width:44px;height:44px;flex-shrink:0;background:rgba(16,185,129,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-check-circle" style="color:#10b981;font-size:20px;"></i>
          </div>
          <div>
            <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;color:#10b981;margin-bottom:4px;">Already Verified</div>
            <div style="font-size:12.5px;color:var(--text-muted);line-height:1.5;">Your access is active for another <strong style="color:var(--text-main);">${mins} minute${mins !== 1 ? 's' : ''}</strong>. No tasks needed.</div>
          </div>
        </div>`;
      document.getElementById('progressBar').style.width = '100%';
      const dBtn = document.getElementById('downloadBtn');
      dBtn.disabled = false;
      dBtn.innerHTML = `<i class="fas fa-unlock-alt"></i> <span>Download File</span>`;
      dBtn.onclick = () => window.open(this.data.url, "_blank");
    }

    showError() {
      const base = window.location.href.replace(/\/[^/]*$/, '');
      document.getElementById('mainContainer').innerHTML = `
        <div style="padding:70px 40px;text-align:center;width:100%;display:flex;flex-direction:column;align-items:center;gap:0;">
          <div style="width:90px;height:90px;background:rgba(239,68,68,0.08);border:2px solid rgba(239,68,68,0.4);border-radius:22px;display:flex;align-items:center;justify-content:center;margin-bottom:28px;box-shadow:0 0 30px rgba(239,68,68,0.15);">
            <i class="fas fa-link-slash" style="font-size:38px;color:#ef4444;"></i>
          </div>
          <h1 style="font-family:'Outfit',sans-serif;font-size:clamp(24px,4vw,36px);font-weight:900;background:linear-gradient(135deg,#fff 30%,#f87171 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;">Invalid or Expired Link</h1>
          <p style="color:var(--text-muted);font-size:14px;line-height:1.6;max-width:360px;margin-bottom:36px;">This secure link is invalid or has expired. Create a fresh one using the link forge below.</p>
          <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;">
            <a href="${base}/create.html" style="display:inline-flex;align-items:center;gap:10px;padding:15px 28px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;text-decoration:none;text-transform:uppercase;letter-spacing:0.7px;box-shadow:0 8px 24px -4px rgba(99,102,241,0.5);transition:all 0.25s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <i class="fas fa-bolt"></i> Create New Link
            </a>
            <a href="https://skytup.com" target="_blank" style="display:inline-flex;align-items:center;gap:10px;padding:15px 28px;border-radius:14px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.12);color:var(--text-muted);font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;text-decoration:none;text-transform:uppercase;letter-spacing:0.7px;transition:all 0.25s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.3)';this.style.color='#fff'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)';this.style.color='var(--text-muted)'">
              <i class="fas fa-house"></i> Return Home
            </a>
          </div>
        </div>
      `;
    }
  }

  new Verifier();
})();
