// GODOY MODS - SCRIPT PRINCIPAL & ESTADO LOCAL

// Limpeza de localStorage de projetos legados/antigos
try {
  localStorage.removeItem("godoy_projects_data");
} catch (e) { }

// Funções utilitárias para extensões e ícones de plataformas
function getExtBadge(platKey) {
  const k = (platKey || "").toLowerCase();
  if (k.includes("android")) return ".APK";
  if (k.includes("pc")) return ".ZIP";
  if (k.includes("ps2") || k.includes("playstation 2")) return ".ISO";
  if (k.includes("ps3") || k.includes("playstation 3")) return ".PKG";
  if (k.includes("xbox")) return ".ZIP";
  return ".ZIP";
}

function getPlatformIcon(platKey) {
  const k = (platKey || "").toLowerCase();
  if (k.includes("android")) return "📱";
  if (k.includes("pc")) return "💻";
  if (k.includes("xbox")) return "🟢";
  return "🎮";
}

// NOTIFICAÇÕES TOAST & MODAL DE CONFIRMAÇÃO CUSTOMIZADO
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close-btn';
  closeBtn.innerHTML = '✕';
  closeBtn.onclick = () => removeToast(toast);

  toast.appendChild(textSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Anime.js Entry Animation
  if (typeof anime !== 'undefined') {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.95)';
    anime({
      targets: toast,
      opacity: [0, 1],
      translateY: [-20, 0],
      scale: [0.95, 1],
      duration: 400,
      easing: 'easeOutBack'
    });
  }

  setTimeout(() => removeToast(toast), 3500);
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  if (typeof anime !== 'undefined') {
    anime.remove(toast);
    anime({
      targets: toast,
      opacity: 0,
      translateY: -20,
      scale: 0.95,
      duration: 300,
      easing: 'easeInQuad',
      complete: () => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }
    });
  } else {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

function showCustomConfirm({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false, onConfirm }) {
  let overlay = document.getElementById('custom-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'custom-confirm-overlay';
    overlay.className = 'custom-confirm-overlay';
    overlay.innerHTML = `
      <div class="custom-confirm-card" onclick="event.stopPropagation()">
        <div class="custom-confirm-header">
          <h3 class="custom-confirm-title" id="confirm-modal-title"></h3>
        </div>
        <p class="custom-confirm-message" id="confirm-modal-msg"></p>
        <div class="custom-confirm-actions">
          <button type="button" class="btn-secondary" id="confirm-modal-cancel">${cancelText}</button>
          <button type="button" class="${isDanger ? 'btn-confirm-danger' : 'action-btn-primary'}" id="confirm-modal-ok">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const titleElem = document.getElementById('confirm-modal-title');
  const msgElem = document.getElementById('confirm-modal-msg');
  const cancelBtn = document.getElementById('confirm-modal-cancel');
  const okBtn = document.getElementById('confirm-modal-ok');

  if (titleElem) titleElem.textContent = title;
  if (msgElem) msgElem.textContent = message;
  if (cancelBtn) cancelBtn.textContent = cancelText;
  if (okBtn) {
    okBtn.textContent = confirmText;
    okBtn.className = isDanger ? 'btn-confirm-danger' : 'action-btn-primary';
  }

  const closeConfirm = () => {
    overlay.classList.remove('active');
  };

  overlay.onclick = closeConfirm;
  cancelBtn.onclick = closeConfirm;

  okBtn.onclick = () => {
    closeConfirm();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  overlay.classList.add('active');
}

// HELPER PARA FORMATAR DATA ATUAL NATIVA EM PORTUGUÊS (PT-BR)
function getFormattedCurrentDate() {
  const now = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day} de ${month}, ${year}`;
}

function getFormattedMonthYear() {
  const now = new Date();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${month}, ${year}`;
}

function setPresetPostDate(type) {
  const input = document.getElementById("input-date");
  if (!input) return;
  const now = new Date();
  if (type === "today") {
    input.value = getFormattedCurrentDate();
  } else if (type === "month_year") {
    input.value = getFormattedMonthYear();
  } else if (type === "year") {
    input.value = `${now.getFullYear()}`;
  }
  updateGeneratorPreview();
}

function setPresetProjectPeriod(type) {
  const input = document.getElementById("input-project-period");
  if (!input) return;
  const now = new Date();
  const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const mShort = monthsShort[now.getMonth()];
  const y = now.getFullYear();
  if (type === "ongoing") {
    input.value = `Início: ${mShort}/${y} (Em andamento)`;
  } else if (type === "completed") {
    input.value = `Início: 2024 • Concluído: ${mShort}/${y}`;
  } else if (type === "start_only") {
    input.value = `Início: ${y}`;
  }
  updateGeneratorPreview();
}

// FORMATADOR E PARSER DE DATA PARA ORDENAÇÃO CRONOLÓGICA (MAIS RECENTE PRIMEIRO)
function parsePostDate(dateStr) {
  if (!dateStr) return 0;
  const str = String(dateStr).trim().toLowerCase();

  if (str === "hoje") return Date.now();

  const monthsMap = {
    "janeiro": 0, "jan": 0,
    "fevereiro": 1, "fev": 1,
    "março": 2, "marco": 2, "mar": 2,
    "abril": 3, "abr": 3,
    "maio": 4, "mai": 4,
    "junho": 5, "jun": 5,
    "julho": 6, "jul": 6,
    "agosto": 7, "ago": 7,
    "setembro": 8, "set": 8,
    "outubro": 9, "out": 9,
    "novembro": 10, "nov": 10,
    "dezembro": 11, "dez": 11
  };

  const matchDMY = str.match(/(\d{1,2})\s+(?:de\s+)?([a-zçáéíóú]+)\s+(?:de\s+|,?\s+)?(\d{4})/i);
  if (matchDMY) {
    const day = parseInt(matchDMY[1], 10);
    const mStr = matchDMY[2].toLowerCase();
    const month = monthsMap[mStr] !== undefined ? monthsMap[mStr] : 0;
    const year = parseInt(matchDMY[3], 10);
    return new Date(year, month, day).getTime();
  }

  const matchMY = str.match(/([a-zçáéíóú]+)\s+(?:de\s+|,?\s+)?(\d{4})/i);
  if (matchMY) {
    const mStr = matchMY[1].toLowerCase();
    const month = monthsMap[mStr] !== undefined ? monthsMap[mStr] : 0;
    const year = parseInt(matchMY[2], 10);
    return new Date(year, month, 1).getTime();
  }

  const isoMatch = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])).getTime();
  }

  const brDateMatch = str.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (brDateMatch) {
    return new Date(parseInt(brDateMatch[3]), parseInt(brDateMatch[2]) - 1, parseInt(brDateMatch[1])).getTime();
  }

  const yearOnlyMatch = str.match(/\b(\d{4})\b/);
  if (yearOnlyMatch) {
    return new Date(parseInt(yearOnlyMatch[1]), 0, 1).getTime();
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) return parsed;

  return 0;
}

// ESTADO DOS PROJETOS
let PROJECTS_DATA = [];

// Carregar dados de /data/projects.json ou /api/projects
async function loadProjectsFromServer() {
  function refreshUI() {
    renderAllCards();
    if (document.getElementById("select-existing-post")) {
      populatePostSelector();
      const selectElem = document.getElementById("select-existing-post");
      if (selectElem && selectElem.options.length > 1 && (selectElem.value === "new" || !selectElem.value) && !document.getElementById("input-id").value) {
        selectElem.selectedIndex = 1;
        loadSelectedPostForEdit();
      }
    }
    checkUrlHashAndOpenModal();
  }

  // 1. Tentar carregar do localStorage SE contiver dados válidos
  try {
    const savedLocal = localStorage.getItem("godoy_projects_data");
    if (savedLocal) {
      const parsed = JSON.parse(savedLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        PROJECTS_DATA = parsed.filter(p => p && p.id !== "preview-temp-id");
        PROJECTS_DATA.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
        refreshUI();
      } else {
        localStorage.removeItem("godoy_projects_data");
      }
    }
  } catch (e) { }

  // 2. Tentar API do servidor (/api/projects)
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const serverProjects = await res.json();
      if (Array.isArray(serverProjects) && serverProjects.length > 0) {
        PROJECTS_DATA = serverProjects.filter(p => p && p.id !== "preview-temp-id");
        PROJECTS_DATA.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
        try {
          localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
        } catch (e) { }
        refreshUI();
        return;
      }
    }
  } catch (err) { }

  // 3. Tentar caminhos estáticos para /data/projects.json
  const currentPath = window.location.pathname;
  let relPrefix = "./";
  if (currentPath.includes("/p/")) {
    relPrefix = "../../";
  }

  const jsonPaths = [
    relPrefix + "data/projects.json",
    "./data/projects.json",
    "../data/projects.json",
    "/data/projects.json",
    "data/projects.json"
  ];

  for (const path of jsonPaths) {
    try {
      const jsonRes = await fetch(path);
      if (jsonRes.ok) {
        const localProjects = await jsonRes.json();
        if (Array.isArray(localProjects) && localProjects.length > 0) {
          PROJECTS_DATA = localProjects.filter(p => p && p.id !== "preview-temp-id");
          PROJECTS_DATA.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
          try {
            localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
          } catch (e) { }
          refreshUI();
          return;
        }
      }
    } catch (err) { }
  }

  refreshUI();
}

async function syncProjectsToServer() {
  try {
    const dataToSync = PROJECTS_DATA.filter(p => p && p.id !== "preview-temp-id");
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSync)
    });
  } catch (err) {
    console.error("Erro ao salvar projetos no servidor:", err);
  }
}

// ==========================================================================
// DADOS DA EQUIPE (GODOY & KRISP)
// ==========================================================================
const DEFAULT_TEAM_DATA = [
  {
    "id": "rafael-godoy",
    "name": "Rafael Godoy",
    "nickname": "Godoy",
    "role": "Fundador & Diretoria de Projetos",
    "badge": "👑 Fundador & Mainstream",
    "avatar": "https://i.imgur.com/OgaeHFx.png",
    "status": "Em Atividade",
    "bio": "Fundador e linha de frente do Godoy Mods. Responsável pelo contato com a comunidade, visão geral de projetos e divulgação, além de atuar ativamente na produção de dublagens PT-BR via IA, manipulação de áudio ADPCM/VAG e ports para PC, PS2, PS3, Xbox 360 e Android.",
    "specialties": ["Direção de Projetos", "Dublagens com IA", "Modding Consoles", "Comunidade & Mídia"],
    "projectsCount": "10+ Mods",
    "socials": {
      "discord": "https://discord.com/invite/atFQmmR2fy",
      "youtube": "https://www.youtube.com/@Godoyy",
      "github": "https://github.com/RafaelGodoyEbert",
      "twitter": "https://twitter.com/GodoyEbert"
    }
  },
  {
    "id": "krisp",
    "name": "Krisp",
    "nickname": "Krisp",
    "role": "Cérebro Técnico & Lead Reverse Engineer",
    "badge": "🧠 Cérebro Técnico",
    "avatar": "https://imgur.com/l5vqXKF.jpeg",
    "status": "Em Atividade",
    "bio": "Cérebro técnico responsável pela arquitetura avançada de engenharia reversa no Godoy Mods. Desenvolve ferramentas customizadas para codecs proprietários de áudio da EA e formatos da Ubisoft. Entre seus destaques de modding, realizou o port completo do jogo Undertale do PS4 para PS3.",
    "specialties": ["Engenharia Reversa", "Codecs da EA & Ubisoft", "Port PS4 → PS3", "Ferramentas de Áudio"],
    "projectsCount": "Lead Engineer",
    "socials": {
      "twitter": "https://x.com/Krisp0o",
      "steam": "https://steamcommunity.com/id/thekrisp/",
      "discord": "https://discord.com/invite/atFQmmR2fy"
    }
  }
];

let TEAM_DATA = [];

try {
  const savedTeam = localStorage.getItem("godoy_team_data");
  if (savedTeam) {
    const parsed = JSON.parse(savedTeam);
    if (Array.isArray(parsed) && parsed.length > 0) {
      TEAM_DATA = parsed;
    } else {
      TEAM_DATA = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA));
    }
  } else {
    TEAM_DATA = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA));
  }
} catch (e) {
  TEAM_DATA = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA));
}

async function loadTeamFromServer() {
  try {
    const res = await fetch("/api/team");
    if (res.ok) {
      const serverTeam = await res.json();
      if (Array.isArray(serverTeam) && serverTeam.length > 0) {
        TEAM_DATA = serverTeam;
        try {
          localStorage.setItem("godoy_team_data", JSON.stringify(TEAM_DATA));
        } catch (e) { }
        renderTeamCards();
        if (document.getElementById("select-team-member")) {
          populateTeamSelector();
        }
        return;
      }
    }
  } catch (err) {
    console.warn("API de equipe indisponível:", err);
  }

  try {
    const jsonRes = await fetch("./data/team.json");
    if (jsonRes.ok) {
      const localTeam = await jsonRes.json();
      if (Array.isArray(localTeam) && localTeam.length > 0) {
        TEAM_DATA = localTeam;
        try {
          localStorage.setItem("godoy_team_data", JSON.stringify(TEAM_DATA));
        } catch (e) { }
        renderTeamCards();
        if (document.getElementById("select-team-member")) {
          populateTeamSelector();
        }
        return;
      }
    }
  } catch (err) {
    console.warn("Arquivo ./data/team.json não pôde ser lido:", err);
  }
  renderTeamCards();
}

async function syncTeamToServer() {
  try {
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEAM_DATA)
    });
  } catch (err) {
    console.error("Erro ao salvar equipe no servidor:", err);
  }
}

let activeStatusFilter = "all";
let activePlatformFilter = "all";
let activeSubtagFilter = "all";
let activeSearchQuery = "";
let currentTab = "devlogs";
let currentOutputFormat = "js";
let lastSubmittedOrderSummary = "";

// ESTADO GLOBAL DE FERRAMENTAS
let TOOLS_DATA = [];
let activeToolsCategory = "all";

// ANIMAÇÃO DE INTRODUÇÃO AO CARREGAR A PÁGINA
function animateOnLoad() {
  if (typeof anime === 'undefined') return;

  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.style.opacity = '0';
    anime({
      targets: sidebar,
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 850,
      easing: 'easeOutCubic',
      delay: 50
    });
  }

  const mainHeader = document.querySelector(".main-header");
  const filterToolbar = document.querySelector(".filter-toolbar");
  const navTabs = document.querySelector(".nav-tabs-wrapper");

  const headersToAnimate = [mainHeader, filterToolbar, navTabs].filter(Boolean);
  if (headersToAnimate.length > 0) {
    headersToAnimate.forEach(el => {
      el.style.opacity = '0';
    });
    anime({
      targets: headersToAnimate,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 650,
      easing: 'easeOutQuad',
      delay: anime.stagger(100, { start: 200 })
    });
  }
}

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initNavTabsScroll();

  await loadProjectsFromServer();
  await loadTeamFromServer();
  await loadToolsFromServer();

  renderAllCards();
  renderTeamCards();
  animateOnLoad();

  window.addEventListener("hashchange", checkUrlHashAndOpenModal);

  // Fechar modal com tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePostModal();
    }
  });

  // Se estiver na subpágina de criador/editor
  if (document.getElementById("select-existing-post")) {
    initGeneratorPage();
  }
});

function initNavTabsScroll() {
  const navTabs = document.getElementById("main-nav-tabs");
  if (navTabs) {
    navTabs.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        navTabs.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }
}

// LOGICA DE TEMA (MODO CLARO E ESCURO DISCRETO)
function initTheme() {
  const savedTheme = localStorage.getItem("godoy_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleThemeQuick() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("godoy_theme", next);
  updateThemeIcon(next);

  // Spin and bounce animation on theme toggle buttons
  if (typeof anime !== 'undefined') {
    const btns = document.querySelectorAll("#theme-toggle-btn, .icon-btn-header");
    if (btns.length > 0) {
      anime.remove(btns);
      anime({
        targets: btns,
        rotate: '+=360',
        scale: [1, 1.25, 1],
        duration: 550,
        easing: 'easeInOutBack'
      });
    }
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro";
  }
}

// ALTERNAR TABS
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle("active", isActive);
    if (isActive) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  });

  // Mostrar/Ocultar o Painel de Filtros dependendo da Aba Ativa
  const filterPanel = document.getElementById("main-filter-panel");
  if (filterPanel) {
    if (tabId === "contact" || tabId === "team" || tabId === "tools") {
      filterPanel.style.display = "none";
    } else {
      filterPanel.style.display = "flex";
    }
  }

  // Mapear abas de status legado para a aba unificada de projetos
  let targetPaneId = tabId;
  if (["completed", "ongoing", "paid", "archived", "abandoned"].includes(tabId)) {
    targetPaneId = "projects";
    activeStatusFilter = tabId;
    document.querySelectorAll("#status-filter-pills .pill-btn").forEach(btn => {
      btn.classList.toggle("active", (btn.dataset.status || "") === tabId);
    });
  }

  document.querySelectorAll(".tab-pane").forEach(pane => {
    const isTarget = pane.id === `pane-${targetPaneId}`;
    if (isTarget) {
      if (!pane.classList.contains("active")) {
        pane.classList.add("active");
        if (typeof anime !== 'undefined') {
          anime.remove(pane);
          pane.style.opacity = '0';
          pane.style.transform = 'translateY(15px)';
          anime({
            targets: pane,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 400,
            easing: 'easeOutQuad'
          });
        }
      }
    } else {
      pane.classList.remove("active");
    }
  });

  renderAllCards();
  if (tabId === "team") {
    renderTeamCards();
  }
  if (tabId === "tools") {
    renderToolsCards();
  }
}

// HELPERS DE FILTRAGEM
function checkMatchStatus(item, filterKey) {
  if (!filterKey || filterKey === "all") return true;
  return item.type === filterKey;
}

function checkMatchSubtag(item, filterKey) {
  if (!filterKey || filterKey === "all") return true;
  const key = filterKey.toLowerCase().trim();
  const subtagStr = (item.subtag || "").toLowerCase();
  const titleStr = (item.title || "").toLowerCase();
  const descStr = (item.description || "").toLowerCase();

  if (key === "dublado") {
    return subtagStr.includes("dublad") || titleStr.includes("dublad") || descStr.includes("dublad");
  }
  if (key === "legendado") {
    return subtagStr.includes("legendad") || subtagStr.includes("tradu") || titleStr.includes("legendad") || titleStr.includes("tradu");
  }
  if (key === "port") {
    return subtagStr.includes("port") || titleStr.includes("port") || descStr.includes("port");
  }
  if (key === "ia") {
    return subtagStr.includes("ia") || subtagStr.includes("inteligência") || titleStr.includes("ia");
  }
  return subtagStr.includes(key);
}

function checkMatchPlatform(item, filterKey) {
  if (!filterKey || filterKey === "all") return true;
  const key = filterKey.toLowerCase().trim();

  const platformStr = (item.platform || "").toLowerCase();
  const tagsArr = (item.tags || []).map(t => t.toLowerCase());
  const titleStr = (item.title || "").toLowerCase();
  const descStr = (item.description || "").toLowerCase();
  const contentStr = (item.content || "").toLowerCase();

  if (key === "android") {
    return platformStr.includes("android") ||
      tagsArr.includes("android") ||
      descStr.includes("android") ||
      titleStr.includes("android") ||
      contentStr.includes("android");
  }

  if (key === "pc") {
    return platformStr.includes("pc") ||
      tagsArr.includes("pc") ||
      descStr.includes("pc") ||
      titleStr.includes("pc");
  }

  if (key === "ps2" || key === "playstation 2") {
    return platformStr.includes("ps2") || platformStr.includes("playstation 2") ||
      tagsArr.includes("ps2") || tagsArr.includes("playstation 2") ||
      descStr.includes("ps2") || descStr.includes("playstation 2");
  }

  if (key === "ps3" || key === "playstation 3") {
    return platformStr.includes("ps3") || platformStr.includes("playstation 3") ||
      tagsArr.includes("ps3") || tagsArr.includes("playstation 3") ||
      descStr.includes("ps3") || descStr.includes("playstation 3");
  }

  if (key === "xbox 360" || key === "xbox") {
    return platformStr.includes("xbox") ||
      tagsArr.includes("xbox 360") || tagsArr.includes("xbox") ||
      descStr.includes("xbox");
  }

  return platformStr.includes(key) || tagsArr.some(t => t.includes(key));
}

// HANDLERS DE FILTROS COMPACTOS (DROPDOWNS INTELIGENTES)
function setStatusFilter(status) {
  activeStatusFilter = status;
  const sel = document.getElementById("select-status-filter");
  if (sel && sel.value !== status) sel.value = status;

  if (currentTab !== "projects" && currentTab !== "devlogs") {
    switchTab("projects");
  }

  renderAllCards();
}

function setPlatformFilter(platform) {
  activePlatformFilter = platform;
  const sel = document.getElementById("select-platform-filter");
  if (sel && sel.value !== platform) sel.value = platform;
  renderAllCards();
}

function setSubtagFilter(subtag) {
  activeSubtagFilter = subtag;
  const sel = document.getElementById("select-subtag-filter");
  if (sel && sel.value !== subtag) sel.value = subtag;
  renderAllCards();
}

function clearAllFilters() {
  activeStatusFilter = "all";
  activePlatformFilter = "all";
  activeSubtagFilter = "all";

  const selStatus = document.getElementById("select-status-filter");
  const selPlatform = document.getElementById("select-platform-filter");
  const selSubtag = document.getElementById("select-subtag-filter");
  if (selStatus) selStatus.value = "all";
  if (selPlatform) selPlatform.value = "all";
  if (selSubtag) selSubtag.value = "all";

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    activeSearchQuery = "";
  }

  renderAllCards();
}

function setFilter(platform) {
  setPlatformFilter(platform);
}

function setPresetSubtag(val) {
  const elem = document.getElementById("input-subtag");
  if (elem) {
    elem.value = val;
    updateGeneratorPreview();
  }
}

// BUSCA
function handleSearch(query) {
  activeSearchQuery = query.toLowerCase().trim();
  renderAllCards();
  if (currentTab === "tools") {
    renderToolsCards();
  }
}

// ==========================================================================
// CENTRAL DE FERRAMENTAS (TOOLS HUB)
// ==========================================================================

async function loadToolsFromServer() {
  try {
    const apiRes = await fetch("/api/tools");
    if (apiRes.ok) {
      const dataApi = await apiRes.json();
      if (Array.isArray(dataApi) && dataApi.length > 0) {
        TOOLS_DATA = dataApi;
        updateToolsBadges();
        renderToolsCards();
        return;
      }
    }
  } catch (err) {
    console.warn("API de ferramentas indisponível, tentando arquivos estáticos:", err);
  }

  try {
    const res = await fetch("./data/tools.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        TOOLS_DATA = data;
        updateToolsBadges();
        renderToolsCards();
        return;
      }
    }
  } catch (err) {
    console.warn("Não foi possível carregar ./data/tools.json:", err);
  }

  try {
    const resRoot = await fetch("./tools.json");
    if (resRoot.ok) {
      const dataRoot = await resRoot.json();
      if (Array.isArray(dataRoot) && dataRoot.length > 0) {
        TOOLS_DATA = dataRoot;
        updateToolsBadges();
        renderToolsCards();
        return;
      }
    }
  } catch (err) {
    console.warn("Não foi possível carregar ./tools.json:", err);
  }

  renderToolsCards();
}

function updateToolsBadges() {
  const badgeTools = document.getElementById("badge-tools");
  const countAll = document.getElementById("tools-count-all");
  const countCreated = document.getElementById("tools-count-created");
  const countRec = document.getElementById("tools-count-recommended");
  const countWork = document.getElementById("tools-count-workflow");

  const total = TOOLS_DATA.length;
  const created = TOOLS_DATA.filter(t => t.category === "created").length;
  const rec = TOOLS_DATA.filter(t => t.category === "recommended").length;
  const work = TOOLS_DATA.filter(t => t.category === "workflow").length;

  if (badgeTools) badgeTools.textContent = total;
  if (countAll) countAll.textContent = total;
  if (countCreated) countCreated.textContent = created;
  if (countRec) countRec.textContent = rec;
  if (countWork) countWork.textContent = work;
}

function filterToolsCategory(catId) {
  activeToolsCategory = catId;

  document.querySelectorAll(".tools-cat-btn").forEach(btn => {
    const isCat = btn.dataset.cat === catId;
    btn.classList.toggle("active", isCat);
  });

  renderToolsCards();
}

function renderToolsCards() {
  const container = document.getElementById("grid-tools");
  if (!container) return;

  // Combinar ferramentas de data/tools.json com publicações de tipo 'tool'
  const combinedToolsMap = new Map();
  
  TOOLS_DATA.forEach(t => combinedToolsMap.set(t.id, t));
  if (Array.isArray(PROJECTS_DATA)) {
    PROJECTS_DATA.filter(p => p.type === "tool" || (p.subtag && p.subtag.toLowerCase().includes("ferramenta"))).forEach(p => {
      if (!combinedToolsMap.has(p.id)) {
        combinedToolsMap.set(p.id, {
          id: p.id,
          category: p.category || "created",
          title: p.title,
          description: p.description,
          icon: p.icon || "🛠️",
          image: p.image || "",
          tags: p.tags || ["Ferramenta"],
          badge: p.badge || p.subtag || "Ferramenta",
          badgeColor: p.badgeColor || "primary",
          url: p.downloadUrl || p.url || "",
          buttonText: "Acessar Ferramenta",
          content: p.content || ""
        });
      }
    });
  }

  const allToolsList = Array.from(combinedToolsMap.values());

  let filtered = allToolsList.filter(t => {
    if (activeToolsCategory !== "all" && t.category !== activeToolsCategory) {
      return false;
    }
    if (activeSearchQuery) {
      const title = (t.title || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const tags = (t.tags || []).join(" ").toLowerCase();
      const badge = (t.badge || "").toLowerCase();
      return title.includes(activeSearchQuery) || desc.includes(activeSearchQuery) || tags.includes(activeSearchQuery) || badge.includes(activeSearchQuery);
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 12px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛠️</div>
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px;">Nenhuma ferramenta encontrada</h3>
        <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 16px auto;">Não encontramos nenhuma ferramenta com a categoria ou termo pesquisado.</p>
        <button class="btn-secondary" onclick="filterToolsCategory('all'); clearAllFilters();">Mostrar Todas as Ferramentas</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(tool => {
    const badgeClass = tool.badgeColor ? `tool-badge-${tool.badgeColor}` : "tool-badge-default";
    const tagsHTML = (tool.tags || []).map(tag => `<span class="tool-tag">${tag}</span>`).join("");
    const iconHTML = tool.image 
      ? `<img src="${tool.image}" alt="${tool.title}" class="tool-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="tool-card-icon-fallback" style="display:none;">${tool.icon || "🛠️"}</div>`
      : `<div class="tool-card-icon-fallback">${tool.icon || "🛠️"}</div>`;

    const targetUrl = tool.url || tool.downloadUrl || "";
    const isExternal = targetUrl.startsWith("http");

    return `
      <div class="tool-card" onclick="openPostModal('${tool.id}')" style="cursor: pointer;">
        <div class="tool-card-header">
          <div class="tool-icon-wrapper">
            ${iconHTML}
          </div>
          <div class="tool-header-info">
            <span class="tool-badge ${badgeClass}">${tool.badge || "Ferramenta"}</span>
            <h3 class="tool-card-title">${tool.title}</h3>
          </div>
        </div>

        <p class="tool-card-desc">${tool.description}</p>

        <div class="tool-card-tags">
          ${tagsHTML}
        </div>

        <div class="tool-card-footer" onclick="event.stopPropagation()" style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
          <button class="btn-secondary" onclick="openPostModal('${tool.id}')" style="font-size: 0.8rem; padding: 7px 12px; flex: 1; justify-content: center; font-weight: 700; white-space: nowrap;">
            📖 Ver Matéria
          </button>
          ${targetUrl ? `
            <a href="${targetUrl}" target="${isExternal ? '_blank' : '_self'}" rel="noopener" class="tool-action-btn" style="width: auto; padding: 7px 14px; white-space: nowrap; font-size: 0.8rem;">
              ${tool.buttonText || "Acessar"} ${isExternal ? "↗" : "➔"}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");

  if (typeof triggerGridStaggerAnimation === 'function') {
    triggerGridStaggerAnimation();
  }
}

// STAGGER CARD CASCADE ANIMATION WITH ANIME.JS
function triggerGridStaggerAnimation() {
  if (typeof anime === 'undefined') return;

  const activePane = document.querySelector(".tab-pane.active");
  if (!activePane) return;

  const cards = activePane.querySelectorAll(".card, .team-card");
  if (cards.length === 0) return;

  anime.remove(cards);

  // Set initial states to avoid flicker
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px) scale(0.97)';
  });

  anime({
    targets: cards,
    opacity: [0, 1],
    translateY: [20, 0],
    scale: [0.97, 1],
    delay: anime.stagger(45, { start: 50 }),
    duration: 550,
    easing: 'easeOutCubic'
  });
}

