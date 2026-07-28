// GODOY MODS - SCRIPT PRINCIPAL & ESTADO LOCAL

// INICIALIZAR DADOS DOS PROJETOS (Separado na pasta /data/projects.json)
let PROJECTS_DATA = [];

try {
  const savedData = localStorage.getItem("godoy_projects_data");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      PROJECTS_DATA = parsed;
    }
  }
} catch (e) {
  PROJECTS_DATA = [];
}

// Carregar dados de /data/projects.json ou API do Servidor
async function loadProjectsFromServer() {
  // 1. Tentar carregar da API do servidor
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const serverProjects = await res.json();
      if (Array.isArray(serverProjects) && serverProjects.length > 0) {
        PROJECTS_DATA = serverProjects;
        try {
          localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
        } catch (e) {}
        renderAllCards();
        if (document.getElementById("select-existing-post")) {
          populatePostSelector();
        }
        return;
      }
    }
  } catch (err) {
    console.warn("API do servidor indisponível, buscando arquivo JSON em /data/projects.json:", err);
  }

  // 2. Tentar carregar do arquivo separado /data/projects.json
  try {
    let jsonRes = await fetch("./data/projects.json");
    if (!jsonRes.ok) {
      jsonRes = await fetch("./projects.json");
    }
    if (jsonRes.ok) {
      const localProjects = await jsonRes.json();
      if (Array.isArray(localProjects) && localProjects.length > 0) {
        PROJECTS_DATA = localProjects;
        try {
          localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
        } catch (e) {}
        renderAllCards();
        if (document.getElementById("select-existing-post")) {
          populatePostSelector();
        }
        syncProjectsToServer();
        return;
      }
    }
  } catch (err) {
    console.error("Erro ao carregar projetos de /data/projects.json:", err);
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

let activePlatformFilter = "all";
let activeSearchQuery = "";
let currentTab = "devlogs";
let currentOutputFormat = "js";
let lastSubmittedOrderSummary = "";

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderAllCards();
  initNavTabsScroll();
  loadProjectsFromServer();

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
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `pane-${tabId}`);
  });
  renderAllCards();
}

// FILTRAR POR PLATAFORMA
function setFilter(platform) {
  activePlatformFilter = platform;
  document.querySelectorAll(".pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.platform === platform);
  });
  renderAllCards();
}

// BUSCA
function handleSearch(query) {
  activeSearchQuery = query.toLowerCase().trim();
  renderAllCards();
}

