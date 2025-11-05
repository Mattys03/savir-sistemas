import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// ✅ CORS CORRIGIDO - ACEITA QUALQUER ORIGEM
app.use(cors({
  origin: true,  // Aceita qualquer origem
  credentials: true
}));

app.use(express.json());

// ✅ MIDDLEWARE DE LOG SIMPLIFICADO
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ CONEXÃO MONGODB CORRIGIDA - NÃO TRAVA MAIS
const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/savir-sistemas';

console.log('🔄 Iniciando conexão MongoDB...');

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
})
.catch(err => {
  console.error('❌ Erro ao conectar MongoDB:', err.message);
  // NÃO FAZ process.exit() - DEIXA O SERVIDOR RODAR MESMO SEM BANCO
});

// ✅ SCHEMAS E MODELS (MOVIDOS PARA ANTES DAS ROTAS)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  login: String,
  profile: String,
  password: String
}, { timestamps: true });

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Client = mongoose.model('Client', ClientSchema);
const Product = mongoose.model('Product', ProductSchema);

// ✅ ROTA DE HEALTH CHECK (TESTE RÁPIDO)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// ✅ ROTA PRINCIPAL
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 API Savir Sistemas funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/users',
      'POST /api/users (CRIAR USUÁRIO)',
      'POST /api/auth/login',
      'GET /api/clients', 
      'GET /api/products',
      'POST /api/seed',
      'GET /api/seed-get'
    ]
  });
});

// ✅ ROTA DE LOGIN COM VERIFICAÇÃO DE BANCO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('🔐 Tentativa de login:', login);
    
    // Verifica se o banco está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Banco de dados não disponível'
      });
    }
    
    const user = await User.findOne({ login, password });
    
    if (user) {
      console.log('✅ Login bem-sucedido:', user.name);
      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          login: user.login,
          profile: user.profile
        }
      });
    } else {
      console.log('❌ Login falhou para:', login);
      res.status(401).json({
        success: false,
        message: 'Login ou senha incorretos'
      });
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor durante o login'
    });
  }
});

// ✅ ROTA PARA LISTAR USUÁRIOS COM VERIFICAÇÃO
app.get('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const users = await User.find();
    console.log(`✅ Retornando ${users.length} usuários`);
    res.json(users);
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// ✅ ROTA PARA OBTER USUÁRIO POR ID
app.get('/api/users/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário: ' + error.message });
  }
});

// ✅ ROTA PARA CRIAR NOVO USUÁRIO (REGISTRO)
app.post('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, email, login, profile, password } = req.body;
    
    console.log('🔄 Tentando criar usuário:', { name, email, login });

    const existingUser = await User.findOne({ login });
    if (existingUser) {
      console.log('❌ Login já existe:', login);
      return res.status(400).json({ error: 'Login já está em uso' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('❌ Email já existe:', email);
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    const newUser = new User({
      name,
      email,
      login,
      profile: profile || 'Usuário',
      password
    });

    const savedUser = await newUser.save();
    console.log('✅ Usuário criado com sucesso:', savedUser._id);
    
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      login: savedUser.login,
      profile: savedUser.profile
    };

    res.json({
      success: true,
      user: userResponse,
      message: 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar usuário: ' + error.message 
    });
  }
});

// 🔥 ROTAS DE CLIENTES COM VERIFICAÇÃO
app.get('/api/clients', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const clients = await Client.find();
    console.log(`✅ Retornando ${clients.length} clientes`);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, email, phone, address } = req.body;
    const userId = req.headers['user-id'];
    
    console.log('🔄 Criando cliente para usuário:', userId);

    const newClient = new Client({
      name,
      email,
      phone,
      address,
      createdBy: userId || null
    });

    const savedClient = await newClient.save();
    res.json(savedClient);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente: ' + error.message });
  }
});

// 🔥 ROTAS DE PRODUTOS COM VERIFICAÇÃO
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const products = await Product.find();
    console.log(`✅ Retornando ${products.length} produtos`);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto: ' + error.message });
  }
});