// RENDERIZAR CARDS NO GRID
function renderAllCards() {
  const devlogsGrid = document.getElementById("grid-devlogs");
  const projectsGrid = document.getElementById("grid-projects");
  const completedGrid = document.getElementById("grid-completed");
  const ongoingGrid = document.getElementById("grid-ongoing");
  const paidGrid = document.getElementById("grid-paid");
  const archivedGrid = document.getElementById("grid-archived");
  const abandonedGrid = document.getElementById("grid-abandoned");

  // Garantir ordenação cronológica rigorosa (posts mais recentes primeiro)
  const sortedData = [...PROJECTS_DATA].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));

  // Badge da Aba Catálogo de Projetos
  const bProjects = document.getElementById("badge-projects");
  if (bProjects) bProjects.textContent = sortedData.filter(i => i.type !== "devlog").length;

  updateHeroTeamStats();

  // Filtragem Global Combinada (Status + Plataforma + Subtag + Busca)
  const filtered = sortedData.filter(item => {
    const matchStatus = checkMatchStatus(item, activeStatusFilter);
    const matchPlatform = checkMatchPlatform(item, activePlatformFilter);
    const matchSubtag = checkMatchSubtag(item, activeSubtagFilter);
    const matchSearch = !activeSearchQuery ||
      item.title.toLowerCase().includes(activeSearchQuery) ||
      item.description.toLowerCase().includes(activeSearchQuery) ||
      (item.subtag && item.subtag.toLowerCase().includes(activeSearchQuery)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(activeSearchQuery)));
    return matchStatus && matchPlatform && matchSubtag && matchSearch;
  });

  const devlogItems = filtered.filter(i => i.type === "devlog");
  const projectItems = filtered.filter(i => i.type !== "devlog");

  // Atualizar Contador de Resultados
  const countNumElem = document.getElementById("results-count-num");
  if (countNumElem) {
    if (currentTab === "devlogs") {
      countNumElem.textContent = devlogItems.length;
    } else if (currentTab === "projects" || ["completed", "ongoing", "paid", "archived", "abandoned"].includes(currentTab)) {
      countNumElem.textContent = projectItems.length;
    } else {
      countNumElem.textContent = filtered.length;
    }
  }

  // Alternar Visibilidade do Botão Limpar Filtros
  const btnClear = document.getElementById("btn-clear-filters");
  if (btnClear) {
    const hasActiveFilters = activeStatusFilter !== "all" ||
      activePlatformFilter !== "all" ||
      activeSubtagFilter !== "all" ||
      activeSearchQuery !== "";
    btnClear.style.display = hasActiveFilters ? "inline-flex" : "none";
  }

  if (devlogsGrid) {
    devlogsGrid.innerHTML = devlogItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (projectsGrid) {
    projectsGrid.innerHTML = projectItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (completedGrid) {
    const completedItems = filtered.filter(i => i.type === "completed");
    completedGrid.innerHTML = completedItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (ongoingGrid) {
    const ongoingItems = filtered.filter(i => i.type === "ongoing");
    ongoingGrid.innerHTML = ongoingItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (paidGrid) {
    const paidItems = filtered.filter(i => i.type === "paid");
    paidGrid.innerHTML = paidItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (archivedGrid) {
    const archivedItems = filtered.filter(i => i.type === "archived");
    archivedGrid.innerHTML = archivedItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (abandonedGrid) {
    const abandonedItems = filtered.filter(i => i.type === "abandoned");
    abandonedGrid.innerHTML = abandonedItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  // Trigger Anime.js stagger cascade
  triggerGridStaggerAnimation();
}

function createCardHTML(item) {
  let statusBadge = "";
  let progressBarHTML = "";

  if (item.type === "completed") {
    statusBadge = `<span class="card-status-tag status-completed">✅ Concluído</span>`;
  } else if (item.type === "ongoing") {
    const progressVal = item.progress || 50;

    // Sistema de semáforo (Traffic light color system based on progress)
    let ongoingClass = "status-ongoing-yellow";
    let percentClass = "progress-percent-val-yellow";
    let fillClass = "card-progress-fill-yellow";

    if (progressVal < 40) {
      ongoingClass = "status-ongoing-red";
      percentClass = "progress-percent-val-red";
      fillClass = "card-progress-fill-red";
    } else if (progressVal >= 80) {
      ongoingClass = "status-ongoing-green";
      percentClass = "progress-percent-val-green";
      fillClass = "card-progress-fill-green";
    }

    // Removendo o '%' conforme solicitado pelo usuário
    statusBadge = `<span class="card-status-tag ${ongoingClass}">⚙️ ${progressVal}</span>`;
    progressBarHTML = `
      <div class="card-progress-wrapper">
        <div class="card-progress-header">
          <span class="progress-label">⚙️ Progresso da Dublagem</span>
          <span class="progress-percent-val ${percentClass}">${progressVal}</span>
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill ${fillClass}" style="width: ${progressVal}%;"></div>
        </div>
      </div>
    `;
  } else if (item.type === "paid") {
    statusBadge = `<span class="card-status-tag status-paid">💰 Pago / Financiado</span>`;
  } else if (item.type === "archived") {
    statusBadge = `<span class="card-status-tag status-archived">📦 Arquivado</span>`;
  } else if (item.type === "abandoned") {
    statusBadge = `<span class="card-status-tag status-abandoned">🚫 Abandonado</span>`;
  } else {
    statusBadge = `<span class="card-status-tag status-devlog">📰 Devlog</span>`;
  }

  let subtagBadgeHTML = "";
  if (item.subtag) {
    let subIcon = "🏷️";
    const stLower = item.subtag.toLowerCase();
    if (stLower.includes("dublad") && stLower.includes("ia")) subIcon = "🤖";
    else if (stLower.includes("dublad")) subIcon = "🎙️";
    else if (stLower.includes("legendad") || stLower.includes("tradu")) subIcon = "📝";
    else if (stLower.includes("port")) subIcon = "🔄";

    subtagBadgeHTML = `<span class="subtag-badge" title="Tipo: ${item.subtag}">${subIcon} ${item.subtag}</span>`;
  }

  const isDevlog = item.type === "devlog";
  const tagsHTML = (item.tags || []).map(t => {
    const link = !isDevlog && ((item.tagLinks && item.tagLinks[t]) || (item.platformDownloads && item.platformDownloads[t]));
    if (link) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="tag-badge tag-badge-link" onclick="event.stopPropagation();" title="Baixar mod para ${t}">${t}</a>`;
    }
    return `<span class="tag-badge">${t}</span>`;
  }).join("");

  const periodBadgeHTML = item.projectPeriod ? `<div class="card-project-period" title="Período do Projeto (Início & Conclusão)">⏳ ${item.projectPeriod}</div>` : "";

  return `
    <article class="card card-clickable" onclick="openPostModal('${item.id}')">
      <div class="card-media">
        <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer" style="object-position: ${item.imagePosition || item.imagePos || 'center'};" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';">
        <div class="card-media-overlay"></div>
        ${statusBadge}
      </div>
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
          <span class="card-date">📅 ${item.date} • ${item.platform}</span>
          ${subtagBadgeHTML}
        </div>
        ${periodBadgeHTML}
        <h3 class="card-title">
          <a href="javascript:void(0)" class="card-title-link" onclick="openPostModal('${item.id}'); event.stopPropagation();">${item.title}</a>
        </h3>
        <p class="card-description">${item.description}</p>
        ${progressBarHTML}
        <div class="card-tags">
          ${tagsHTML}
        </div>
      </div>
    </article>
  `;
}

function getEmptyHTML() {
  return `
    <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
      <p style="font-size: 1.1rem; font-weight: 600;">Nenhum item encontrado.</p>
      <p style="font-size: 0.85rem; margin-top: 4px;">Tente alterar os filtros de busca, plataforma ou tipo de dublagem/legendas.</p>
    </div>
  `;
}

// FORMATADOR DE CONTEÚDO TIPO BLOG (HTML, YOUTUBE, IFRAME, IMAGENS)
function formatBlogContent(rawContent) {
  if (!rawContent) return "";
  let text = String(rawContent);

  // 1. Limpar e sanitizar sequências de escapamento literais tipo "\\n" ou "\n" quando vindas de JSON ou edição crua
  text = text.replace(/\\n/g, "\n");

  // 2. Converter URLs diretas do YouTube em players iframes embutidos (caso o usuário cole o link do YouTube direto sem iframe)
  // Exemplo: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID ou https://www.youtube.com/embed/VIDEO_ID
  const ytRegex = /(^|>|\s)(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<"']*)?)(?=<|\s|$)/gi;
  text = text.replace(ytRegex, (match, prefix, fullUrl, videoId) => {
    return `${prefix}<div class="blog-embed-container"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  });

  // 3. Garantir que apenas vídeos (YouTube, Vimeo, etc.) estejam envoltos em div responsiva 16:9 .blog-embed-container
  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const iframes = doc.querySelectorAll("iframe");
      iframes.forEach(iframe => {
        const src = (iframe.getAttribute("src") || "").toLowerCase();
        const isVideoEmbed = src.includes("youtube") || src.includes("youtu.be") || src.includes("vimeo") || src.includes("dailymotion");
        if (isVideoEmbed && !iframe.parentElement.classList.contains("blog-embed-container")) {
          const wrapper = doc.createElement("div");
          wrapper.className = "blog-embed-container";
          iframe.parentNode.insertBefore(wrapper, iframe);
          wrapper.appendChild(iframe);
        }
      });

      // 4. Se o texto não contiver tags de bloco HTML (p, div, h1-6, ul, ol, blockquote, iframe, etc.),
      // converter quebras de linha duplas em parágrafos e simples em <br>
      const hasBlockTags = /<(p|div|h[1-6]|ul|ol|li|blockquote|table|figure|iframe|section|article)\b/i.test(text);
      if (!hasBlockTags) {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`).join("\n");
      }

      return doc.body.innerHTML;
    } catch (e) {
      console.warn("Erro ao formatar HTML do blog com DOMParser:", e);
    }
  }

  return text;
}

// OTIMIZADOR DE IMAGEM PARA WEB (COMPRESSÃO E REDIMENSIONAMENTO NO NAVEGADOR)
async function optimizeImageForWeb(file, maxWidth = 1600, maxHeight = 1600, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;

  // Se o arquivo já for super leve (<= 150KB), não precisa otimizar
  if (file.size <= 150 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const originalKb = (file.size / 1024).toFixed(0);
            const optKb = (blob.size / 1024).toFixed(0);
            console.log(`⚡ Imagem otimizada no navegador: ${originalKb}KB ➔ ${optKb}KB`);
            const optimizedFile = new File([blob], file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "image.jpg", {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

let isUploadingImage = false;

// HELPER PARA INSERÇÃO E UPLOAD DE IMAGEM NO CORPO DO BLOG (gerador.html)
async function uploadImageFile(file) {
  if (!file) return null;
  if (isUploadingImage) {
    showToast("⏳ Aguarde! Já existe uma imagem sendo processada e enviada...", "warning");
    return null;
  }

  isUploadingImage = true;

  // Atualizar miniatura do Gerador com indicador de carregamento
  const thumbPlaceholder = document.getElementById("image-thumb-placeholder");
  const thumbImg = document.getElementById("image-thumb-img");
  const origPlaceholderText = thumbPlaceholder ? thumbPlaceholder.innerHTML : "Capa";

  if (thumbPlaceholder) {
    thumbPlaceholder.innerHTML = "⏳<br><span style='font-size:0.6rem;'>Enviando...</span>";
    if (thumbImg) thumbImg.style.display = "none";
  }

  showToast("⚙️ Otimizando foto para web e enviando...", "info");

  const config = (typeof window !== "undefined" && window.GODOY_CONFIG) ? window.GODOY_CONFIG : {};
  const uploadcareKey = config.UPLOADCARE_PUB_KEY || "demopublickey";
  const imgurClientId = config.IMGUR_CLIENT_ID || "54642c239c58f1a";
  const uploadcareUrl = config.UPLOADCARE_API_URL || "https://upload.uploadcare.com/base/";
  const catboxUrl = config.CATBOX_API_URL || "https://catbox.moe/user/api.php";
  const imgurUrl = config.IMGUR_API_URL || "https://api.imgur.com/3/image";

  let uploadedResultUrl = null;

  try {
    // 1. Otimizar e comprimir a foto no navegador antes de enviar
    const optimizedFile = await optimizeImageForWeb(file);

    // 2. Servidor 1: Uploadcare CDN (Hospedagem Permanente, Global CDN, livre de CORS)
    try {
      const formData = new FormData();
      formData.append("UPLOADCARE_PUB_KEY", uploadcareKey);
      formData.append("UPLOADCARE_STORE", "1");
      formData.append("file", optimizedFile, optimizedFile.name || "cover.jpg");

      const res = await fetch(uploadcareUrl, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.file) {
          const fileName = (optimizedFile.name || "cover.jpg").replace(/[^a-zA-Z0-9_.-]/g, "_");
          const directLink = `https://ucarecdn.com/${json.file}/${fileName}`;
          showToast("✅ Imagem hospedada com sucesso em CDN permanente!", "success");
          uploadedResultUrl = directLink;
        }
      }
    } catch (err) {
      console.warn("Uploadcare falhou, tentando Catbox...", err);
    }

    // 3. Servidor 2: Catbox.moe API se Uploadcare falhar
    if (!uploadedResultUrl) {
      try {
        const formData = new FormData();
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", optimizedFile);
        const res = await fetch(catboxUrl, {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const url = (await res.text()).trim();
          if (url.startsWith("http")) {
            showToast("✅ Imagem hospedada no Catbox com sucesso!", "success");
            uploadedResultUrl = url;
          }
        }
      } catch (err) {
        console.warn("Catbox falhou, tentando Imgur...", err);
      }
    }

    // 4. Servidor 3: Imgur API se Catbox falhar
    if (!uploadedResultUrl) {
      try {
        const formData = new FormData();
        formData.append("image", optimizedFile);
        const res = await fetch(imgurUrl, {
          method: "POST",
          headers: { Authorization: `Client-ID ${imgurClientId}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.link) {
            showToast("✅ Imagem hospedada no Imgur com sucesso!", "success");
            uploadedResultUrl = data.data.link;
          }
        }
      } catch (err) {
        console.warn("Imgur falhou...", err);
      }
    }

    // 5. Se todos os servidores remotos falharem:
    if (!uploadedResultUrl) {
      showToast("❌ Falha na hospedagem remota em todos os servidores (TmpFiles, Catbox, Imgur). Tente novamente.", "error");
    }

  } finally {
    isUploadingImage = false;
    if (thumbPlaceholder) {
      thumbPlaceholder.innerHTML = origPlaceholderText;
    }
  }

  return uploadedResultUrl;
}

async function handleContentImageUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const uploadedUrl = await uploadImageFile(file);
  if (uploadedUrl) {
    insertImageToContent(uploadedUrl, file.name);
  }
  e.target.value = "";
}

function insertImageToContent(imageUrl, defaultCaption = "") {
  const textarea = document.getElementById("input-content");
  if (!textarea) return;

  const caption = prompt("Insira uma legenda para a imagem (opcional):", defaultCaption) || "";
  let snippet = "";
  if (caption) {
    snippet = `\n<figure class="blog-figure">\n  <img src="${imageUrl}" alt="${caption}">\n  <figcaption>${caption}</figcaption>\n</figure>\n`;
  } else {
    snippet = `\n<img src="${imageUrl}" alt="Imagem do Post">\n`;
  }

  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const val = textarea.value;

  textarea.value = val.substring(0, start) + snippet + val.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
  textarea.focus();

  updateGeneratorPreview();
  showToast("📷 Imagem inserida no corpo do post!", "success");
}

function setupEditorDragDropAndPaste() {
  if (typeof window === "undefined") return;

  // Registrar escutador global do evento 'paste' (Ctrl+V) no Gerador de Posts
  if (!window.datasetGlobalPasteBound) {
    window.datasetGlobalPasteBound = true;
    window.addEventListener("paste", async (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      let imageItem = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          imageItem = items[i];
          break;
        }
      }

      if (!imageItem) return;

      if (isUploadingImage) {
        showToast("⏳ Aguarde! Uma foto já está sendo enviada...", "warning");
        return;
      }

      const activeElem = document.activeElement;
      const isContentEditor = activeElem && activeElem.id === "input-content";

      e.preventDefault();
      const blob = imageItem.getAsFile();
      if (!blob) return;

      const uploadedUrl = await uploadImageFile(blob);

      if (uploadedUrl) {
        if (isContentEditor) {
          insertImageToContent(uploadedUrl, "Print colado");
        } else {
          const imgInput = document.getElementById("input-image");
          if (imgInput) {
            imgInput.value = uploadedUrl;
            updateGeneratorPreview();

            // Extrair a cor automaticamente do print colado
            extractColorFromImage(uploadedUrl, (extractedHex) => {
              if (extractedHex) {
                const colorInput = document.getElementById("input-theme-color");
                const colorPicker = document.getElementById("input-theme-color-picker");
                if (colorInput) colorInput.value = extractedHex;
                if (colorPicker) colorPicker.value = extractedHex;
                updateGeneratorPreview();
              }
            });
            showToast("📸 Print da área de transferência definido como Imagem de Capa!", "success");
          }
        }
      }
    });
  }

  const textarea = document.getElementById("input-content");
  if (!textarea || textarea.dataset.dragPasteBound) return;
  textarea.dataset.dragPasteBound = "true";

  // Suporte a Arrastar e Soltar (Drag & Drop) de arquivos de foto
  textarea.addEventListener("dragover", (e) => {
    e.preventDefault();
    textarea.style.borderColor = "var(--accent-primary)";
    textarea.style.backgroundColor = "var(--bg-badge)";
  });

  textarea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    textarea.style.borderColor = "";
    textarea.style.backgroundColor = "";
  });

  textarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    textarea.style.borderColor = "";
    textarea.style.backgroundColor = "";

    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const uploadedUrl = await uploadImageFile(file);
        if (uploadedUrl) {
          insertImageToContent(uploadedUrl, file.name);
        }
      }
    }
  });
}

function insertContentSnippet(snippetType) {
  const textarea = document.getElementById("input-content");
  if (!textarea) return;

  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const selectedText = textarea.value.substring(start, end);
  let replacement = "";

  if (snippetType === "iframe" || snippetType === "video") {
    const urlOrIframe = prompt("Insira o link do YouTube (ex: https://www.youtube.com/watch?v=...) ou o código do <iframe>:");
    if (!urlOrIframe) return;
    let embedSrc = urlOrIframe.trim();
    const ytMatch = embedSrc.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    if (embedSrc.startsWith("<iframe")) {
      replacement = `\n<div class="blog-embed-container">\n  ${embedSrc}\n</div>\n`;
    } else {
      replacement = `\n<div class="blog-embed-container">\n  <iframe src="${embedSrc}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>\n</div>\n`;
    }
  } else if (snippetType === "image") {
    const imgUrl = prompt("Insira o URL da imagem (http://... ou https://...):");
    if (!imgUrl) return;
    const caption = prompt("Insira a legenda para a imagem (opcional):") || "";
    if (caption) {
      replacement = `\n<figure class="blog-figure">\n  <img src="${imgUrl}" alt="${caption}">\n  <figcaption>${caption}</figcaption>\n</figure>\n`;
    } else {
      replacement = `\n<img src="${imgUrl}" alt="Imagem do Blog">\n`;
    }
  } else if (snippetType === "subtitle") {
    const titleText = selectedText || "Título da Seção";
    replacement = `\n<h3 class="blog-subtitle">${titleText}</h3>\n`;
  } else if (snippetType === "paragraph") {
    const pText = selectedText || "Escreva seu parágrafo aqui...";
    replacement = `\n<p>${pText}</p>\n`;
  } else if (snippetType === "list") {
    replacement = `\n<ul>\n  <li>Primeiro item da lista</li>\n  <li>Segundo item da lista</li>\n</ul>\n`;
  } else if (snippetType === "quote") {
    const qText = selectedText || "Citação em destaque...";
    replacement = `\n<blockquote>${qText}</blockquote>\n`;
  } else if (snippetType === "bold") {
    const bText = selectedText || "texto em destaque";
    replacement = `<strong>${bText}</strong>`;
  } else if (snippetType === "link") {
    const linkUrl = prompt("Insira o link (https://...):");
    if (!linkUrl) return;
    const linkLabel = selectedText || prompt("Insira o texto do link:") || "Clique aqui";
    replacement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkLabel}</a>`;
  }

  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
  updateGeneratorPreview();
}

function previewCurrentPostModal() {
  const title = document.getElementById("input-title").value.trim() || "Pré-visualização do Post";
  const type = document.getElementById("input-type").value || "devlog";
  const platform = document.getElementById("input-platform").value.trim() || "PlayStation 3";
  const subtagElem = document.getElementById("input-subtag");
  const subtag = subtagElem ? subtagElem.value.trim() : "";
  const image = document.getElementById("input-image").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
  const date = document.getElementById("input-date").value.trim() || getFormattedCurrentDate();
  const periodElem = document.getElementById("input-project-period");
  const projectPeriod = periodElem ? periodElem.value.trim() : "";
  const tagsStr = document.getElementById("input-tags").value.trim();
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];
  const description = document.getElementById("input-summary").value.trim() || "";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();
  const tagLinks = getTagLinksFromInputs();

  const previewItem = {
    id: "preview-temp-id",
    type,
    title,
    date,
    ...(projectPeriod ? { projectPeriod } : {}),
    platform,
    subtag,
    image,
    tags,
    description,
    content,
    downloadUrl,
    tagLinks
  };

  const existingIdx = PROJECTS_DATA.findIndex(p => p.id === "preview-temp-id");
  if (existingIdx >= 0) {
    PROJECTS_DATA[existingIdx] = previewItem;
  } else {
    PROJECTS_DATA.push(previewItem);
  }

  openPostModal("preview-temp-id");
}

let isModalHistoryPushed = false;

// Ouvinte para o botão "Voltar" do celular / navegador para fechar o modal
window.addEventListener("popstate", () => {
  const modalOverlay = document.getElementById("post-modal-overlay");
  const hash = window.location.hash.replace('#', '').trim();

  if (hash && hash !== "preview-temp-id") {
    const item = PROJECTS_DATA.find(p => p.id === hash) || (typeof TOOLS_DATA !== "undefined" ? TOOLS_DATA.find(t => t.id === hash) : null);
    if (item) {
      isModalHistoryPushed = false;
      openPostModal(item.id);
      return;
    }
  }

  if (modalOverlay && modalOverlay.classList.contains("active")) {
    isModalHistoryPushed = false;
    hidePostModalUI();
  }
});

// LÓGICA DO MODAL DE DETALHES DO POST
function openPostModal(postId) {
  const item = PROJECTS_DATA.find(p => p.id === postId) || (typeof TOOLS_DATA !== "undefined" ? TOOLS_DATA.find(t => t.id === postId) : null);
  if (!item) return;

  const modalOverlay = document.getElementById("post-modal-overlay");
  if (!modalOverlay) return;

  // Adaptar estilo do Modal com a Cor do Tema do Post
  const modalContainer = modalOverlay.querySelector(".modal-container");
  const themeColor = item.themeColor || "#6366f1";
  if (modalContainer) {
    modalContainer.style.setProperty("--post-theme-color", themeColor);
    modalContainer.style.setProperty("--post-theme-glow", `${themeColor}22`);
    modalContainer.style.setProperty("--post-theme-shadow", `${themeColor}44`);
  }

  // Extrair cor da imagem apenas se o post não possuir cor temática própria definida
  if ((!item.themeColor || item.themeColor === "#6366f1") && item.image && item.image.trim() !== "") {
    extractColorFromImage(item.image, (extractedHex) => {
      if (extractedHex && modalContainer) {
        modalContainer.style.setProperty("--post-theme-color", extractedHex);
        modalContainer.style.setProperty("--post-theme-glow", `${extractedHex}22`);
        modalContainer.style.setProperty("--post-theme-shadow", `${extractedHex}44`);
      }
    });
  }

  // Atualizar a URL e adicionar entrada no histórico para o botão "Voltar" do celular fechar o modal
  if (postId !== "preview-temp-id" && !modalOverlay.classList.contains("active")) {
    try {
      history.pushState({ modalOpen: true, postId: postId }, "", `#${postId}`);
      isModalHistoryPushed = true;
    } catch (e) { }
  } else if (postId !== "preview-temp-id" && window.location.hash !== `#${postId}`) {
    try {
      history.replaceState({ modalOpen: true, postId: postId }, "", `#${postId}`);
    } catch (e) { }
  }

  const modalTags = document.getElementById("modal-tags");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalImage = document.getElementById("modal-image");
  const modalMediaBg = document.getElementById("modal-media-bg");
  const modalContent = document.getElementById("modal-content");
  const modalFooter = document.getElementById("modal-footer");

  // Subtag
  let subtagBadgeHTML = "";
  if (item.subtag) {
    let subIcon = "🏷️";
    const stLower = item.subtag.toLowerCase();
    if (stLower.includes("dublad") && stLower.includes("ia")) subIcon = "🤖";
    else if (stLower.includes("dublad")) subIcon = "🎙️";
    else if (stLower.includes("legendad") || stLower.includes("tradu")) subIcon = "📝";
    else if (stLower.includes("port")) subIcon = "🔄";

    subtagBadgeHTML = `<span class="subtag-badge">${subIcon} ${item.subtag}</span>`;
  }

  // Tags / Badges com Links Reais do Mod
  const isDevlog = item.type === "devlog";
  const tagsHTML = (item.tags || []).map(t => {
    const link = !isDevlog && ((item.tagLinks && item.tagLinks[t]) || (item.platformDownloads && item.platformDownloads[t]));
    if (link) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="tag-badge tag-badge-link" title="Baixar mod para ${t}">📥 ${t}</a>`;
    }
    return `<span class="tag-badge">${t}</span>`;
  }).join("");
  modalTags.innerHTML = tagsHTML;

  // Título e Meta
  modalTitle.textContent = item.title;
  const periodMeta = item.projectPeriod ? ` • ⏳ Período: <strong>${item.projectPeriod}</strong>` : "";
  modalMeta.innerHTML = `📅 ${item.date}${periodMeta} • 🎮 ${item.platform} ${subtagBadgeHTML ? `• ${subtagBadgeHTML}` : ""}`;

  // Imagem
  if (modalImage) {
    const parentContainer = modalImage.parentElement;
    if (item.image && item.image.trim() !== "") {
      if (parentContainer) parentContainer.style.display = "";
      modalImage.onerror = function () {
        this.onerror = null;
        const fallback = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
        this.src = fallback;
        if (modalMediaBg) modalMediaBg.style.backgroundImage = `url('${fallback}')`;
      };
      modalImage.src = item.image;
      modalImage.alt = item.title;
      modalImage.style.objectPosition = item.imagePosition || item.imagePos || "center";
      if (modalMediaBg) {
        modalMediaBg.style.backgroundImage = `url('${item.image}')`;
      }
    } else {
      if (parentContainer) parentContainer.style.display = "none";
    }
  }

  // Conteúdo textual e formatador de Blog (HTML / Videos / iFrames / Imagens)
  const defaultBody = `<p>${item.description}</p>`;
  const rawContent = item.content || defaultBody;
  modalContent.innerHTML = formatBlogContent(rawContent);

  // Formatar todos os links dentro do conteúdo para abrirem em nova guia
  modalContent.querySelectorAll("a").forEach(a => {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (!a.classList.contains("content-link-styled")) {
      a.classList.add("content-link-styled");
    }
  });

  const safeTitle = (item.title || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");

  // Footer com Ações Limpas e Botão de Compartilhar
  let footerHTML = `
    <button class="btn-secondary-action btn-share-action" onclick="sharePost('${item.id}', '${safeTitle}')" title="Compartilhar este post">
      🔗 Compartilhar
    </button>
    <button class="btn-secondary-action" onclick="closePostModal()">Fechar</button>
  `;

  if (item.discordUrl) {
    footerHTML = `
      <a href="${item.discordUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary-action" style="border-color: #5865F2; color: #5865F2;">
        💬 Servidor Discord / Suporte
      </a>
      ${footerHTML}
    `;
  }

  modalFooter.innerHTML = footerHTML;

  // Exibir Modal
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";

  // Anime.js Entry Animation
  if (typeof anime !== 'undefined') {
    const modalContainer = modalOverlay.querySelector(".modal-container");
    anime.remove([modalOverlay, modalContainer]);

    anime({
      targets: modalOverlay,
      opacity: [0, 1],
      duration: 250,
      easing: 'easeOutQuad'
    });

    anime({
      targets: modalContainer,
      opacity: [0, 1],
      scale: [0.94, 1],
      translateY: [30, 0],
      duration: 450,
      easing: 'easeOutBack'
    });
  }
}

function closePostModal(e) {
  if (e && e.target && e.target.id !== "post-modal-overlay" && !e.target.classList.contains("modal-close-btn") && !e.target.classList.contains("btn-secondary-action")) {
    return;
  }

  if (isModalHistoryPushed) {
    isModalHistoryPushed = false;
    history.back();
    return;
  }

  if (window.location.hash) {
    try {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    } catch (err) { }
  }

  hidePostModalUI();
}

function hidePostModalUI() {
  const modalOverlay = document.getElementById("post-modal-overlay");
  if (!modalOverlay) return;

  if (typeof anime !== 'undefined') {
    const modalContainer = modalOverlay.querySelector(".modal-container");
    anime.remove([modalOverlay, modalContainer]);

    anime({
      targets: modalContainer,
      opacity: 0,
      scale: 0.94,
      translateY: 25,
      duration: 200,
      easing: 'easeInQuad'
    });

    anime({
      targets: modalOverlay,
      opacity: 0,
      duration: 200,
      easing: 'easeInQuad',
      complete: () => {
        modalOverlay.classList.remove("active");
        modalOverlay.style.opacity = "";
        if (modalContainer) {
          modalContainer.style.opacity = "";
          modalContainer.style.transform = "";
        }
        document.body.style.overflow = ""; // Restaurar rolagem
      }
    });
  } else {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Restaurar rolagem
  }
}

// LÓGICA DE COMPARTILHAMENTO DE POSTS & DEEP LINKING
function sharePost(postId, postTitle) {
  let baseUrl = window.location.origin + window.location.pathname;
  if (baseUrl.endsWith('/index.html')) {
    baseUrl = baseUrl.slice(0, -10);
  }
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  const shareUrl = `${baseUrl}p/${postId}/`;

  if (navigator.share) {
    navigator.share({
      title: postTitle || 'Godoy Mods',
      text: `Confira "${postTitle}" no Godoy Mods!`,
      url: shareUrl
    }).catch(err => {
      if (err.name !== 'AbortError') {
        copyShareUrlToClipboard(shareUrl);
      }
    });
  } else {
    copyShareUrlToClipboard(shareUrl);
  }
}

function copyShareUrlToClipboard(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link do post copiado para a área de transferência! 🚀", "success");
    }).catch(() => {
      fallbackCopyText(url);
    });
  } else {
    fallbackCopyText(url);
  }
}

function fallbackCopyText(url) {
  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast("Link do post copiado para a área de transferência! 🚀", "success");
  } catch (err) {
    showToast("Erro ao copiar link: " + url, "error");
  }
  document.body.removeChild(textArea);
}

let isInitialHashCheckDone = false;

function checkUrlHashAndOpenModal() {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash && hash !== "preview-temp-id") {
    const item = PROJECTS_DATA.find(p => p.id === hash) || (typeof TOOLS_DATA !== "undefined" ? TOOLS_DATA.find(t => t.id === hash) : null);
    if (item) {
      // Ao carregar a página vindo de um link direto (ex: /#paper-mario-ttyd),
      // limpa a hash da entrada inicial do histórico com replaceState para que a base seja a Home limpa.
      if (!isInitialHashCheckDone && window.location.hash) {
        isInitialHashCheckDone = true;
        try {
          history.replaceState(null, null, window.location.pathname + window.location.search);
        } catch (e) { }
      }
      openPostModal(item.id);
    }
  }
}

// TOGGLE MENU MOBILE
function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open-mobile");
    overlay.classList.toggle("active");
  }
}


// =========================================================
// LÓGICA DA SUBPÁGINA: CRIADOR & EDITOR DE POSTS (gerador.html)
// =========================================================

function initGeneratorPage() {
  populatePostSelector();
  setupEditorDragDropAndPaste();

  // Selecionar o primeiro post por padrão para facilitar edição imediata
  const selectElem = document.getElementById("select-existing-post");
  if (selectElem && selectElem.options.length > 1) {
    selectElem.selectedIndex = 1;
    loadSelectedPostForEdit();
  } else {
    resetFormToNew();
  }
}

function populatePostSelector() {
  const selectElem = document.getElementById("select-existing-post");
  if (!selectElem) return;

  const currentValue = selectElem.value;
  selectElem.innerHTML = `<option value="new">➕ [Criar Novo Post ou Devlog]</option>`;

  const sortedProjects = [...PROJECTS_DATA].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));

  sortedProjects.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    let icon = "📰";
    if (item.type === "ongoing") icon = "⚙️";
    if (item.type === "completed") icon = "✅";
    if (item.type === "paid") icon = "💰";
    if (item.type === "archived") icon = "📦";
    if (item.type === "abandoned") icon = "🚫";
    option.textContent = `${icon} ${item.title} (${item.date || 'Sem data'})`;
    selectElem.appendChild(option);
  });

  if (currentValue) {
    selectElem.value = currentValue;
  }
}

function handleTagsInputChange() {
  const currentTagLinks = getTagLinksFromInputs();
  renderTagLinksInputs(currentTagLinks);
  updateGeneratorPreview();
}

function renderTagLinksInputs(initialLinks = {}) {
  const wrapper = document.getElementById("tag-links-fields-wrapper");
  if (!wrapper) return;

  const typeElem = document.getElementById("input-type");
  const type = typeElem ? typeElem.value : "devlog";
  const containerTagLinks = document.getElementById("container-tag-links");
  if (containerTagLinks) {
    containerTagLinks.style.display = (type === "devlog") ? "none" : "block";
  }

  const tagsInput = document.getElementById("input-tags");
  const tagsStr = tagsInput ? tagsInput.value.trim() : "";
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (tags.length === 0) {
    wrapper.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Digite tags/plataformas acima (ex: PC, Android, PlayStation 3) para definir links de download.</span>`;
    return;
  }

  wrapper.innerHTML = tags.map(t => {
    const escapedTag = t.replace(/[^a-zA-Z0-9_-]/g, "_");
    const linkVal = initialLinks[t] || "";
    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="tag-badge" style="min-width: 120px; text-align: center; justify-content: center; font-weight: 700; white-space: nowrap;">${t}</span>
        <input type="text" id="tag-link-${escapedTag}" class="form-input tag-link-input" data-tag="${t}" value="${linkVal}" placeholder="Link de download direto para ${t} (MediaFire, Drive, etc.)" oninput="updateGeneratorPreview()">
      </div>
    `;
  }).join("");
}

function getTagLinksFromInputs() {
  const linksObj = {};
  const linkInputs = document.querySelectorAll(".tag-link-input");
  linkInputs.forEach(input => {
    const tag = input.getAttribute("data-tag");
    const val = input.value.trim();
    if (tag && val) {
      linksObj[tag] = val;
    }
  });
  return linksObj;
}

function handleTypeChange() {
  const typeElem = document.getElementById("input-type");
  if (!typeElem) return;

  const type = typeElem.value;
  const toolContainer = document.getElementById("container-tool-options");
  const containerTagLinks = document.getElementById("container-tag-links");
  const progressInput = document.getElementById("input-progress");
  const progressContainer = progressInput ? progressInput.closest(".form-group") : null;

  if (toolContainer) {
    toolContainer.style.display = (type === "tool") ? "block" : "none";
  }
  if (containerTagLinks) {
    containerTagLinks.style.display = (type === "devlog" || type === "tool") ? "none" : "block";
  }
  if (progressContainer) {
    progressContainer.style.display = (type === "ongoing") ? "block" : "none";
  }

  updateGeneratorPreview();
}

function setImagePositionPreset(pos) {
  const inputPos = document.getElementById("input-image-position");
  if (inputPos) inputPos.value = pos;

  document.querySelectorAll(".img-pos-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  if (pos === "top") {
    const btn = document.getElementById("pos-btn-top");
    if (btn) btn.classList.add("active");
  } else if (pos === "bottom") {
    const btn = document.getElementById("pos-btn-bottom");
    if (btn) btn.classList.add("active");
  } else if (pos === "center 25%") {
    const btn = document.getElementById("pos-btn-top25");
    if (btn) btn.classList.add("active");
  } else if (pos === "center 75%") {
    const btn = document.getElementById("pos-btn-bottom75");
    if (btn) btn.classList.add("active");
  } else {
    const btn = document.getElementById("pos-btn-center");
    if (btn) btn.classList.add("active");
  }

  updateGeneratorPreview();
}

function loadSelectedPostForEdit() {
  const selectElem = document.getElementById("select-existing-post");
  const deleteBtn = document.getElementById("btn-delete-post");
  const heading = document.getElementById("form-title-heading");

  if (!selectElem) return;

  const postId = selectElem.value;

  if (postId === "new") {
    resetFormToNew();
    if (deleteBtn) deleteBtn.style.display = "none";
    if (heading) heading.textContent = "✍️ Criar Nova Publicação";
    return;
  }

  const item = PROJECTS_DATA.find(p => String(p.id).trim() === String(postId).trim());
  if (!item) return;

  if (deleteBtn) deleteBtn.style.display = "inline-flex";
  if (heading) heading.textContent = `✏️ Editando: ${item.title}`;

  document.getElementById("input-id").value = item.id;
  document.getElementById("input-title").value = item.title || "";
  document.getElementById("input-type").value = item.type || "devlog";
  document.getElementById("input-platform").value = item.platform || "PlayStation 2";
  const subtagElem = document.getElementById("input-subtag");
  if (subtagElem) subtagElem.value = item.subtag || "";
  document.getElementById("input-image").value = item.image || "";
  document.getElementById("input-date").value = item.date || getFormattedCurrentDate();
  const periodElem = document.getElementById("input-project-period");
  if (periodElem) periodElem.value = item.projectPeriod || "";
  document.getElementById("input-progress").value = item.progress || 50;
  document.getElementById("input-tags").value = (item.tags || []).join(", ");
  document.getElementById("input-summary").value = item.description || "";
  document.getElementById("input-content").value = (item.content || "").replace(/\\n/g, "\n");
  document.getElementById("input-download").value = item.downloadUrl || item.url || "";

  const colorElem = document.getElementById("input-theme-color");
  const colorPickerElem = document.getElementById("input-theme-color-picker");
  if (colorElem) colorElem.value = item.themeColor || "#6366f1";
  if (colorPickerElem) colorPickerElem.value = item.themeColor || "#6366f1";

  const imgPosVal = item.imagePosition || item.imagePos || "center";
  setImagePositionPreset(imgPosVal);

  if (document.getElementById("input-tool-category")) document.getElementById("input-tool-category").value = item.category || "created";
  if (document.getElementById("input-tool-icon")) document.getElementById("input-tool-icon").value = item.icon || "🛠️";
  if (document.getElementById("input-tool-badge")) document.getElementById("input-tool-badge").value = item.badge || "Ferramenta";
  if (document.getElementById("input-tool-button-text")) document.getElementById("input-tool-button-text").value = item.buttonText || "🚀 Acessar Ferramenta";
  if (document.getElementById("input-tool-url")) document.getElementById("input-tool-url").value = item.url || item.downloadUrl || "";

  handleTypeChange();
  renderTagLinksInputs(item.tagLinks || item.platformDownloads || {});

  updateGeneratorPreview();
}

function resetFormToNew() {
  const selectElem = document.getElementById("select-existing-post");
  const deleteBtn = document.getElementById("btn-delete-post");
  const heading = document.getElementById("form-title-heading");

  if (selectElem) selectElem.value = "new";
  if (deleteBtn) deleteBtn.style.display = "none";
  if (heading) heading.textContent = "✍️ Criar Nova Publicação";

  document.getElementById("input-id").value = "";
  document.getElementById("input-title").value = "Devlog #05 - Novas Vozes com IA & Sincronia PT-BR";
  document.getElementById("input-type").value = "devlog";
  document.getElementById("input-platform").value = "PlayStation 2";
  const subtagElem = document.getElementById("input-subtag");
  if (subtagElem) subtagElem.value = "Dublado (IA)";
  document.getElementById("input-image").value = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";

  const colorElem = document.getElementById("input-theme-color");
  const colorPickerElem = document.getElementById("input-theme-color-picker");
  if (colorElem) colorElem.value = "#6366f1";
  if (colorPickerElem) colorPickerElem.value = "#6366f1";

  setImagePositionPreset("center");

  if (document.getElementById("input-tool-category")) document.getElementById("input-tool-category").value = "created";
  if (document.getElementById("input-tool-icon")) document.getElementById("input-tool-icon").value = "🛠️";
  if (document.getElementById("input-tool-badge")) document.getElementById("input-tool-badge").value = "Ferramenta";
  if (document.getElementById("input-tool-button-text")) document.getElementById("input-tool-button-text").value = "🚀 Acessar Ferramenta";
  if (document.getElementById("input-tool-url")) document.getElementById("input-tool-url").value = "";

  document.getElementById("input-date").value = getFormattedCurrentDate();
  const periodElem = document.getElementById("input-project-period");
  if (periodElem) periodElem.value = "";

  document.getElementById("input-progress").value = "70";
  document.getElementById("input-tags").value = "Devlog, God of War, IA, PS2";
  document.getElementById("input-summary").value = "Avanços na dublagem e sincronia de vozes para o PlayStation 2 e PlayStation 3.";
  document.getElementById("input-content").value = `<p>Confira as últimas novidades e melhorias do nosso projeto de modificação!</p>\n\n<h3>✨ Destaques do Update:</h3>\n<ul>\n  <li>Sincronização de vozes principais concluída.</li>\n  <li>Ajustes de áudio em alta fidelidade.</li>\n</ul>`;
  document.getElementById("input-download").value = "https://discord.com/invite/atFQmmR2fy";

  handleTypeChange();
  renderTagLinksInputs({});

  updateGeneratorPreview();
}

function updateGeneratorPreview() {
  const title = document.getElementById("input-title").value.trim() || "Título da Publicação";
  const type = document.getElementById("input-type").value || "devlog";
  const platform = document.getElementById("input-platform").value.trim() || "Multi-plataforma";
  const subtagElem = document.getElementById("input-subtag");
  const subtag = subtagElem ? subtagElem.value.trim() : "";
  const image = document.getElementById("input-image").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
  const colorElem = document.getElementById("input-theme-color");
  const themeColor = colorElem ? colorElem.value.trim() : "#6366f1";
  const imagePosElem = document.getElementById("input-image-position");
  const imagePosition = imagePosElem ? imagePosElem.value : "center";
  const date = document.getElementById("input-date").value.trim() || getFormattedCurrentDate();
  const periodElem = document.getElementById("input-project-period");
  const projectPeriod = periodElem ? periodElem.value.trim() : "";
  const progress = parseInt(document.getElementById("input-progress").value) || 50;
  const tagsStr = document.getElementById("input-tags").value.trim();
  const description = document.getElementById("input-summary").value.trim() || "Sem resumo disponível.";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();
  const existingId = document.getElementById("input-id").value;

  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];
  const tagLinks = getTagLinksFromInputs();

  const id = existingId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

  const currentObj = {
    id,
    type,
    title,
    date,
    ...(projectPeriod ? { projectPeriod } : {}),
    description,
    platform,
    ...(subtag ? { subtag } : {}),
    image,
    ...(imagePosition && imagePosition !== "center" ? { imagePosition } : {}),
    ...(themeColor ? { themeColor } : {}),
    tags,
    ...(Object.keys(tagLinks).length > 0 ? { tagLinks } : {}),
    ...(type === "ongoing" ? { progress } : {}),
    content,
    downloadUrl
  };

  // Thumbnail Image Preview Box
  const thumbImg = document.getElementById("image-thumb-img");
  const thumbPlaceholder = document.getElementById("image-thumb-placeholder");
  if (thumbImg && thumbPlaceholder) {
    if (image) {
      thumbImg.src = image;
      thumbImg.style.display = "block";
      thumbPlaceholder.style.display = "none";
      thumbImg.onerror = () => {
        thumbImg.style.display = "none";
        thumbPlaceholder.style.display = "block";
      };
    } else {
      thumbImg.style.display = "none";
      thumbPlaceholder.style.display = "block";
    }
  }

  // Render Card Preview
  const previewBox = document.getElementById("rendered-preview");
  if (previewBox) {
    previewBox.innerHTML = createCardHTML(currentObj);
  }

  // Render Code Output
  const codeDisplay = document.getElementById("code-display");
  if (codeDisplay) {
    if (currentOutputFormat === "js") {
      codeDisplay.textContent = JSON.stringify(currentObj, null, 2);
    } else if (currentOutputFormat === "markdown") {
      codeDisplay.textContent = `---
title: "${title}"
type: "${type}"
date: "${date}"
${projectPeriod ? `projectPeriod: "${projectPeriod}"\n` : ""}platform: "${platform}"
image: "${image}"
tags: [${tags.map(t => `"${t}"`).join(", ")}]
${type === "ongoing" ? `progress: ${progress}\n` : ""}downloadUrl: "${downloadUrl}"
---

# ${title}

${description}

${content.replace(/<p>/g, "").replace(/<\/p>/g, "\n\n").replace(/<h3>/g, "### ").replace(/<\/h3>/g, "\n").replace(/<ul>/g, "").replace(/<\/ul>/g, "").replace(/<li>/g, "- ").replace(/<\/li>/g, "\n")}`;
    } else {
      codeDisplay.textContent = `<article class="devlog-post">
  <h2>${title}</h2>
  <div class="meta">${date} ${projectPeriod ? `(Período: ${projectPeriod})` : ""} • ${platform}</div>
  <img src="${image}" alt="${title}">
  <p>${description}</p>
  <div class="full-content">
    ${content}
  </div>
</article>`;
    }
  }
}

function setOutputFormat(fmt) {
  currentOutputFormat = fmt;
  document.querySelectorAll(".format-toggle .format-btn").forEach(btn => {
    btn.classList.toggle("active", btn.id === `fmt-${fmt}`);
  });
  updateGeneratorPreview();
}

// EXTRAÇÃO AUTOMÁTICA DA COR PREDOMINANTE / VIBRANTE DE UMA IMAGEM (CANVAS HSL)
function extractColorFromImage(imgSrc, callback) {
  if (!imgSrc || typeof callback !== "function") return;
  if (imgSrc.startsWith("data:image/svg")) return;

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgSrc;

  img.onload = function () {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 40;
      canvas.height = 40;
      ctx.drawImage(img, 0, 0, 40, 40);

      const imageData = ctx.getImageData(0, 0, 40, 40);
      const data = imageData.data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      let maxSat = -1;
      let vibrantColor = null;

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 128) continue; // Ignorar pixels transparentes

        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const l = (max + min) / 2;
        const d = max - min;
        const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

        // Ignorar pretos profundos (l < 0.12), brancos (l > 0.90) e cinzas foscos (s < 0.15)
        if (l < 0.12 || l > 0.90 || s < 0.15) continue;

        if (s > maxSat) {
          maxSat = s;
          vibrantColor = { r, g, b };
        }

        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }

      let hex = null;
      if (vibrantColor) {
        hex = "#" + [vibrantColor.r, vibrantColor.g, vibrantColor.b].map(x => x.toString(16).padStart(2, "0")).join("");
      } else if (count > 0) {
        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        hex = "#" + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, "0")).join("");
      }

      if (hex) callback(hex);
    } catch (e) {
      console.warn("Cross-origin ou erro no canvas ao extrair cor da imagem", e);
    }
  };
}

function autoExtractColorForCurrentForm() {
  const imgInput = document.getElementById("input-image");
  const imageUrl = imgInput ? imgInput.value.trim() : "";
  if (!imageUrl) {
    showToast("Por favor, informe a URL ou faça o upload da imagem de capa primeiro.", "error");
    return;
  }

  showToast("🔍 Analisando imagem e extraindo cor predominante...", "info");
  extractColorFromImage(imageUrl, (extractedHex) => {
    if (extractedHex) {
      const colorInput = document.getElementById("input-theme-color");
      const colorPicker = document.getElementById("input-theme-color-picker");
      if (colorInput) colorInput.value = extractedHex;
      if (colorPicker) colorPicker.value = extractedHex;
      updateGeneratorPreview();
      showToast(`🎨 Cor predominante extraída com sucesso: ${extractedHex}`, "success");
    }
  });
}

async function handleImageFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const uploadedUrl = await uploadImageFile(file);
  if (uploadedUrl) {
    const imgInput = document.getElementById("input-image");
    if (imgInput) {
      imgInput.value = uploadedUrl;
      updateGeneratorPreview();

      // Extrair a cor automaticamente da nova imagem
      extractColorFromImage(uploadedUrl, (extractedHex) => {
        if (extractedHex) {
          const colorInput = document.getElementById("input-theme-color");
          const colorPicker = document.getElementById("input-theme-color-picker");
          if (colorInput) colorInput.value = extractedHex;
          if (colorPicker) colorPicker.value = extractedHex;
          updateGeneratorPreview();
        }
      });
    }
  }
}

function savePostToSiteFeed() {
  const title = document.getElementById("input-title").value.trim();
  if (!title) {
    showToast("Por favor, preencha o Título do post antes de salvar.", "error");
    document.getElementById("input-title").focus();
    return;
  }

  const existingId = document.getElementById("input-id").value;
  const id = existingId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

  const type = document.getElementById("input-type").value;
  const platform = document.getElementById("input-platform").value.trim() || "PlayStation 2";
  const subtagElem = document.getElementById("input-subtag");
  const subtag = subtagElem ? subtagElem.value.trim() : "";
  const image = document.getElementById("input-image").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
  const colorElem = document.getElementById("input-theme-color");
  const themeColor = colorElem ? colorElem.value.trim() : "#6366f1";
  const date = document.getElementById("input-date").value.trim() || getFormattedCurrentDate();
  const periodElem = document.getElementById("input-project-period");
  const projectPeriod = periodElem ? periodElem.value.trim() : "";
  const progress = parseInt(document.getElementById("input-progress").value) || 50;
  const tagsStr = document.getElementById("input-tags").value.trim();
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];
  const tagLinks = getTagLinksFromInputs();
  const description = document.getElementById("input-summary").value.trim() || "Sem descrição disponível.";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();

  const toolCategory = document.getElementById("input-tool-category") ? document.getElementById("input-tool-category").value : "created";
  const toolIcon = document.getElementById("input-tool-icon") ? document.getElementById("input-tool-icon").value.trim() : "🛠️";
  const toolBadge = document.getElementById("input-tool-badge") ? document.getElementById("input-tool-badge").value.trim() : "Ferramenta";
  const toolBtnText = document.getElementById("input-tool-button-text") ? document.getElementById("input-tool-button-text").value.trim() : "🚀 Acessar Ferramenta";
  const toolUrl = document.getElementById("input-tool-url") ? document.getElementById("input-tool-url").value.trim() : "";

  const imagePosElem = document.getElementById("input-image-position");
  const imagePosition = imagePosElem ? imagePosElem.value : "center";

  const existingIndex = PROJECTS_DATA.findIndex(p => p && String(p.id).trim() === String(id).trim());
  const existingItem = existingIndex >= 0 ? PROJECTS_DATA[existingIndex] : {};

  const postObj = {
    id,
    type,
    title,
    date,
    ...(projectPeriod ? { projectPeriod } : (existingItem.projectPeriod ? { projectPeriod: existingItem.projectPeriod } : {})),
    description,
    platform,
    ...(subtag ? { subtag } : {}),
    image,
    ...(imagePosition && imagePosition !== "center" ? { imagePosition } : (existingItem.imagePosition ? { imagePosition: existingItem.imagePosition } : {})),
    ...(themeColor ? { themeColor } : {}),
    tags,
    ...(Object.keys(tagLinks).length > 0 ? { tagLinks } : (existingItem.tagLinks ? { tagLinks: existingItem.tagLinks } : {})),
    ...(type === "ongoing" ? { progress } : {}),
    ...(type === "tool" ? {
      category: toolCategory,
      icon: toolIcon,
      badge: toolBadge,
      buttonText: toolBtnText,
      url: toolUrl || downloadUrl
    } : {}),
    content,
    downloadUrl: toolUrl || downloadUrl,
    ...(existingItem.platformDownloads ? { platformDownloads: existingItem.platformDownloads } : {}),
    ...(existingItem.discordUrl ? { discordUrl: existingItem.discordUrl } : {})
  };

  if (existingIndex >= 0) {
    PROJECTS_DATA[existingIndex] = postObj;
  } else {
    PROJECTS_DATA.unshift(postObj);
  }

  // Salvar no localStorage e Servidor
  try {
    const cleanProjects = PROJECTS_DATA.filter(p => p && p.id !== "preview-temp-id");
    localStorage.setItem("godoy_projects_data", JSON.stringify(cleanProjects));
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e);
  }
  syncProjectsToServer();

  // Atualizar dropdown e manter item selecionado
  populatePostSelector();
  const selectElem = document.getElementById("select-existing-post");
  if (selectElem) selectElem.value = id;
  document.getElementById("input-id").value = id;

  const heading = document.getElementById("form-title-heading");
  if (heading) heading.textContent = `✏️ Editando: ${title}`;

  const deleteBtn = document.getElementById("btn-delete-post");
  if (deleteBtn) deleteBtn.style.display = "inline-flex";

  updateGeneratorPreview();
  renderAllCards();

  // Feedback visual no botão Salvar
  const saveBtn = document.getElementById("btn-save-post");
  if (saveBtn) {
    const origHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = "✓ Publicação Salva!";
    saveBtn.style.backgroundColor = "#10b981";
    setTimeout(() => {
      saveBtn.innerHTML = origHtml;
      saveBtn.style.backgroundColor = "";
    }, 2500);
  }

  // Banner inline de feedback
  const feedbackElem = document.getElementById("post-save-feedback");
  if (feedbackElem) {
    feedbackElem.textContent = `✅ Publicação "${title}" salva com sucesso!`;
    feedbackElem.style.display = "flex";
    setTimeout(() => {
      feedbackElem.style.display = "none";
    }, 4500);
  }

  showToast(`✅ Publicação "${title}" salva com sucesso!`, "success");
}

async function deleteSelectedPost() {
  const selectElem = document.getElementById("select-existing-post");
  const inputIdElem = document.getElementById("input-id");
  const selectVal = selectElem ? selectElem.value : "";
  const inputId = inputIdElem ? inputIdElem.value : "";

  const targetId = (selectVal && selectVal !== "new") ? selectVal : inputId;

  if (!targetId || targetId === "new") {
    showToast("Por favor, selecione um post existente no menu '🔍 Selecionar Post para Editar' para poder excluí-lo.", "error");
    return;
  }

  const existingIndex = PROJECTS_DATA.findIndex(p => p && String(p.id).trim() === String(targetId).trim());
  if (existingIndex === -1) {
    showToast("O post selecionado não foi encontrado ou já foi removido.", "error");
    populatePostSelector();
    resetFormToNew();
    return;
  }

  const item = PROJECTS_DATA[existingIndex];
  const title = (item && item.title) ? item.title : "esta publicação";

  showCustomConfirm({
    title: "🗑️ Excluir Publicação",
    message: `Tem certeza de que deseja excluir permanentemente a publicação "${title}"? Esta ação removerá a publicação do site e não poderá ser desfeita.`,
    confirmText: "🗑️ Sim, Excluir Post",
    cancelText: "Cancelar",
    isDanger: true,
    onConfirm: async () => {
      // Remover do catálogo local
      PROJECTS_DATA.splice(existingIndex, 1);

      try {
        localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
      } catch (e) {
        console.error("Erro ao salvar no localStorage", e);
      }

      // Sincronizar com o servidor
      await syncProjectsToServer();

      showToast(`🗑️ Post "${title}" removido com sucesso do site!`, "success");

      const feedbackElem = document.getElementById("post-save-feedback");
      if (feedbackElem) {
        feedbackElem.textContent = `🗑️ Post "${title}" removido com sucesso!`;
        feedbackElem.style.display = "flex";
        setTimeout(() => {
          feedbackElem.style.display = "none";
        }, 4500);
      }

      // Atualizar o menu de seleção
      populatePostSelector();

      const updatedSelect = document.getElementById("select-existing-post");
      if (updatedSelect && updatedSelect.options.length > 1) {
        updatedSelect.selectedIndex = 1;
        loadSelectedPostForEdit();
      } else {
        resetFormToNew();
      }

      renderAllCards();
    }
  });
}

async function restoreDefaultData() {
  showCustomConfirm({
    title: "🔄 Restaurar Dados Padrão",
    message: "Deseja restaurar as publicações padrões originais do site? Todas as edições serão resetadas para a versão original de /data/projects.json.",
    confirmText: "Restaurar",
    cancelText: "Cancelar",
    isDanger: true,
    onConfirm: async () => {
      try {
        localStorage.removeItem("godoy_projects_data");
        const res = await fetch("./data/projects.json");
        if (res.ok) {
          PROJECTS_DATA = await res.json();
          await syncProjectsToServer();
          populatePostSelector();
          loadSelectedPostForEdit();
          renderAllCards();
          showToast("🔄 Dados do site restaurados para a versão padrão de /data/projects.json.", "success");
        }
      } catch (err) {
        showToast("Erro ao restaurar publicações padrão: " + err.message, "error");
      }
    }
  });
}

function copyDevlogCode() {
  const codeDisplay = document.getElementById("code-display");
  if (!codeDisplay) return;

  const text = codeDisplay.textContent;
  const copyBtn = document.getElementById("btn-copy-code");

  function showSuccess() {
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "✓ Copiado!";
      copyBtn.style.backgroundColor = "#10b981";
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.backgroundColor = "";
      }, 2000);
    } else {
      alert("📋 Código copiado para a área de transferência!");
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showSuccess).catch(() => fallbackCopy(text, showSuccess));
  } else {
    fallbackCopy(text, showSuccess);
  }
}

function fallbackCopy(text, showSuccess) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showSuccess();
  } catch (err) {
    alert("Selecione e copie o texto manualmente da caixa de código.");
  } finally {
    document.body.removeChild(textarea);
  }
}

function downloadDevlogFile() {
  const codeDisplay = document.getElementById("code-display");
  const title = document.getElementById("input-title").value.trim() || "post";
  if (!codeDisplay) return;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let ext = "js";
  let mime = "application/javascript";

  if (currentOutputFormat === "markdown") {
    ext = "md";
    mime = "text/markdown";
  } else if (currentOutputFormat === "html") {
    ext = "html";
    mime = "text/html";
  }

  const blob = new Blob([codeDisplay.textContent], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

// =========================================================
// LÓGICA DO FORMULÁRIO DE ENCOMENDA E COMPRA DE PROJETOS
// =========================================================

async function handleContactSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("contact-name").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const typeSelect = document.getElementById("contact-type");
  const typeText = typeSelect.options[typeSelect.selectedIndex].text;
  const game = document.getElementById("contact-game").value.trim() || "Não informado";
  const budget = document.getElementById("contact-budget").value.trim() || "A combinar";
  const message = document.getElementById("contact-message").value.trim();

  if (!name || !email || !message) {
    alert("Por favor, preencha todos os campos obrigatórios (*).");
    return;
  }

  const commissionData = {
    name,
    email,
    typeText,
    game,
    budget,
    message
  };

  // Formatar resumo para cópia no Discord
  lastSubmittedOrderSummary = `🛒 **NOVA ENCOMENDA / PROPOSTA DE PROJETO**
👤 **Nome:** ${name}
💬 **Contato (Discord/Email):** ${email}
📋 **Tipo:** ${typeText}
🎮 **Jogo / Plataforma:** ${game}
💰 **Orçamento Proposto:** ${budget}
📝 **Detalhes:** ${message}`;

  try {
    const res = await fetch("/api/commissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commissionData)
    });

    if (!res.ok) {
      throw new Error("Erro no servidor");
    }

    const result = await res.json();
    console.log("Pedido salvo no servidor:", result);
  } catch (err) {
    console.error("Erro ao enviar pedido para o servidor:", err);
  }

  // Ocultar formulário e exibir mensagem de sucesso
  const formElem = document.getElementById("contact-commission-form");
  const successCard = document.getElementById("contact-success-msg");
  const successText = document.getElementById("contact-success-text");

  if (formElem) formElem.style.display = "none";
  if (successCard) successCard.style.display = "flex";

  if (successText) {
    successText.textContent = `Obrigado, ${name}! Sua solicitação foi enviada com sucesso. Você também pode copiar o resumo abaixo para mandar no Discord se quiser acelerar o contato!`;
  }
}

function copyOrderSummaryToClipboard() {
  if (!lastSubmittedOrderSummary) {
    alert("Nenhum pedido recente para copiar.");
    return;
  }

  navigator.clipboard.writeText(lastSubmittedOrderSummary).then(() => {
    const btn = document.getElementById("btn-copy-order-text");
    if (btn) {
      const origText = btn.innerHTML;
      btn.innerHTML = "✅ Resumo Copiado!";
      btn.style.backgroundColor = "var(--green-badge)";
      setTimeout(() => {
        btn.innerHTML = origText;
        btn.style.backgroundColor = "";
      }, 2500);
    }
  }).catch(err => {
    console.error("Erro ao copiar", err);
    alert(lastSubmittedOrderSummary);
  });
}

function resetContactForm() {
  const formElem = document.getElementById("contact-commission-form");
  const successCard = document.getElementById("contact-success-msg");

  if (formElem) {
    formElem.reset();
    formElem.style.display = "block";
  }

  if (successCard) {
    successCard.style.display = "none";
  }
}

// ==========================================================================
// RENDERIZAÇÃO E GESTÃO DA EQUIPE (GODOY & KRISP)
// ==========================================================================

// HELPER DE STATUS DA EQUIPE
function getTeamStatusInfo(statusStr) {
  const s = (statusStr || "").toLowerCase().trim();
  if (s.includes("aposent")) {
    return {
      text: "Aposentado",
      badgeHtml: `<span class="team-status-pill status-retired" title="Status: Aposentado">🏖️ Aposentado</span>`,
      dotClass: "status-dot-retired"
    };
  }
  if (s.includes("sumid") || s.includes("ausente") || s.includes("desaparecido") || s.includes("off")) {
    return {
      text: "Sumido",
      badgeHtml: `<span class="team-status-pill status-missing" title="Status: Sumido">👻 Sumido</span>`,
      dotClass: "status-dot-missing"
    };
  }
  return {
    text: "Em Atividade",
    badgeHtml: `<span class="team-status-pill status-active" title="Status: Em Atividade">🟢 Em Atividade</span>`,
    dotClass: "status-dot-active"
  };
}

function setTeamStatusPreset(statusVal) {
  const elem = document.getElementById("team-input-status");
  if (elem) {
    elem.value = statusVal;
    updateTeamPreview();
  }
}

function updateHeroTeamStats() {
  const teamCount = document.getElementById("team-count-val");
  const totalProj = document.getElementById("stat-total-projects");
  const activeProj = document.getElementById("stat-active-projects");
  const completedProj = document.getElementById("stat-completed-projects");
  const archivedProj = document.getElementById("stat-archived-projects");
  const abandonedProj = document.getElementById("stat-abandoned-projects");

  if (teamCount) teamCount.textContent = (typeof TEAM_DATA !== "undefined" && TEAM_DATA.length) ? TEAM_DATA.length : 2;

  if (typeof PROJECTS_DATA !== "undefined" && Array.isArray(PROJECTS_DATA)) {
    const validProjects = PROJECTS_DATA.filter(i => i.type !== "devlog");
    if (totalProj) totalProj.textContent = validProjects.length;
    if (activeProj) activeProj.textContent = validProjects.filter(i => i.type === "ongoing" || i.type === "active").length;
    if (completedProj) completedProj.textContent = validProjects.filter(i => i.type === "completed" || i.type === "paid").length;
    if (archivedProj) archivedProj.textContent = validProjects.filter(i => i.type === "archived").length;
    if (abandonedProj) abandonedProj.textContent = validProjects.filter(i => i.type === "abandoned").length;
  }
}

function renderTeamCards() {
  const gridTeam = document.getElementById("grid-team");
  const countVal = document.getElementById("team-count-val");
  const badgeTeam = document.getElementById("badge-team");

  if (countVal) countVal.textContent = TEAM_DATA.length;
  if (badgeTeam) badgeTeam.textContent = TEAM_DATA.length;
  updateHeroTeamStats();

  // Atualizar dinamicamente os avatars do overlap no topo/sidebar se estiverem presentes
  const primaryAvatar = document.querySelector(".avatar-overlap-container .primary-avatar");
  const secondaryAvatar = document.querySelector(".avatar-overlap-container .secondary-avatar");
  if (primaryAvatar && TEAM_DATA[0]) {
    primaryAvatar.src = TEAM_DATA[0].avatar;
  }
  if (secondaryAvatar && TEAM_DATA[1]) {
    secondaryAvatar.src = TEAM_DATA[1].avatar;
  }

  if (!gridTeam) return;

  gridTeam.innerHTML = TEAM_DATA.map(member => {
    const specialtiesHTML = (member.specialties || []).map(s => `<span class="team-spec-chip">${s}</span>`).join("");
    const statusInfo = getTeamStatusInfo(member.status);

    let socialsHTML = "";
    if (member.socials) {
      if (member.socials.discord) {
        const disc = member.socials.discord.startsWith("http") ? member.socials.discord : `https://discord.com/invite/atFQmmR2fy`;
        const discLabel = member.socials.discord.startsWith("http") ? "💬 Discord" : `💬 Discord (${member.socials.discord})`;
        socialsHTML += `<a href="${disc}" target="_blank" rel="noopener" class="team-social-btn discord" title="Discord">${discLabel}</a>`;
      }
      if (member.socials.twitter) {
        socialsHTML += `<a href="${member.socials.twitter}" target="_blank" rel="noopener" class="team-social-btn twitter" title="Twitter / X">🐦 X / Twitter</a>`;
      }
      if (member.socials.steam) {
        socialsHTML += `<a href="${member.socials.steam}" target="_blank" rel="noopener" class="team-social-btn steam" title="Steam">🎮 Steam</a>`;
      }
      if (member.socials.youtube) {
        socialsHTML += `<a href="${member.socials.youtube}" target="_blank" rel="noopener" class="team-social-btn youtube" title="YouTube">▶️ YouTube</a>`;
      }
      if (member.socials.github) {
        socialsHTML += `<a href="${member.socials.github}" target="_blank" rel="noopener" class="team-social-btn github" title="GitHub">🐙 GitHub</a>`;
      }
    }

    return `
      <div class="team-card">
        <div class="team-card-header">
          <div class="team-avatar-box">
            <img src="${member.avatar}" alt="${member.name}" class="team-avatar-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';">
            <span class="status-badge ${statusInfo.dotClass}" title="${statusInfo.text}"></span>
          </div>
          <div class="team-header-info">
            <div class="team-header-badges">
              <span class="team-member-badge">${member.badge || 'Integrante'}</span>
              ${statusInfo.badgeHtml}
            </div>
            <h3 class="team-member-name">${member.name}</h3>
            <span class="team-member-role">${member.role || 'Modder & Desenvolvedor'}</span>
          </div>
        </div>

        <p class="team-member-bio">${member.bio || ''}</p>

        <div class="team-specs-section">
          <span class="team-specs-title">🎯 Especialidades & Foco:</span>
          <div class="team-specs-grid">
            ${specialtiesHTML}
          </div>
        </div>

        <div class="team-card-footer">
          <div class="team-socials-row">
            ${socialsHTML}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Trigger Anime.js stagger cascade for team cards
  triggerGridStaggerAnimation();
}

// ALTERNAR ENTRE GERENCIADOR DE POSTS E GERENCIADOR DE EQUIPE NO SUBPAGE
function switchAdminSection(section) {
  const postsSec = document.getElementById("section-admin-posts");
  const teamSec = document.getElementById("section-admin-team");
  const btnPosts = document.getElementById("admin-tab-posts");
  const btnTeam = document.getElementById("admin-tab-team");

  if (section === "posts") {
    if (postsSec) postsSec.style.display = "grid";
    if (teamSec) teamSec.style.display = "none";
    if (btnPosts) btnPosts.classList.add("active");
    if (btnTeam) btnTeam.classList.remove("active");
  } else {
    if (postsSec) postsSec.style.display = "none";
    if (teamSec) teamSec.style.display = "grid";
    if (btnPosts) btnPosts.classList.remove("active");
    if (btnTeam) btnTeam.classList.add("active");
    populateTeamSelector();
    loadSelectedTeamMemberForEdit();
  }
}

// POPULAR SELETOR DE INTEGRANTES NO SUBPAGE GERADOR
function populateTeamSelector() {
  const select = document.getElementById("select-team-member");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = "";

  TEAM_DATA.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.badge || '👤'} ${m.name} (${m.nickname || m.role})`;
    select.appendChild(opt);
  });

  const optNew = document.createElement("option");
  optNew.value = "new_member";
  optNew.textContent = "➕ [Adicionar Novo Integrante]";
  select.appendChild(optNew);

  if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
    select.value = currentVal;
  } else {
    select.value = TEAM_DATA[0] ? TEAM_DATA[0].id : "new_member";
  }
}

function loadSelectedTeamMemberForEdit() {
  const select = document.getElementById("select-team-member");
  if (!select) return;

  const id = select.value;
  const deleteBtn = document.getElementById("btn-delete-team-member");

  if (id === "new_member") {
    resetTeamFormToNew();
    if (deleteBtn) deleteBtn.style.display = "none";
    return;
  }

  const member = TEAM_DATA.find(m => m.id === id);
  if (!member) return;

  document.getElementById("team-input-id").value = member.id;
  document.getElementById("team-input-name").value = member.name || "";
  document.getElementById("team-input-role").value = member.role || "";
  document.getElementById("team-input-badge").value = member.badge || "";
  document.getElementById("team-input-status").value = member.status || "Em Atividade";
  document.getElementById("team-input-avatar").value = member.avatar || "";
  document.getElementById("team-input-bio").value = member.bio || "";
  document.getElementById("team-input-specs").value = (member.specialties || []).join(", ");
  document.getElementById("team-input-discord").value = (member.socials && member.socials.discord) || "";
  document.getElementById("team-input-youtube").value = (member.socials && member.socials.youtube) || "";
  const twInput = document.getElementById("team-input-twitter");
  if (twInput) twInput.value = (member.socials && member.socials.twitter) || "";
  const stInput = document.getElementById("team-input-steam");
  if (stInput) stInput.value = (member.socials && member.socials.steam) || "";

  if (deleteBtn) {
    deleteBtn.style.display = member.id === "rafael-godoy" ? "none" : "block";
  }

  updateTeamPreview();
}

function resetTeamFormToNew() {
  const select = document.getElementById("select-team-member");
  if (select) select.value = "new_member";

  document.getElementById("team-input-id").value = "member-" + Date.now();
  document.getElementById("team-input-name").value = "";
  document.getElementById("team-input-role").value = "Modder & Colaborador";
  document.getElementById("team-input-badge").value = "⚡ Equipe";
  document.getElementById("team-input-status").value = "Em Atividade";
  document.getElementById("team-input-avatar").value = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
  document.getElementById("team-input-bio").value = "";
  document.getElementById("team-input-specs").value = "Modding, Traduções";
  document.getElementById("team-input-discord").value = "https://discord.com/invite/atFQmmR2fy";
  document.getElementById("team-input-youtube").value = "";
  const twInput = document.getElementById("team-input-twitter");
  if (twInput) twInput.value = "";
  const stInput = document.getElementById("team-input-steam");
  if (stInput) stInput.value = "";

  const deleteBtn = document.getElementById("btn-delete-team-member");
  if (deleteBtn) deleteBtn.style.display = "none";

  updateTeamPreview();
}

function updateTeamPreview() {
  const previewBox = document.getElementById("team-rendered-preview");
  const codeDisplay = document.getElementById("team-code-display");

  const nameElem = document.getElementById("team-input-name");
  if (!nameElem) return;

  const name = nameElem.value.trim() || "Nome do Integrante";
  const role = document.getElementById("team-input-role").value.trim() || "Cargo";
  const badge = document.getElementById("team-input-badge").value.trim() || "⚡ Equipe";
  const status = document.getElementById("team-input-status").value.trim() || "Em Atividade";
  const avatar = document.getElementById("team-input-avatar").value.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
  const bio = document.getElementById("team-input-bio").value.trim() || "Biografia do integrante da equipe...";
  const specsRaw = document.getElementById("team-input-specs").value.trim();
  const specs = specsRaw ? specsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  const specsHTML = specs.map(s => `<span class="team-spec-chip">${s}</span>`).join("");
  const statusInfo = getTeamStatusInfo(status);

  if (previewBox) {
    previewBox.innerHTML = `
      <div class="team-card" style="margin: 0; box-shadow: none;">
        <div class="team-card-header">
          <div class="team-avatar-box">
            <img src="${avatar}" alt="${name}" class="team-avatar-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';">
            <span class="status-badge ${statusInfo.dotClass}" title="${statusInfo.text}"></span>
          </div>
          <div class="team-header-info">
            <div class="team-header-badges">
              <span class="team-member-badge">${badge}</span>
              ${statusInfo.badgeHtml}
            </div>
            <h3 class="team-member-name">${name}</h3>
            <span class="team-member-role">${role}</span>
          </div>
        </div>
        <p class="team-member-bio">${bio}</p>
        <div class="team-specs-section">
          <span class="team-specs-title">🎯 Especialidades & Foco:</span>
          <div class="team-specs-grid">${specsHTML}</div>
        </div>
      </div>
    `;
  }

  if (codeDisplay) {
    codeDisplay.textContent = JSON.stringify(TEAM_DATA, null, 2);
  }
}

function handleTeamAvatarUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (evt) {
    const dataUrl = evt.target.result;
    const avatarInput = document.getElementById("team-input-avatar");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url && avatarInput) {
          avatarInput.value = data.url;
          updateTeamPreview();
          return;
        }
      }
    } catch (err) {
      console.warn("Upload de avatar no servidor indisponível, usando DataURL direto:", err);
    }

    if (avatarInput) {
      avatarInput.value = dataUrl;
      updateTeamPreview();
    }
  };
  reader.readAsDataURL(file);
}