// RENDERIZAR CARDS NO GRID
function renderAllCards() {
  const devlogsGrid = document.getElementById("grid-devlogs");
  const completedGrid = document.getElementById("grid-completed");
  const ongoingGrid = document.getElementById("grid-ongoing");
  const paidGrid = document.getElementById("grid-paid");
  const archivedGrid = document.getElementById("grid-archived");
  const abandonedGrid = document.getElementById("grid-abandoned");

  // Atualizar contadores das abas
  const completedTotal = PROJECTS_DATA.filter(i => i.type === "completed").length;
  const ongoingTotal = PROJECTS_DATA.filter(i => i.type === "ongoing").length;
  const paidTotal = PROJECTS_DATA.filter(i => i.type === "paid").length;
  const archivedTotal = PROJECTS_DATA.filter(i => i.type === "archived").length;
  const abandonedTotal = PROJECTS_DATA.filter(i => i.type === "abandoned").length;

  const bCompleted = document.getElementById("badge-completed");
  const bOngoing = document.getElementById("badge-ongoing");
  const bPaid = document.getElementById("badge-paid");
  const bArchived = document.getElementById("badge-archived");
  const bAbandoned = document.getElementById("badge-abandoned");

  if (bCompleted) bCompleted.textContent = completedTotal;
  if (bOngoing) bOngoing.textContent = ongoingTotal;
  if (bPaid) bPaid.textContent = paidTotal;
  if (bArchived) bArchived.textContent = archivedTotal;
  if (bAbandoned) bAbandoned.textContent = abandonedTotal;

  const filtered = PROJECTS_DATA.filter(item => {
    const matchPlatform = activePlatformFilter === "all" || item.platform === activePlatformFilter;
    const matchSearch = !activeSearchQuery || 
      item.title.toLowerCase().includes(activeSearchQuery) || 
      item.description.toLowerCase().includes(activeSearchQuery) ||
      item.tags.some(t => t.toLowerCase().includes(activeSearchQuery));
    return matchPlatform && matchSearch;
  });

  if (devlogsGrid) {
    const devlogItems = filtered.filter(i => i.type === "devlog" || i.type === "ongoing" || i.type === "completed" || i.type === "paid");
    devlogsGrid.innerHTML = devlogItems.map(createCardHTML).join("") || getEmptyHTML();
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

  const tagsHTML = (item.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join("");

  return `
    <article class="card card-clickable" onclick="openPostModal('${item.id}')">
      <div class="card-media">
        <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';">
        <div class="card-media-overlay"></div>
        ${statusBadge}
      </div>
      <div class="card-body">
        <span class="card-date">${item.date} • ${item.platform}</span>
        <h3 class="card-title">
          <a href="javascript:void(0)" class="card-title-link">${item.title}</a>
        </h3>
        <p class="card-description">${item.description}</p>
        ${progressBarHTML}
        <div class="card-tags">
          ${tagsHTML}
        </div>
        <div class="card-action-bar">
          <button class="card-read-btn" onclick="openPostModal('${item.id}'); event.stopPropagation();">
            📖 Ler Post Completo
          </button>
        </div>
      </div>
    </article>
  `;
}

function getEmptyHTML() {
  return `
    <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
      <p style="font-size: 1.1rem; font-weight: 600;">Nenhum item encontrado.</p>
      <p style="font-size: 0.85rem; margin-top: 4px;">Tente alterar os filtros de busca ou plataforma.</p>
    </div>
  `;
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

  // Tags / Badges
  const tagsHTML = (item.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join("");
  modalTags.innerHTML = tagsHTML;

  // Título e Meta
  modalTitle.textContent = item.title;
  modalMeta.innerHTML = `📅 ${item.date} • 🎮 ${item.platform}`;

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

  // Conteúdo textual
  const defaultBody = `<p>${item.description}</p>`;
  modalContent.innerHTML = item.content || defaultBody;

  // Footer com Ações (Apoiar, Download, Discord)
  let footerHTML = `
    <button class="btn-secondary-action" onclick="closePostModal()">Fechar</button>
  `;

  if (item.downloadUrl) {
    footerHTML = `
      <a href="${item.downloadUrl}" target="_blank" rel="noopener" class="btn-primary-action">
        💬 Ver no Discord / Download
      </a>
      ${footerHTML}
    `;
  }

  modalFooter.innerHTML = footerHTML;

  // Exibir Modal
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Impedir rolagem da página atrás
}

function closePostModal(e) {
  if (e && e.target && e.target.id !== "post-modal-overlay" && !e.target.classList.contains("modal-close-btn") && !e.target.classList.contains("btn-secondary-action")) {
    return;
  }
  const modalOverlay = document.getElementById("post-modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Restaurar rolagem
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

  const item = PROJECTS_DATA.find(p => p.id === postId);
  if (!item) return;

  if (deleteBtn) deleteBtn.style.display = "inline-flex";
  if (heading) heading.textContent = `✏️ Editando: ${item.title}`;

  document.getElementById("input-id").value = item.id;
  document.getElementById("input-title").value = item.title || "";
  document.getElementById("input-type").value = item.type || "devlog";
  document.getElementById("input-platform").value = item.platform || "PlayStation 2";
  document.getElementById("input-image").value = item.image || "";
  document.getElementById("input-date").value = item.date || "";
  document.getElementById("input-progress").value = item.progress || 50;
  document.getElementById("input-tags").value = (item.tags || []).join(", ");
  document.getElementById("input-summary").value = item.description || "";
  document.getElementById("input-content").value = item.content || "";
  document.getElementById("input-download").value = item.downloadUrl || "";

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
  document.getElementById("input-image").value = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";
  
  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById("input-date").value = today.toLocaleDateString('pt-BR', options);
  
  document.getElementById("input-progress").value = "70";
  document.getElementById("input-tags").value = "Devlog, God of War, IA, PS2";
  document.getElementById("input-summary").value = "Avanços na dublagem e sincronia de vozes para o PlayStation 2 e PlayStation 3.";
  document.getElementById("input-content").value = `<p>Confira as últimas novidades e melhorias do nosso projeto de modificação!</p>\n\n<h3>✨ Destaques do Update:</h3>\n<ul>\n  <li>Sincronização de vozes principais concluída.</li>\n  <li>Ajustes de áudio em alta fidelidade.</li>\n</ul>`;
  document.getElementById("input-download").value = "https://discord.com/invite/atFQmmR2fy";

  updateGeneratorPreview();
}

function updateGeneratorPreview() {
  const title = document.getElementById("input-title").value.trim() || "Título da Publicação";
  const type = document.getElementById("input-type").value || "devlog";
  const platform = document.getElementById("input-platform").value.trim() || "Multi-plataforma";
  const image = document.getElementById("input-image").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
  const date = document.getElementById("input-date").value.trim() || "28 de Julho, 2026";
  const progress = parseInt(document.getElementById("input-progress").value) || 50;
  const tagsStr = document.getElementById("input-tags").value.trim();
  const description = document.getElementById("input-summary").value.trim() || "Sem resumo disponível.";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();
  const existingId = document.getElementById("input-id").value;

  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];

  const id = existingId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

  const currentObj = {
    id,
    type,
    title,
    date,
    description,
    platform,
    image,
    tags,
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
  reader.onload = function(event) {
    const dataUrl = event.target.result;
    const imgInput = document.getElementById("input-image");
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
    alert("Por favor, preencha o Título do post antes de salvar.");
    return;
  }

  const existingId = document.getElementById("input-id").value;
  const id = existingId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

  const type = document.getElementById("input-type").value;
  const platform = document.getElementById("input-platform").value.trim() || "PlayStation 2";
  const image = document.getElementById("input-image").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";
  const date = document.getElementById("input-date").value.trim() || "28 de Julho, 2026";
  const progress = parseInt(document.getElementById("input-progress").value) || 50;
  const tagsStr = document.getElementById("input-tags").value.trim();
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : ["Mod"];
  const description = document.getElementById("input-summary").value.trim() || "Sem descrição disponível.";
  const content = document.getElementById("input-content").value.trim();
  const downloadUrl = document.getElementById("input-download").value.trim();

  const postObj = {
    id,
    type,
    title,
    date,
    description,
    platform,
    image,
    tags,
    ...(type === "ongoing" ? { progress } : {}),
    content,
    downloadUrl
  };

  const existingIndex = PROJECTS_DATA.findIndex(p => p.id === id);
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

  alert(`✅ Post "${title}" salvo com sucesso no servidor e no site!\n\nAs alterações já estão ativas para todos os visitantes.`);
}

function deleteSelectedPost() {
  const id = document.getElementById("input-id").value;
  if (!id) return;

  const item = PROJECTS_DATA.find(p => p.id === id);
  const confirmMsg = item ? `Tem certeza que deseja excluir o post "${item.title}"?` : "Tem certeza que deseja excluir este post?";
  
  if (confirm(confirmMsg)) {
    PROJECTS_DATA = PROJECTS_DATA.filter(p => p.id !== id);
    try {
      localStorage.setItem("godoy_projects_data", JSON.stringify(PROJECTS_DATA));
    } catch (e) {}
    syncProjectsToServer();

    alert("🗑️ Post removido com sucesso!");
    populatePostSelector();
    resetFormToNew();
    renderAllCards();
  }
}

async function restoreDefaultData() {
  if (confirm("Deseja restaurar as publicações padrões originais do site? Todas as edições serão resetadas para a versão original de /data/projects.json.")) {
    try {
      localStorage.removeItem("godoy_projects_data");
      let res = await fetch("./data/projects.json");
      if (!res.ok) {
        res = await fetch("./projects.json");
      }
      if (res.ok) {
        PROJECTS_DATA = await res.json();
        syncProjectsToServer();
        populatePostSelector();
        loadSelectedPostForEdit();
        renderAllCards();
        alert("🔄 Dados do site restaurados para a versão padrão de /data/projects.json.");
      }
    } catch (err) {
      alert("Erro ao restaurar publicações padrão: " + err.message);
    }
  }
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

