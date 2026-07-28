import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const COMMISSIONS_FILE = path.join(process.cwd(), 'data', 'commissions.json');
const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');
const LEGACY_PROJECTS_FILE = path.join(process.cwd(), 'projects.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(process.cwd()));

// Helper para ler e salvar projetos no servidor
function loadProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    } else if (fs.existsSync(LEGACY_PROJECTS_FILE)) {
      const data = fs.readFileSync(LEGACY_PROJECTS_FILE, 'utf-8');
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
    fs.writeFileSync(LEGACY_PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
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
  const projects = req.body;
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: 'Formato inválido. Esperado um Array de projetos.' });
  }
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