function saveTeamMember() {
  const id = document.getElementById("team-input-id").value.trim() || "member-" + Date.now();
  const name = document.getElementById("team-input-name").value.trim();
  const role = document.getElementById("team-input-role").value.trim();
  const badge = document.getElementById("team-input-badge").value.trim();
  const status = document.getElementById("team-input-status").value.trim() || "Em Atividade";
  const avatar = document.getElementById("team-input-avatar").value.trim();
  const bio = document.getElementById("team-input-bio").value.trim();
  const specsRaw = document.getElementById("team-input-specs").value.trim();
  const specs = specsRaw ? specsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const discord = document.getElementById("team-input-discord").value.trim();
  const youtube = document.getElementById("team-input-youtube").value.trim();
  const twitter = document.getElementById("team-input-twitter") ? document.getElementById("team-input-twitter").value.trim() : "";
  const steam = document.getElementById("team-input-steam") ? document.getElementById("team-input-steam").value.trim() : "";

  if (!name) {
    showToast("Por favor, preencha o Nome do integrante.", "error");
    return;
  }

  const socials = {};
  if (discord) socials.discord = discord;
  if (youtube) socials.youtube = youtube;
  if (twitter) socials.twitter = twitter;
  if (steam) socials.steam = steam;

  const memberObj = {
    id,
    name,
    nickname: name,
    role: role || "Modder",
    badge: badge || "⚡ Equipe",
    avatar: avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    status: status || "Ativo",
    bio: bio || "",
    specialties: specs,
    socials
  };

  const existingIdx = TEAM_DATA.findIndex(m => m.id === id);
  if (existingIdx >= 0) {
    TEAM_DATA[existingIdx] = memberObj;
  } else {
    TEAM_DATA.push(memberObj);
  }

  try {
    localStorage.setItem("godoy_team_data", JSON.stringify(TEAM_DATA));
  } catch (e) { }

  syncTeamToServer();
  populateTeamSelector();
  renderTeamCards();

  const saveTeamBtn = document.getElementById("btn-save-team");
  if (saveTeamBtn) {
    const origHtml = saveTeamBtn.innerHTML;
    saveTeamBtn.innerHTML = "✓ Integrante Salvo!";
    saveTeamBtn.style.backgroundColor = "#10b981";
    setTimeout(() => {
      saveTeamBtn.innerHTML = origHtml;
      saveTeamBtn.style.backgroundColor = "";
    }, 2500);
  }

  const teamFeedback = document.getElementById("team-save-feedback");
  if (teamFeedback) {
    teamFeedback.textContent = `✅ Integrante "${name}" salvo com sucesso!`;
    teamFeedback.style.display = "flex";
    setTimeout(() => {
      teamFeedback.style.display = "none";
    }, 4500);
  }

  showToast(`✅ Integrante "${name}" salvo com sucesso na equipe!`, "success");
}

