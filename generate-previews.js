import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const projectsFilePath = path.join(rootDir, 'data', 'projects.json');
const fallbackProjectsFilePath = path.join(rootDir, 'projects.json');
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

export function generatePreviews() {
  console.log('🚀 Gerando páginas de preview estáticas para redes sociais (Discord, WhatsApp, etc.)...');
  
  let rawData;
  if (fs.existsSync(projectsFilePath)) {
    rawData = fs.readFileSync(projectsFilePath, 'utf-8');
  } else if (fs.existsSync(fallbackProjectsFilePath)) {
    rawData = fs.readFileSync(fallbackProjectsFilePath, 'utf-8');
  } else {
    console.error('❌ Nenhum arquivo projects.json encontrado.');
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

    const defaultImage = 'https://i.imgur.com/OgaeHFx.png';
    const imageUrl = escapeHtml(project.image && project.image.trim() !== '' ? project.image : defaultImage);
    const targetUrl = `https://rafaelgodoyebert.github.io/godoymods/#${projectId}`;
    const pageUrl = `https://rafaelgodoyebert.github.io/godoymods/p/${projectId}/`;

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${descriptionText}">
  
  <!-- Open Graph / Facebook / Discord / WhatsApp -->
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

  <!-- Redirecionamento instantâneo para o modal no site principal -->
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
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