// ✅ ROTA PARA POPULAR BANCO
app.post('/api/seed', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    console.log('🌱 Populando banco de dados...');
    
    await User.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});

    const users = await User.insertMany([
      {
        name: 'Administrador Principal',
        email: 'admin@savir.com.br',
        login: 'admin',
        profile: 'Administrador',
        password: '123'
      },
      {
        name: 'João da Silva',
        email: 'joao.silva@example.com',
        login: 'joao',
        profile: 'Usuário',
        password: '123'
      },
      {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@example.com', 
        login: 'maria',
        profile: 'Usuário',
        password: '123'
      }
    ]);

    const clients = await Client.insertMany([
      {
        name: 'Empresa ABC Ltda',
        email: 'contato@empresaabc.com',
        phone: '11987654321',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        createdBy: users[0]._id
      },
      {
        name: 'Comércio XYZ ME',
        email: 'vendas@comercioxyz.com',
        phone: '21912345678',
        address: 'Rua do Comércio, 500 - Rio de Janeiro, RJ',
        createdBy: users[1]._id
      }
    ]);

    const products = await Product.insertMany([
      {
        name: 'Notebook Dell Inspiron 15',
        description: 'Notebook Dell Inspiron 15" Intel Core i5, 8GB RAM, 256GB SSD',
        price: 2499.99,
        stock: 15,
        createdBy: users[0]._id
      },
      {
        name: 'Mouse Logitech MX Master 3',
        description: 'Mouse sem fio ergonômico para produtividade',
        price: 299.90,
        stock: 30,
        createdBy: users[1]._id
      }
    ]);

    console.log('✅ Dados criados:', {
      users: users.length,
      clients: clients.length,
      products: products.length
    });

    res.json({
      message: '✅ Banco populado com sucesso!',
      users: users.length,
      clients: clients.length,
      products: products.length
    });
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    res.status(500).json({ error: 'Erro ao popular banco: ' + error.message });
  }
});

// ✅ ROTA GET PARA SEED (para usar no navegador)
app.get('/api/seed-get', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    console.log('🌱 Executando SEED via GET...');
    
    await User.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});

    const users = await User.insertMany([
      {
        name: 'Administrador Principal',
        email: 'admin@savir.com.br',
        login: 'admin',
        profile: 'Administrador',
        password: '123'
      },
      {
        name: 'João da Silva',
        email: 'joao.silva@example.com',
        login: 'joao',
        profile: 'Usuário',
        password: '123'
      },
      {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@example.com', 
        login: 'maria',
        profile: 'Usuário',
        password: '123'
      }
    ]);

    const clients = await Client.insertMany([
      {
        name: 'Empresa ABC Ltda',
        email: 'contato@empresaabc.com',
        phone: '11987654321',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        createdBy: users[0]._id
      },
      {
        name: 'Comércio XYZ ME',
        email: 'vendas@comercioxyz.com',
        phone: '21912345678',
        address: 'Rua do Comércio, 500 - Rio de Janeiro, RJ',
        createdBy: users[1]._id
      }
    ]);

    const products = await Product.insertMany([
      {
        name: 'Notebook Dell Inspiron 15',
        description: 'Notebook Dell Inspiron 15" Intel Core i5, 8GB RAM, 256GB SSD',
        price: 2499.99,
        stock: 15,
        createdBy: users[0]._id
      },
      {
        name: 'Mouse Logitech MX Master 3',
        description: 'Mouse sem fio ergonômico para produtividade',
        price: 299.90,
        stock: 30,
        createdBy: users[1]._id
      }
    ]);

    console.log('✅ Dados criados:', {
      users: users.length,
      clients: clients.length,
      products: products.length
    });

    res.json({
      success: true,
      message: '✅ Banco populado com sucesso via GET!',
      users: users.length,
      clients: clients.length,
      products: products.length,
      logins: [
        { usuario: 'admin', senha: '123', perfil: 'Administrador' },
        { usuario: 'joao', senha: '123', perfil: 'Usuário' },
        { usuario: 'maria', senha: '123', perfil: 'Usuário' }
      ]
    });
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao popular banco: ' + error.message 
    });
  }
});

// ✅ INICIAR SERVIDOR (AGORA INICIA IMEDIATAMENTE)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎉 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
});

console.log('🔄 Iniciando servidor Savir Sistemas...');