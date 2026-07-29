// GODOY MODS - SCRIPT PRINCIPAL & ESTADO LOCAL

// Limpeza de localStorage de projetos legados/antigos
try {
  localStorage.removeItem("godoy_projects_data");
} catch (e) {}

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

// ESTADO DOS PROJETOS
let PROJECTS_DATA = [];

// Carregar dados de /projects.json, /data/projects.json ou /api/projects
async function loadProjectsFromServer() {
  function handleEditorAutoSelect() {
    if (document.getElementById("select-existing-post")) {
      populatePostSelector();
      const selectElem = document.getElementById("select-existing-post");
      if (selectElem && selectElem.options.length > 1 && (selectElem.value === "new" || !selectElem.value) && !document.getElementById("input-id").value) {
        selectElem.selectedIndex = 1;
        loadSelectedPostForEdit();
      }
    }
  }

  // 1. Tentar carregar da API do servidor
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const serverProjects = await res.json();
      if (Array.isArray(serverProjects) && serverProjects.length > 0) {
        PROJECTS_DATA = serverProjects;
        renderAllCards();
        handleEditorAutoSelect();
        return;
      }
    }
  } catch (err) {
    console.warn("API do servidor indisponível, tentando arquivos estáticos:", err);
  }

  // 2. Tentar carregar dos arquivos JSON estáticos
  try {
    let jsonRes = await fetch("./projects.json");
    if (!jsonRes.ok) {
      jsonRes = await fetch("./data/projects.json");
    }
    if (jsonRes.ok) {
      const localProjects = await jsonRes.json();
      if (Array.isArray(localProjects) && localProjects.length > 0) {
        PROJECTS_DATA = localProjects;
        renderAllCards();
        handleEditorAutoSelect();
        return;
      }
    }
  } catch (err) {
    console.warn("Nenhum arquivo JSON estático pôde ser lido:", err);
  }
}

