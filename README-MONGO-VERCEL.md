# MongoDB Adapter & Vercel deployment instructions

Esta pasta (`mongo-adapter` + `/api`) adiciona um backend minimalista usando **Mongoose** e endpoints compatíveis com **Vercel Serverless Functions**.

## O que foi adicionado
- `mongo-adapter/connection.js` — reutiliza conexão Mongoose entre invocações (boa prática em serverless).
- `mongo-adapter/*.model.js` — modelos Mongoose: User, Client, Product.
- `mongo-adapter/seed.json` — exemplo de dados iniciais.
- `api/users.js`, `api/clients.js`, `api/products.js` — endpoints CRUD (GET, POST, PUT, DELETE).

## Como usar localmente
1. Crie um cluster no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (camada gratuita M0).
2. Configure a variável de ambiente `MONGODB_URI` com a string de conexão.
3. Instale dependências na raiz do projeto:
   ```
   npm install mongoose
   ```
4. Para testes locais, você pode rodar um pequeno servidor que exponha os handlers (ou usar ferramentas como netlify dev/vercel dev).
   - Para desenvolvimento rápido, use `vercel dev` (é necessário ter o Vercel CLI instalado).

## Como implantar no Vercel
1. Faça push do repositório para GitHub/GitLab/Bitbucket.
2. Crie um novo projeto no Vercel e conecte o repositório.
3. No painel do projeto, adicione a variável `MONGODB_URI` nas *Environment Variables*.
4. Deploy — o Angular será detectado como site estático e `api/*.js` serão deployed como Serverless Functions.

## Observações e limitações importantes
- **Conexões em serverless:** o `connection.js` tenta reutilizar a conexão para evitar abrir muitas conexões com o cluster Atlas (importante para o limite de conexões do M0). Use `globalThis._mongoose` como cache.
- **Limites do Atlas M0 (gratuito):** o cluster gratuito tem limites de taxa (por exemplo ~100 ops/s) e 512MB de armazenamento — para uso educacional e projetos pequenos serve bem. (Veja docs do Atlas.) 
- **Limitações do Vercel (gratuito):** funções serverless têm limite de execução e quotas de uso; Vercel é ótimo para hospedar o frontend Angular estático, mas para APIs pesadas ou tarefas longas pode não ser ideal. Ver links de referência no README principal.

## Próximos passos recomendados
- Substituir chamadas do `DataService` no frontend para usar os endpoints `/api/users`, `/api/clients`, `/api/products`.
- Criar um serviço Angular (`ApiService`) que faça `fetch`/`HttpClient` para esses endpoints em vez de usar `DataService`.
- Validar autenticação e segurança (não deixar APIs abertas em produção).