function deleteSelectedTeamMember() {
  const select = document.getElementById("select-team-member");
  if (!select) return;

  const id = select.value;
  if (id === "rafael-godoy") {
    showToast("O fundador da equipe não pode ser excluído.", "error");
    return;
  }

  const member = TEAM_DATA.find(m => m.id === id);
  if (!member) return;

  showCustomConfirm({
    title: "Remover Integrante",
    message: `Tem certeza de que deseja remover "${member.name}" da equipe?`,
    confirmText: "Remover Integrante",
    cancelText: "Cancelar",
    isDanger: true,
    onConfirm: async () => {
      TEAM_DATA = TEAM_DATA.filter(m => m.id !== id);
      try {
        localStorage.setItem("godoy_team_data", JSON.stringify(TEAM_DATA));
      } catch (e) { }
      await syncTeamToServer();
      populateTeamSelector();
      loadSelectedTeamMemberForEdit();
      renderTeamCards();
      showToast(`Integrante "${member.name}" removido da equipe com sucesso!`, "success");
    }
  });
}

// Ajustar altura de iframe dinamicamente caso o site interno envie postMessage com altura
window.addEventListener("message", (e) => {
  if (e.data && (e.data.iframeHeight || e.data.height)) {
    const newHeight = e.data.iframeHeight || e.data.height;
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      iframe.style.height = newHeight + "px";
    });
  }
});

// Inicialização dos eventos de colar/upload de imagem
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    setupEditorDragDropAndPaste();
  });
  if (document.readyState === "interactive" || document.readyState === "complete") {
    setupEditorDragDropAndPaste();
  }
}

