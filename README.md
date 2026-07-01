# Savir Sistemas 🚀

Plataforma Full-Stack de gestão corporativa construída com o stack MEAN (MongoDB, Express, Angular, Node.js). O projeto foca em prover uma interface ágil e responsiva para administração de recursos empresariais, com uma arquitetura backend leve e adaptada para ambientes Serverless.

## 📸 Screenshots e Funcionalidades

### 0. Tela de Autenticação (Login)
<img src="screenshots/login_v2.png" width="800" alt="Login" />
*Ponto de acesso protegido do sistema. A tela de login valida as credenciais via API e armazena o token JWT de forma segura. Para fins de demonstração, o acesso padrão é `admin` com a senha `123456`.*

### 1. Dashboard Principal
<img src="screenshots/dashboard_v2.png" width="800" alt="Dashboard" />
*A tela de Dashboard é o ponto de entrada seguro do sistema. Ela foi desenvolvida utilizando os novos **Signals** do Angular para obter os dados de sessão em tempo real sem a necessidade de `RxJS Subscriptions` complexas. Seu propósito é guiar o usuário pelas funcionalidades principais (Usuários, Clientes, Produtos).*

### 2. Gestão de Usuários
<img src="screenshots/users_v2.png" width="800" alt="Usuários" />
*Interface de administração do sistema. Utiliza **Tailwind CSS** para criar uma tabela responsiva e limpa. A comunicação com o Backend é feita via `HttpClient` e o gerenciamento de estado das listas é otimizado com a estratégia de detecção de mudanças `OnPush` para maior performance.*

### 3. Catálogo de Produtos
<img src="screenshots/products_v2.png" width="800" alt="Produtos" />
*Módulo de listagem e controle de estoque/produtos. Demonstra a padronização de UI/UX através da reutilização de componentes (Tabelas e Botões). Integrado diretamente com as Serverless Functions da Vercel (`/api/products`), garantindo baixa latência no carregamento dos dados.*

### 4. Cadastro de Clientes
<img src="screenshots/clients_v2.png" width="800" alt="Clientes" />
*Módulo de gestão da base de clientes da empresa. Construído focado em agilidade, permitindo edição e exclusão rápidas. O design minimalista e focado foi projetado para ambientes de alta produtividade (Backoffice).*

## 🛠️ Tecnologias Utilizadas

### Front-end
- **Angular 20:** Framework principal para a construção de SPAs escaláveis.
- **Tailwind CSS:** Estilização utilitária para prototipagem rápida e interfaces modernas.
- **TypeScript:** Tipagem estática garantindo maior segurança e manutenibilidade do código.
- **RxJS:** Programação reativa para controle complexo de estados e eventos assíncronos.

### Back-end & Infraestrutura
- **Node.js & Express:** API leve e modular para gestão de regras de negócio.
- **MongoDB & Mongoose:** Banco de dados NoSQL e ODM para modelagem flexível de documentos.
- **Vercel Serverless:** Implantação do backend utilizando Serverless Functions para otimização de custos e performance (`/api/*.js`).

## ⚙️ Arquitetura e Deploy (Vercel)

Diferente de aplicações Node.js tradicionais, o backend deste projeto (`mongo-adapter/` e `/api/`) foi estruturado para suportar o modelo Serverless da Vercel. 
- A conexão com o MongoDB é reutilizada inteligentemente entre invocações para não exceder limites de pool do Atlas.
- O front-end (Angular) é buildado como arquivo estático, garantindo entrega ultrarrápida (CDN).

*(Veja `README-MONGO-VERCEL.md` para mais instruções de deploy)*.

## 🚀 Como rodar o projeto localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Mattys03/savir-sistemas.git
   cd savir-sistemas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o Banco de Dados:**
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione a sua string de conexão do MongoDB Atlas:
     ```env
     MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster...
     ```

4. **Inicie o servidor de desenvolvimento (Front-end e Back-end):**
   Para rodar a aplicação localmente utilizando o ambiente do Vercel:
   ```bash
   vercel dev
   ```
   *(Alternativamente, pode-se usar `npm run start` para a API isolada e `npm run dev` para o Angular).*

## 📌 Funcionalidades Principais
- Gerenciamento de Usuários.
- Catálogo de Clientes e Produtos.
- Interface UI/UX otimizada para alta produtividade em operações corporativas CRUD.

---
**Autor:** Matheus Rêgo Pinheiro ([@Mattys03](https://github.com/Mattys03))
