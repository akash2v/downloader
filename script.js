// Security and anti-tampering system
(function () {
  "use strict";

  const securitySystem = {
    initialWidth: window.innerWidth,
    initialHeight: window.innerHeight,
    devtoolsOpen: false,
    violations: 0,

    init() {
      this.preventDevTools();
      this.preventRightClick();
      this.monitorResize();
      this.preventKeyboardShortcuts();
      this.detectDevTools();
    },

    triggerViolation() {
      this.violations++;
      if (this.violations >= 1) {
        this.showErrorScreen();
      }
    },

    showErrorScreen() {
      document.body.innerHTML = `
                        <div class="container">
                            <div class="error-screen active">
                                <div class="error-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <h2>Invalid Activity Detected</h2>
                                <p>Suspicious behavior has been detected. Please reload the page and try again.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Copyright &copy; 2026 <a href="https://skytup.com" target="_blank">skytup.com</a></p>
                        </div>
                    `;
    },

    preventRightClick() {
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.triggerViolation();
      });
    },

    preventKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
        if (
          e.keyCode === 123 ||
          (e.ctrlKey &&
            e.shiftKey &&
            (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
          (e.ctrlKey && e.keyCode === 85)
        ) {
          e.preventDefault();
          this.triggerViolation();
        }
      });
    },

    monitorResize() {
      window.addEventListener("resize", () => {
        const widthDiff = Math.abs(window.innerWidth - this.initialWidth);
        const heightDiff = Math.abs(window.innerHeight - this.initialHeight);

        if (widthDiff > 100 || heightDiff > 100) {
          this.triggerViolation();
        }
      });
    },

    preventDevTools() {
      setInterval(() => {
        const start = new Date();
        debugger;
        const end = new Date();
        if (end - start > 100) {
          this.triggerViolation();
        }
      }, 1000);
    },

    detectDevTools() {
      const element = new Image();
      Object.defineProperty(element, "id", {
        get: () => {
          this.devtoolsOpen = true;
          this.triggerViolation();
        },
      });
      setInterval(() => {
        console.log(element);
      }, 1000);
    },
  };

  // Task system with link support
  const taskPool = [
    {
      id: 1,
      title: "Subscribe to YouTube Channel",
      description: "Subscribe to our YouTube channel to support us",
      duration: 30,
      type: "link",
      link: "https://youtube.com/@skytup/?sub_confirmation=1",
      buttonText: "Subscribe Now",
    },
    {
      id: 2,
      title: "Follow on Instagram",
      description: "Follow us on Instagram for latest updates",
      duration: 30,
      type: "link",
      link: "https://instagram.com/skytupnet",
      buttonText: "Follow Us",
    },
    {
      id: 3,
      title: "Join Telegram Group",
      description: "Join our Telegram community",
      duration: 30,
      type: "link",
      link: "https://t.me/skytupnet",
      buttonText: "Join Telegram Group",
    },
    {
      id: 4,
      title: "Like Facebook Page",
      description: "Like our Facebook page to stay connected",
      duration: 30,
      type: "link",
      link: "https://facebook.com/skytup",
      buttonText: "Like & Follow Page",
    },
    {
      id: 5,
      title: "Visit Website",
      description: "Visit our official website",
      duration: 30,
      type: "link",
      link: "https://www.skytup.com",
      buttonText: "Visit Now",
    },
    {
      id: 6,
      title: "Follow on Twitter",
      description: "Follow us on Twitter for news and updates",
      duration: 30,
      type: "link",
      link: "https://twitter.com/skythecoder",
      buttonText: "Follow",
    },
    {
      id: 6,
      title: "Subscribe to YouTube Channel",
      description: "Subscribe to our YouTube channel to support us",
      duration: 30,
      type: "link",
      link: "https://youtube.com/@dev_sky/?sub_confirmation=1",
      buttonText: "Subscribe Now",
    },
  ];

  class DownloadManager {
    constructor() {
      this.downloadUrl = null;
      this.selectedTasks = [];
      this.completedTasks = new Set();
      this.currentTaskIndex = 0;
      this.timers = {};
      this.focusActive = true;

      this.init();
    }

    init() {
      securitySystem.init();
      this.extractDownloadUrl();
      this.selectRandomTasks();
      this.renderTasks();
      this.setupEventListeners();
      this.initializeFocusTracking();
    }

    extractDownloadUrl() {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("download_url");

      if (encoded) {
        try {
          this.downloadUrl = atob(encoded);
        } catch (e) {
          console.error("Invalid URL parameter");
        }
      }
    }

    selectRandomTasks() {
      const shuffled = [...taskPool].sort(() => Math.random() - 0.5);
      this.selectedTasks = shuffled.slice(0, 3);
    }

    renderTasks() {
      const container = document.getElementById("tasksContainer");
      container.innerHTML = "";

      this.selectedTasks.forEach((task, index) => {
        const taskElement = document.createElement("div");
        taskElement.className = "task-item";
        taskElement.id = `task-${task.id}`;

        const buttonText = task.buttonText || "Click Me";
        const buttonIcon = task.link
          ? '<i class="fas fa-external-link-alt"></i>'
          : '<i class="fas fa-play"></i>';

        taskElement.innerHTML = `
                            <div class="task-header">
                                <div class="task-status">
                                    <i class="fas fa-circle"></i>
                                </div>
                                <div class="task-title">Step ${index + 1}: ${task.title}</div>
                            </div>
                            <div class="task-description">${task.description}</div>
                            <button class="task-button" data-task-id="${task.id}" ${index !== 0 ? "disabled" : ""}>
                                ${buttonIcon}
                                <span>${buttonText}</span>
                            </button>
                            <div class="timer-display" id="timer-${task.id}" style="display: none;"></div>
                        `;

        container.appendChild(taskElement);
      });
    }

    setupEventListeners() {
      document.querySelectorAll(".task-button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const taskId = parseInt(e.currentTarget.dataset.taskId);
          this.startTask(taskId);
        });
      });
    }

    initializeFocusTracking() {
      window.addEventListener("focus", () => {
        this.focusActive = true;
      });

      window.addEventListener("blur", () => {
        this.focusActive = false;
      });
    }

    startTask(taskId) {
      const task = this.selectedTasks.find((t) => t.id === taskId);
      if (!task) return;

      const taskElement = document.getElementById(`task-${taskId}`);
      const button = taskElement.querySelector(".task-button");
      const timerDisplay = document.getElementById(`timer-${taskId}`);

      // Open link if available
      if (task.link) {
        window.open(task.link, "_blank");
      }

      taskElement.classList.add("active");
      button.disabled = true;
      button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i><span>In Progress...</span>';
      button.classList.add("in-progress");
      timerDisplay.style.display = "block";

      let timeRemaining = task.duration;

      this.timers[taskId] = setInterval(() => {
        if (task.type === "focus" && !this.focusActive) {
          timerDisplay.innerHTML =
            '<i class="fas fa-pause-circle"></i> Paused - Please focus on this tab';
          return;
        }

        timeRemaining--;
        timerDisplay.innerHTML = `<i class="fas fa-clock"></i> ${timeRemaining}s remaining`;

        if (timeRemaining <= 0) {
          this.completeTask(taskId);
        }
      }, 1000);
    }

    completeTask(taskId) {
      clearInterval(this.timers[taskId]);

      const taskElement = document.getElementById(`task-${taskId}`);
      const button = taskElement.querySelector(".task-button");
      const timerDisplay = document.getElementById(`timer-${taskId}`);

      taskElement.classList.remove("active");
      taskElement.classList.add("completed");
      button.innerHTML =
        '<i class="fas fa-check-circle"></i><span>Completed</span>';
      timerDisplay.style.display = "none";

      this.completedTasks.add(taskId);
      this.updateProgress();

      // Enable next task
      const currentIndex = this.selectedTasks.findIndex((t) => t.id === taskId);
      if (currentIndex < this.selectedTasks.length - 1) {
        const nextTask = this.selectedTasks[currentIndex + 1];
        const nextButton = document.querySelector(
          `[data-task-id="${nextTask.id}"]`,
        );
        nextButton.disabled = false;
      }

      // Check if all tasks completed
      if (this.completedTasks.size === this.selectedTasks.length) {
        this.enableDownload();
      }
    }

    updateProgress() {
      const progress =
        (this.completedTasks.size / this.selectedTasks.length) * 100;
      document.getElementById("progressBar").style.width = `${progress}%`;
    }

    enableDownload() {
      const downloadBtn = document.getElementById("downloadBtn");
      downloadBtn.disabled = false;
      downloadBtn.innerHTML =
        '<i class="fas fa-download"></i><span>Download Your File Now</span>';
      downloadBtn.classList.add("ready");

      downloadBtn.addEventListener("click", () => {
        if (this.downloadUrl) {
          window.location.href = this.downloadUrl;
        } else {
          alert("Download URL not available");
        }
      });
    }
  }

  // Initialize the download manager
  new DownloadManager();
})();
