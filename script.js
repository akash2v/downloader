(function () {
  "use strict";

  const taskPool = [
    { id: 1, title: "Official YouTube", description: "Follow our channel for official file updates and tutorials.", duration: 15, link: "https://youtube.com/@skytup/?sub_confirmation=1", buttonText: "Subscribe Now" },
    { id: 2, title: "Instagram Profile", description: "Stay connected with our team on Instagram for news.", duration: 15, link: "https://instagram.com/skytupnet", buttonText: "Follow Us" },
    { id: 3, title: "Telegram Channel", description: "Join our community for instant download alerts.", duration: 15, link: "https://t.me/skytupnet", buttonText: "Join Channel" },
    { id: 4, title: "Facebook Hub", description: "Like our official page to join the community.", duration: 15, link: "https://facebook.com/skytup", buttonText: "Like Page" },
    { id: 5, title: "Corporate Website", description: "Visit our main portal for more exclusive resources.", duration: 15, link: "https://www.skytup.com", buttonText: "Visit Portal" },
    { id: 6, title: "Twitter / X", description: "Get real-time updates and community news.", duration: 15, link: "https://twitter.com/skythecoder", buttonText: "Follow Updates" },
    { id: 7, title: "GitHub Projects", description: "Explore our open-source codebase and projects.", duration: 15, link: "https://github.com/akash2v", buttonText: "Explore Repo" },
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
      this.renderTasks();
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
      const v = p.get("v");
      if (v) this.data = this.unforge(v);
    }

    renderUI() {
      const title    = document.getElementById('fileTitle');
      const fileDesc = document.getElementById('fileDesc');
      const logo     = document.getElementById('logoArea');
      const media    = document.getElementById('mediaBox');
      const bodyBg   = document.getElementById('bodyBg');

      if (this.data.title) title.innerText = this.data.title;

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
        // Use stored full embed src if available, else build from ID
        const embedSrc = this.data.ytSrc || ('https://www.youtube.com/embed/' + this.data.yt);
        const thumbId  = this.data.yt;
        media.innerHTML = `
          <div class="yt-wrapper" id="ytBox">
            <div class="yt-thumb" id="ytThumb" onclick="loadYT()" style="cursor:pointer;position:absolute;inset:0;background:#000 url('https://i.ytimg.com/vi/${thumbId}/hqdefault.jpg') center/cover no-repeat;display:flex;align-items:center;justify-content:center;">
              <div style="width:68px;height:48px;background:rgba(255,0,0,0.9);border-radius:12px;display:flex;align-items:center;justify-content:center;">
                <svg viewBox='0 0 24 24' width='28' height='28' fill='white'><path d='M8 5v14l11-7z'/></svg>
              </div>
            </div>
          </div>
          <script>
            function loadYT() {
              document.getElementById('ytThumb').style.display = 'none';
              var f = document.createElement('iframe');
              f.src = '${embedSrc}' + (('${embedSrc}'.indexOf('?') > -1) ? '&' : '?') + 'autoplay=1';
              f.setAttribute('frameborder','0');
              f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
              f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
              f.setAttribute('allowfullscreen','');
              f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
              document.getElementById('ytBox').appendChild(f);
            }
          <\/script>`;
      } else if (this.data.cover) {
        media.innerHTML = `<img src="${this.data.cover}" alt="Cover" style="width:100%;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,0.55);display:block;">`;
      }
    }

    renderTasks() {
      this.selected = [...taskPool].sort(() => 0.5 - Math.random()).slice(0, 3);
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
        const dBtn = document.getElementById('downloadBtn');
        dBtn.disabled = false;
        dBtn.innerHTML = `<i class="fas fa-unlock-alt"></i> <span>Download File</span>`;
        dBtn.onclick = () => window.open(this.data.url, "_blank");
      }
    }

    showError() {
      document.getElementById('mainContainer').innerHTML = `
        <div style="padding:60px; text-align:center; width:100%">
          <i class="fas fa-link-slash" style="font-size:50px; color:#ef4444; margin-bottom:20px"></i>
          <h1>Expired or Invalid</h1>
          <p style="color:var(--text-muted); margin-top:10px">The secure session has expired.</p>
          <div style="margin-top:30px">
            <a href="https://skytup.com" class="btn btn-primary" style="display:inline-flex; width:auto">Return Home</a>
          </div>
        </div>
      `;
    }
  }

  new Verifier();
})();
