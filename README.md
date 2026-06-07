# 🛒 Sistema de Ponto de Venda (PDV) Web

Um sistema completo, responsivo e moderno de Ponto de Venda (PDV) projetado para gerenciar vendas, caixa e usuários com eficiência. Desenvolvido com uma arquitetura separada entre Frontend (React) e Backend (Node.js), suportando implantação fácil via Docker.

## 🚀 Funcionalidades

### 🖥️ Frontend (React + Vite)
*   **PWA (Progressive Web App):** Instalável no computador ou celular, com suporte offline parcial e ícones de alta resolução.
*   **Gestão de Vendas Rápida:** Interface ágil com suporte a leitor de código de barras (físico ou via câmera do dispositivo).
*   **Sistema de "Fiado":** Possibilidade de associar vendas a clientes e registrar débitos.
*   **Controle de Caixa:** Abertura, fechamento e histórico das transações diárias.
*   **Recibos:** Geração de comprovantes detalhados com opção de envio direto para o WhatsApp ou exportação para CSV.
*   **Dashboard Visual:** Acompanhamento rápido da saúde e progresso do negócio.
*   **UI/UX:** Notificações globais (Toasts), modais interativos e design responsivo (Tailwind CSS).

### ⚙️ Backend (Node.js + Express)
*   **API RESTful:** Rotas estruturadas para Vendas, Usuários, Produtos e Caixa.
*   **Autenticação JWT:** Sistema seguro de login, registro e manutenção de sessão.
*   **Health Check:** Rota `/api/health` para monitoramento de uptime e disponibilidade.
*   **Tratamento de Erros:** Repasses detalhados de falhas para exibição tratada no frontend.

### 🗄️ Banco de Dados (MySQL 8)
*   Armazenamento relacional robusto.
*   Tabelas independentes para Usuários, Vendas e Registros de Caixa.
*   Preparado para inicialização automática via scripts de Entrypoint no Docker.

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**
*   React 18 + Vite
*   Tailwind CSS (Estilização)
*   vite-plugin-pwa (Transformação em aplicativo)
*   React Router DOM
*   ESLint + Husky (Qualidade de Código)

**Backend:**
*   Node.js + Express
*   MySQL2 (Driver)
*   JSON Web Token (JWT)
*   Bcrypt (Criptografia de senhas)

**Infraestrutura:**
*   Docker & Docker Compose
*   Nginx (Servidor Web de Produção do Frontend)

---

## 📁 Estrutura de Pastas

```text
/
├── public/                 # Arquivos públicos, manifesto PWA e ícones
├── src/                    # Código fonte do Frontend (React)
│   ├── components/         # Componentes reutilizáveis (Modais, Botões, etc)
│   ├── context/            # Contextos do React (ex: AuthContext)
│   ├── pages/              # Páginas da aplicação (Login, PDV, Dashboard)
│   └── ...
├── server/                 # Código fonte do Backend (Node.js)
│   ├── routes/             # Definição das rotas da API
│   ├── package.json        # Dependências do Backend
│   └── server.js           # Ponto de entrada do servidor
├── docker/                 # Scripts de inicialização do BD (MySQL)
├── docker-compose.yml      # Orquestração dos containers (DB, Backend, Frontend)
├── Dockerfile              # Configuração de build do Frontend (Nginx)
├── package.json            # Dependências do Frontend
└── tailwind.config.js      # Configurações de estilização
```

---

## ⚙️ Como Executar o Projeto

Você tem duas formas de rodar o projeto: usando o **Docker** (recomendado para produção e facilidade) ou **Localmente** (para desenvolvimento).

### Opção 1: Usando Docker (Recomendado)

Certifique-se de ter o [Docker](https://www.docker.com/) instalado no seu computador.

1. Clone o repositório:
   ```bash
   git clone https://github.com/RamonFerreira1/pdv-web.git
   cd pdv-web
   ```
2. Renomeie o arquivo `.env.example` para `.env` (se necessário) e ajuste as variáveis.
3. Suba os containers na raiz do projeto:
   ```bash
   docker-compose up -d --build
   ```
4. A aplicação estará disponível em:
   * **Frontend:** `http://localhost`
   * **Backend:** `http://localhost:3001`

### Opção 2: Rodando Localmente (Desenvolvimento)

1. **Inicie o Banco de Dados:** Você precisará de uma instância local do MySQL rodando na porta `3306` com as credenciais definidas no seu arquivo `.env` (ou `docker-compose.yml`).
2. **Backend:**
   ```bash
   cd server
   npm install
   node server.js
   ```
3. **Frontend:**
   ```bash
   # Abra uma nova aba no terminal, na raiz do projeto
   npm install
   npm run dev
   ```
4. Acesse o frontend via URL fornecida no terminal (geralmente `http://localhost:5173`).