async function syncProjectsToServer() {
  try {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PROJECTS_DATA)
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
    "avatar": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
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
        } catch (e) {}
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
    let jsonRes = await fetch("./data/team.json");
    if (!jsonRes.ok) {
      jsonRes = await fetch("./team.json");
    }
    if (jsonRes.ok) {
      const localTeam = await jsonRes.json();
      if (Array.isArray(localTeam) && localTeam.length > 0) {
        TEAM_DATA = localTeam;
        try {
          localStorage.setItem("godoy_team_data", JSON.stringify(TEAM_DATA));
        } catch (e) {}
        renderTeamCards();
        if (document.getElementById("select-team-member")) {
          populateTeamSelector();
        }
        return;
      }
    }
  } catch (err) {}
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
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderAllCards();
  renderTeamCards();
  initNavTabsScroll();
  loadProjectsFromServer();
  loadTeamFromServer();
  animateOnLoad();

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
    if (tabId === "contact" || tabId === "team") {
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

  // Badge da Aba Catálogo de Projetos
  const bProjects = document.getElementById("badge-projects");
  if (bProjects) bProjects.textContent = PROJECTS_DATA.length;

  // Filtragem Global Combinada (Status + Plataforma + Subtag + Busca)
  const filtered = PROJECTS_DATA.filter(item => {
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

  // Atualizar Contador de Resultados
  const countNumElem = document.getElementById("results-count-num");
  if (countNumElem) {
    countNumElem.textContent = filtered.length;
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
    const devlogItems = filtered.filter(i => i.type === "devlog" || i.type === "ongoing" || i.type === "completed" || i.type === "paid");
    devlogsGrid.innerHTML = devlogItems.map(createCardHTML).join("") || getEmptyHTML();
  }

  if (projectsGrid) {
    projectsGrid.innerHTML = filtered.map(createCardHTML).join("") || getEmptyHTML();
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
    statusBadge = `<span class="card-status-tag status-ongoing">⚙️ ${progressVal}%</span>`;
    progressBarHTML = `
      <div class="card-progress-wrapper">
        <div class="card-progress-header">
          <span class="progress-label">⚙️ Progresso da Dublagem</span>
          <span class="progress-percent-val">${progressVal}%</span>
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill" style="width: ${progressVal}%;"></div>
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

  return `
    <article class="card card-clickable" onclick="openPostModal('${item.id}')">
      <div class="card-media">
        <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';">
        <div class="card-media-overlay"></div>
        ${statusBadge}
      </div>
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
          <span class="card-date">${item.date} • ${item.platform}</span>
          ${subtagBadgeHTML}
        </div>
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
    return `${prefix}<div class="blog-embed-container"><iframe src="https://www.youtube.com/embed/${videoId}" title="Vídeo do YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  });

  // 3. Garantir que todas as tags <iframe> existentes estejam envoltas em div responsiva .blog-embed-container
  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const iframes = doc.querySelectorAll("iframe");
      iframes.forEach(iframe => {
        if (!iframe.parentElement.classList.contains("blog-embed-container")) {
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

// HELPER PARA INSERÇÃO NO EDITOR DE BLOG (gerador.html)
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
      replacement = `\n<div class="blog-embed-container">\n  <iframe src="${embedSrc}" title="Vídeo do Post" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div>\n`;
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
  const date = document.getElementById("input-date").value.trim() || "Hoje";
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

// LÓGICA DO MODAL DE DETALHES DO POST
function openPostModal(postId) {
  const item = PROJECTS_DATA.find(p => p.id === postId);
  if (!item) return;

  const modalOverlay = document.getElementById("post-modal-overlay");
  const modalTags = document.getElementById("modal-tags");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalImage = document.getElementById("modal-image");
  const modalMediaBg = document.getElementById("modal-media-bg");
  const modalContent = document.getElementById("modal-content");
  const modalFooter = document.getElementById("modal-footer");

  if (!modalOverlay) return;

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
  modalMeta.innerHTML = `📅 ${item.date} • 🎮 ${item.platform} ${subtagBadgeHTML ? `• ${subtagBadgeHTML}` : ""}`;

  // Imagem
  if (modalImage) {
    const parentContainer = modalImage.parentElement;
    if (item.image && item.image.trim() !== "") {
      if (parentContainer) parentContainer.style.display = "flex";
      modalImage.onerror = function() {
        this.onerror = null;
        const fallback = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
        this.src = fallback;
        if (modalMediaBg) modalMediaBg.style.backgroundImage = `url('${fallback}')`;
      };
      modalImage.src = item.image;
      modalImage.alt = item.title;
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

  // Footer com Ações Limpas
  let footerHTML = `
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
  const modalOverlay = document.getElementById("post-modal-overlay");
  if (modalOverlay) {
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

  PROJECTS_DATA.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    let icon = "📰";
    if (item.type === "ongoing") icon = "⚙️";
    if (item.type === "completed") icon = "✅";
    if (item.type === "paid") icon = "💰";
    if (item.type === "archived") icon = "📦";
    if (item.type === "abandoned") icon = "🚫";
    option.textContent = `${icon} ${item.title}`;
    selectElem.appendChild(option);
  });

  if (currentValue) {
    selectElem.value = currentValue;
  }
}

function handleTypeChange() {
  const typeElem = document.getElementById("input-type");
  const containerTagLinks = document.getElementById("container-tag-links");
  const type = typeElem ? typeElem.value : "devlog";
  if (containerTagLinks) {
    containerTagLinks.style.display = (type === "devlog") ? "none" : "block";
  }
  updateGeneratorPreview();
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
  document.getElementById("input-date").value = item.date || "";
  document.getElementById("input-progress").value = item.progress || 50;
  document.getElementById("input-tags").value = (item.tags || []).join(", ");
  document.getElementById("input-summary").value = item.description || "";
  document.getElementById("input-content").value = (item.content || "").replace(/\\n/g, "\n");
  document.getElementById("input-download").value = item.downloadUrl || "";

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
  
  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById("input-date").value = today.toLocaleDateString('pt-BR', options);
  
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
  const date = document.getElementById("input-date").value.trim() || "28 de Julho, 2026";
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
    description,
    platform,
    ...(subtag ? { subtag } : {}),
    image,
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
platform: "${platform}"
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
  <div class="meta">${date} • ${platform}</div>
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

function handleImageFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    const dataUrl = event.target.result;
    const imgInput = document.getElementById("input-image");
    
    // Tenta fazer o upload para a pasta /uploads/ do servidor
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url && imgInput) {
          imgInput.value = data.url;
          updateGeneratorPreview();
          return;
        }
      }
    } catch (err) {
      console.warn("Upload no servidor indisponível, usando DataURL direto:", err);
    }

    if (imgInput) {
      imgInput.value = dataUrl;
      updateGeneratorPreview();
    }
  };
  reader.readAsDataURL(file);
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
  const date = document.getElementById("input-date").value.trim() || "28 de Julho, 2026";
  const progress = parseInt(document.getElementById("input-progress").value) || 50;
  const tagsStr = document.getElementById("input-tags").value.trim();
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];
  const tagLinks = getTagLinksFromInputs();
  const description = document.getElementById("input-summary").value.trim() || "Sem descrição disponível.";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();

  const existingIndex = PROJECTS_DATA.findIndex(p => p && String(p.id).trim() === String(id).trim());
  const existingItem = existingIndex >= 0 ? PROJECTS_DATA[existingIndex] : {};

  const postObj = {
    id,
    type,
    title,
    date,
    description,
    platform,
    ...(subtag ? { subtag } : {}),
    image,
    tags,
    ...(Object.keys(tagLinks).length > 0 ? { tagLinks } : (existingItem.tagLinks ? { tagLinks: existingItem.tagLinks } : {})),
    ...(type === "ongoing" ? { progress } : {}),
    content,
    downloadUrl,
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
    localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
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
        let res = await fetch("./data/projects.json");
        if (!res.ok) {
          res = await fetch("./projects.json");
        }
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

function renderTeamCards() {
  const gridTeam = document.getElementById("grid-team");
  const countVal = document.getElementById("team-count-val");
  const badgeTeam = document.getElementById("badge-team");

  if (countVal) countVal.textContent = TEAM_DATA.length;
  if (badgeTeam) badgeTeam.textContent = TEAM_DATA.length;

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
  reader.onload = async function(evt) {
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
  } catch (e) {}

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
      } catch (e) {}
      await syncTeamToServer();
      populateTeamSelector();
      loadSelectedTeamMemberForEdit();
      renderTeamCards();
      showToast(`Integrante "${member.name}" removido da equipe com sucesso!`, "success");
    }
  });
}

