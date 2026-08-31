import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { generatePreviews } from './generate-previews.js';

const app = express();
const PORT = 3000;
const COMMISSIONS_FILE = path.join(process.cwd(), 'data', 'commissions.json');
const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');
const TEAM_FILE = path.join(process.cwd(), 'data', 'team.json');
const TOOLS_FILE = path.join(process.cwd(), 'data', 'tools.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(process.cwd()));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API: Upload de imagem de capa ou avatar com conversão automática para WebP
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const match = imageBase64.match(/^data:image\/(\w+);base64,/);
    let ext = match ? match[1] : 'png';
    if (ext === 'jpeg') ext = 'jpg';

    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    const tempFile = path.join(uploadsDir, `temp_${timestamp}_${randomId}.${ext}`);
    const webpFilename = `img_${timestamp}_${randomId}.webp`;
    const webpPath = path.join(uploadsDir, webpFilename);

    fs.writeFileSync(tempFile, Buffer.from(base64Data, 'base64'));

    try {
      execSync(`ffmpeg -y -i "${tempFile}" -c:v libwebp -quality 85 -vf "scale=if(gte(iw\\,1600)\\,1600\\,-1):-1" "${webpPath}"`, { stdio: 'ignore' });
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      res.json({ success: true, url: `/uploads/${webpFilename}` });
    } catch (convErr) {
      console.warn('Falha na conversão WebP, usando arquivo original:', convErr);
      const fallbackFilename = `img_${timestamp}_${randomId}.${ext}`;
      fs.renameSync(tempFile, path.join(uploadsDir, fallbackFilename));
      res.json({ success: true, url: `/uploads/${fallbackFilename}` });
    }
  } catch (err) {
    console.error('Erro no upload de imagem:', err);
    res.status(500).json({ error: 'Falha ao salvar imagem no servidor.' });
  }
});

// Helper para ler e salvar equipe no servidor
function loadTeam() {
  try {
    if (fs.existsSync(TEAM_FILE)) {
      const data = fs.readFileSync(TEAM_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler arquivo de equipe:', err);
  }
  return null;
}

function saveTeam(team) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar arquivo de equipe:', err);
  }
}

// API: Listar membros da equipe
app.get('/api/team', (req, res) => {
  const team = loadTeam();
  res.json(team || []);
});

// API: Atualizar membros da equipe
app.post('/api/team', (req, res) => {
  const team = req.body;
  if (!Array.isArray(team)) {
    return res.status(400).json({ error: 'Formato inválido. Esperado um Array de membros.' });
  }
  saveTeam(team);
  res.json({ success: true, count: team.length });
});

// Helper para ler e salvar ferramentas no servidor
function loadTools() {
  try {
    if (fs.existsSync(TOOLS_FILE)) {
      const data = fs.readFileSync(TOOLS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler arquivo de ferramentas:', err);
  }
  return null;
}

function saveTools(tools) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(TOOLS_FILE, JSON.stringify(tools, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar arquivo de ferramentas:', err);
  }
}

// API: Listar ferramentas
app.get('/api/tools', (req, res) => {
  const tools = loadTools();
  res.json(tools || []);
});

// API: Atualizar ferramentas
app.post('/api/tools', (req, res) => {
  const tools = req.body;
  if (!Array.isArray(tools)) {
    return res.status(400).json({ error: 'Formato inválido. Esperado um Array de ferramentas.' });
  }
  saveTools(tools);
  res.json({ success: true, count: tools.length });
});

// Helper para ler e salvar projetos no servidor
function loadProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler arquivo de projetos:', err);
  }
  return null;
}

function saveProjects(projects) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    generatePreviews();
  } catch (err) {
    console.error('Erro ao salvar arquivo de projetos:', err);
  }
}

// API: Listar projetos do servidor
app.get('/api/projects', (req, res) => {
  const projects = loadProjects();
  res.json(projects || []);
});

// API: Atualizar lista inteira de projetos no servidor
app.post('/api/projects', (req, res) => {
  let projects = req.body;
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: 'Formato inválido. Esperado um Array de projetos.' });
  }
  projects = projects.filter(p => p && p.id !== 'preview-temp-id');
  saveProjects(projects);
  res.json({ success: true, count: projects.length });
});

// Helper para ler pedidos do servidor
function loadCommissions() {
  try {
    if (fs.existsSync(COMMISSIONS_FILE)) {
      const data = fs.readFileSync(COMMISSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler arquivo de pedidos:', err);
  }
  return [];
}

// Helper para salvar pedidos no servidor
function saveCommissions(commissions) {
  try {
    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(commissions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar arquivo de pedidos:', err);
  }
}

// API: Listar pedidos recebidos
app.get('/api/commissions', (req, res) => {
  const commissions = loadCommissions();
  res.json(commissions);
});

// API: Receber novo pedido de qualquer cliente/dispositivo
app.post('/api/commissions', async (req, res) => {
  const { name, email, typeText, game, budget, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const newOrder = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    name,
    email,
    typeText: typeText || 'Geral',
    game: game || 'Não informado',
    budget: budget || 'A combinar',
    message
  };

  const commissions = loadCommissions();
  commissions.unshift(newOrder);
  saveCommissions(commissions);

  // Se houver um Discord Webhook configurado nas variáveis de ambiente, envia notificação automática!
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Godoy Mods - Bot de Encomendas',
          avatar_url: 'https://cdn-icons-png.flaticon.com/512/808/808439.png',
          embeds: [
            {
              title: `🛒 Nova Encomenda Recebida: ${typeText}`,
              color: 0xeab308, // Amarelo Dourado
              fields: [
                { name: '👤 Cliente', value: name, inline: true },
                { name: '💬 Contato', value: email, inline: true },
                { name: '🎮 Jogo / Plataforma', value: game || 'Não informado', inline: true },
                { name: '💰 Orçamento', value: budget || 'A combinar', inline: true },
                { name: '📝 Detalhes da Encomenda', value: message }
              ],
              footer: { text: `Recebido em ${newOrder.date} • Godoy Mods` }
            }
          ]
        })
      });
    } catch (whErr) {
      console.error('Erro ao enviar webhook para Discord:', whErr);
    }
  }

  res.status(201).json({ success: true, order: newOrder });
});

// API: Deletar pedido específico
app.delete('/api/commissions/:id', (req, res) => {
  const { id } = req.params;
  let commissions = loadCommissions();
  commissions = commissions.filter(c => c.id !== id);
  saveCommissions(commissions);
  res.json({ success: true });
});

// API: Limpar todos os pedidos
app.delete('/api/commissions', (req, res) => {
  saveCommissions([]);
  res.json({ success: true });
});

app.get(['/gerador', '/gerador.html'], (req, res) => {
  res.sendFile(path.join(process.cwd(), 'gerador.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


