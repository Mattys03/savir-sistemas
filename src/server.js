import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS COMPLETO - ACEITA TUDO
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json());

// ✅ MIDDLEWARE DE LOG SIMPLIFICADO
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ CONEXÃO MONGODB CORRIGIDA
const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/savir-sistemas';

console.log('🔄 Iniciando conexão MongoDB...');

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
})
.catch(err => {
  console.error('❌ Erro ao conectar MongoDB:', err.message);
});

// ✅ SCHEMAS E MODELS
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

// ✅ ROTA DE HEALTH CHECK
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
      'POST /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/clients', 
      'POST /api/clients',
      'PUT /api/clients/:id',
      'DELETE /api/clients/:id',
      'GET /api/products',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'POST /api/auth/login',
      'POST /api/seed',
      'GET /api/seed-get'
    ]
  });
});

// ✅ ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('🔐 Tentativa de login:', login);
    
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

// ==================== ROTAS DE USUÁRIOS ====================

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

// ✅ ROTA POST PARA USUÁRIOS (JÁ EXISTIA)
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

// ✅ ROTA PUT PARA ATUALIZAR USUÁRIO (NOVA)
app.put('/api/users/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, email, login, profile } = req.body;
    console.log('🔄 Atualizando usuário:', req.params.id);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, login, profile },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário atualizado:', updatedUser._id);
    res.json(updatedUser);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// ✅ ROTA DELETE PARA EXCLUIR USUÁRIO (NOVA - RESOLVE O PROBLEMA)
app.delete('/api/users/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    console.log('🗑️ Tentando excluir usuário:', req.params.id);
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      console.log('❌ Usuário não encontrado para exclusão:', req.params.id);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário excluído com sucesso:', req.params.id);
    res.json({
      success: true,
      message: 'Usuário excluído com sucesso',
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name
      }
    });
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + error.message });
  }
});

// ==================== ROTAS DE CLIENTES ====================

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

// ✅ ROTA PUT PARA ATUALIZAR CLIENTE (NOVA)
app.put('/api/clients/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, email, phone, address } = req.body;
    console.log('🔄 Atualizando cliente:', req.params.id);

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    console.log('✅ Cliente atualizado:', updatedClient._id);
    res.json(updatedClient);
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente: ' + error.message });
  }
});

// ✅ ROTA DELETE PARA EXCLUIR CLIENTE (NOVA)
app.delete('/api/clients/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    console.log('🗑️ Tentando excluir cliente:', req.params.id);
    
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      console.log('❌ Cliente não encontrado para exclusão:', req.params.id);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    console.log('✅ Cliente excluído com sucesso:', req.params.id);
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso',
      deletedClient: {
        id: deletedClient._id,
        name: deletedClient.name
      }
    });
  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente: ' + error.message });
  }
});

// ==================== ROTAS DE PRODUTOS ====================

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

// ✅ ROTA POST PARA PRODUTOS (JÁ EXISTIA)
app.post('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, description, price, stock } = req.body;
    const userId = req.headers['user-id'];
    
    console.log('🔄 Criando produto para usuário:', userId);

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      createdBy: userId || null
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
  }
});

// ✅ ROTA PUT PARA ATUALIZAR PRODUTO (NOVA)
app.put('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    const { name, description, price, stock } = req.body;
    console.log('🔄 Atualizando produto:', req.params.id);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('✅ Produto atualizado:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
  }
});

// ✅ ROTA DELETE PARA EXCLUIR PRODUTO (NOVA)
app.delete('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }
    
    console.log('🗑️ Tentando excluir produto:', req.params.id);
    
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      console.log('❌ Produto não encontrado para exclusão:', req.params.id);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('✅ Produto excluído com sucesso:', req.params.id);
    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name
      }
    });
  } catch (error) {
    console.error('❌ Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
  }
});

// ✅ ROTA PARA POPULAR BANCO (MANTIDA)
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

// ✅ ROTA GET PARA SEED (MANTIDA)
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

// ✅ SERVIR FRONTEND ANGULAR (arquivos estáticos)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Redirecionar rotas não-API para o Angular (SPA)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// ✅ INICIAR SERVIDOR
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🎉 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
});

console.log('🔄 Iniciando servidor Savir Sistemas...');