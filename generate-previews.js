import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const projectsFilePath = path.join(rootDir, 'data', 'projects.json');
const previewsDir = path.join(rootDir, 'p');

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getDefaultThemeColor(platform, tags) {
  const str = `${platform || ''} ${(tags || []).join(' ')}`.toLowerCase();
  if (str.includes('cod') || str.includes('call of duty')) return '#22c55e';
  if (str.includes('mario') || str.includes('switch') || str.includes('nintendo')) return '#ef4444';
  if (str.includes('gta') || str.includes('san andreas')) return '#16a34a';
  if (str.includes('vice city')) return '#ec4899';
  if (str.includes('god of war')) return '#dc2626';
  if (str.includes('red dead') || str.includes('rdr')) return '#b91c1c';
  if (str.includes('ps2') || str.includes('playstation 2') || str.includes('ps3') || str.includes('playstation 3')) return '#3b82f6';
  if (str.includes('xbox')) return '#10b981';
  if (str.includes('pc')) return '#8b5cf6';
  if (str.includes('android')) return '#3ddc84';
  return '#6366f1';
}

export function generatePreviews() {
  console.log('🚀 Gerando páginas de preview estáticas para redes sociais (Discord, WhatsApp, etc.)...');

  let rawData;
  if (fs.existsSync(projectsFilePath)) {
    rawData = fs.readFileSync(projectsFilePath, 'utf-8');
  } else {
    console.error('❌ Nenhum arquivo data/projects.json encontrado.');
    return;
  }

  let projects;
  try {
    projects = JSON.parse(rawData);
  } catch (err) {
    console.error('❌ Erro ao ler JSON dos projetos:', err);
    return;
  }

  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
  }

  // Limpar pastas órfãs/antigas dentro de /p/ que foram renomeadas ou excluídas
  const validIds = new Set(projects.map(p => p && p.id).filter(Boolean));
  const existingItems = fs.readdirSync(previewsDir);
  for (const item of existingItems) {
    const itemPath = path.join(previewsDir, item);
    if (fs.statSync(itemPath).isDirectory() && !validIds.has(item)) {
      console.log(`🧹 Removendo pasta de preview obsoleta: /p/${item}`);
      fs.rmSync(itemPath, { recursive: true, force: true });
    }
  }

  // index.html dentro da pasta /p/ redirecionando para a home
  const rootPreviewHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=https://rafaelgodoyebert.github.io/godoymods/">
  <script>window.location.replace("https://rafaelgodoyebert.github.io/godoymods/");</script>
  <title>Godoy Mods - Previews</title>
</head>
<body>
  <p>Redirecionando para <a href="https://rafaelgodoyebert.github.io/godoymods/">Godoy Mods</a>...</p>
</body>
</html>`;
  fs.writeFileSync(path.join(previewsDir, 'index.html'), rootPreviewHtml, 'utf-8');

  let count = 0;
  projects.forEach(project => {
    if (!project.id || project.id === 'preview-temp-id') return;

    const projectId = project.id;
    const projectFolder = path.join(previewsDir, projectId);
    if (!fs.existsSync(projectFolder)) {
      fs.mkdirSync(projectFolder, { recursive: true });
    }

    const title = escapeHtml(project.title || 'Godoy Mods');
    const fullTitle = `${title} - Godoy Mods`;

    let descriptionText = project.description || stripHtml(project.content) || 'Confira os mods, traduções e devlogs de jogos no Godoy Mods!';
    descriptionText = escapeHtml(descriptionText.substring(0, 200));

    const defaultImage = 'https://rafaelgodoyebert.github.io/godoymods/images/team/rafael-godoy.webp';
    let rawImg = project.image && project.image.trim() !== '' ? project.image.trim() : defaultImage;

    if (rawImg.includes('duckduckgo.com/iu/?u=')) {
      const match = rawImg.match(/u=([^&]+)/);
      if (match && match[1]) {
        try {
          rawImg = decodeURIComponent(match[1]);
        } catch (e) { }
      }
    }
    let ogImageUrl = rawImg;
    if (ogImageUrl && !ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
      ogImageUrl = `https://rafaelgodoyebert.github.io/godoymods/${ogImageUrl.replace(/^\.?\//, '')}`;
    }
    const imageUrl = ogImageUrl.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const targetUrl = `https://rafaelgodoyebert.github.io/godoymods/#${projectId}`;
    const pageUrl = `https://rafaelgodoyebert.github.io/godoymods/p/${projectId}/`;
    const themeColor = project.themeColor || getDefaultThemeColor(project.platform, project.tags);

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${descriptionText}">
  <meta name="theme-color" content="${themeColor}">
  
  <!-- Open Graph / Facebook / Discord / WhatsApp / Telegram -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${descriptionText}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Godoy Mods">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${descriptionText}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Redirecionamento exclusivo via Javascript para visitantes humanos (sem quebrar bots) -->
  <script>
    window.location.replace("${targetUrl}");
  </script>
</head>
<body>
  <p>Redirecionando para <a href="${targetUrl}">${fullTitle}</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(projectFolder, 'index.html'), htmlContent, 'utf-8');
    count++;
  });

  console.log(`✅ ${count} páginas de preview estáticas geradas com sucesso na pasta /p/!`);
}

// Executar se chamado diretamente
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('generate-previews.js')) {
  generatePreviews();
}
