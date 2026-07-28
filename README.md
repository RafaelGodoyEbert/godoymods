# Godoy Mods - Site Oficial & Gerador de Devlogs (GitHub Pages)

Site oficial e gerador de devlogs de jogos do **Godoy Mods** (Rafael Godoy), com suporte nativo a **Modo Escuro / Claro Automático**, layout responsivo com barra lateral, grid de cards e ferramenta interativa para geração de posts formatados em **Markdown (com Front Matter)** e **HTML Puro** para GitHub Pages.

---

## 🌟 Principais Recursos Adicionados

1. **🎨 Detecção Automática de Tema (Light & Dark Mode)**:
   - Identifica automaticamente se o usuário usa modo claro ou escuro no sistema operacional através de `window.matchMedia('(prefers-color-scheme: dark)')`.
   - Permite que o visitante alterne manualmente a qualquer momento entre **💻 Auto (Sistema)**, **☀️ Claro** ou **🌙 Escuro** com salvamento no `localStorage`.

2. **📌 Barra Lateral (Sidebar) & Perfil Integrado**:
   - Card de Perfil de **Rafael Godoy** com avatar, biografia, redes sociais (Discord, YouTube, Steam, Twitter/X, Instagram, GitHub) e link de apoio/PIX (Nubank).
   - Filtros dinâmicos por plataforma (**PC, PS2, PS3, Xbox 360, Android**).

3. **🎮 Grid Responsivo de Projetos & Devlogs**:
   - Abas organizadas para **Devlogs & Notícias**, **Projetos Concluídos** (Red Dead Redemption PT-BR, Toy Story 3 Port) e **Em Andamento** (GTA SA Dublado, God of War 2 IA, Bully, The Warriors, GTA 5).
   - Campo de busca em tempo real com ícone de lupa.

4. **🛠️ Gerador Interativo de Devlog / Posts**:
   - Formulário para preenchimento rápido: **Título, Data, Resumo, Detalhes/Changelog, Tags e Opções de Mídia**.
   - Inclui **Placeholders de Mídia Destacados** (Imagens, GIFs de gameplay e Vídeos do YouTube).
   - Saída instantânea em **Markdown com Front Matter** ou **HTML Puro**.
   - Recursos: **Copiar Código com 1 clique**, **Baixar Arquivo (.md / .html)**, **Pré-visualização em Tempo Real** e **Publicar no Feed do Site**.

---

## 📁 Estrutura de Arquivos para o GitHub Pages (`godoymods/`)

```text
godoymods/
├── index.html        # Estrutura principal do site (Sidebar + Grid + Gerador)
├── styles.css        # Estilos modernos com CSS Variables para Light/Dark Mode
├── script.js         # Lógica de auto dark mode, busca, filtros e gerador
├── README.md         # Documentação e instruções de uso
└── posts/            # Pasta recomendada para salvar os devlogs baixados
    ├── devlog-2026-07-28.md
    └── devlog-2026-07-28.html
```

---

## 🚀 Como Usar no GitHub Pages

1. Suba os arquivos `index.html`, `styles.css` e `script.js` para a raiz do seu repositório `godoymods`.
2. Para criar uma nova atualização de devlog, abra o site, acesse a aba **"Gerador de Devlog"**, preencha os detalhes e clique em **"Copiar Código"** ou **"Baixar Arquivo"**.
3. O tema escuro se ajustará automaticamente ao dispositivo de cada visitante!

---

### Autor
- **Rafael Godoy** ([GitHub](https://github.com/RafaelGodoyEbert))
- **Contato:** rafaelgodebert@gmail.com
