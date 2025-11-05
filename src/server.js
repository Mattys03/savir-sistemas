import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// ✅ MIDDLEWARE ESSENCIAIS
app.use(cors());
app.use(express.json());

// ✅ CONEXÃO MONGODB PARA RENDER (APENAS ESTA MODIFICAÇÃO)
const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/savir-sistemas';

console.log('🔄 Conectando ao MongoDB...');
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
})
.catch(err => {
  console.error('❌ Erro ao conectar MongoDB:', err.message);
  process.exit(1);
});

// ✅ SCHEMAS (MANTIDO ORIGINAL)
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
      'POST /api/seed'
    ]
  });
});

// ✅ ROTA DE LOGIN (MANTIDA ORIGINAL - QUE FUNCIONAVA)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('🔐 Tentativa de login:', login);
    
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

// ✅ ROTA PARA LISTAR USUÁRIOS
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// ✅ ROTA PARA OBTER USUÁRIO POR ID
app.get('/api/users/:id', async (req, res) => {
  try {
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

// ✅ ROTA PARA ATUALIZAR USUÁRIO
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, profile } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, profile },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        login: updatedUser.login,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// ✅ ROTA PARA EXCLUIR USUÁRIO
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + error.message });
  }
});

// 🔥 ROTAS DE CLIENTES (MANTIDAS ORIGINAIS)
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
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

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.headers['user-id'];
    
    console.log('🔄 Atualizando cliente. UserId:', userId, 'ClientId:', req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido no header' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const canEdit = user.profile === 'Administrador' || client.createdBy?.toString() === userId;
    if (!canEdit) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este cliente' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true }
    );

    console.log('✅ Cliente atualizado:', updatedClient._id);
    res.json(updatedClient);
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente: ' + error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    console.log('🗑️  Tentando excluir cliente. UserId:', userId, 'ClientId:', req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido no header' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const canDelete = user.profile === 'Administrador' || client.createdBy?.toString() === userId;
    if (!canDelete) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este cliente' });
    }

    const result = await Client.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Cliente não encontrado para exclusão' });
    }

    console.log('✅ Cliente excluído com sucesso:', req.params.id);
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente: ' + error.message });
  }
});

// 🔥 ROTAS DE PRODUTOS (MANTIDAS ORIGINAIS)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto: ' + error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
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

app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const userId = req.headers['user-id'];
    
    console.log('🔄 Atualizando produto. UserId:', userId, 'ProductId:', req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido no header' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const canEdit = user.profile === 'Administrador' || product.createdBy?.toString() === userId;
    if (!canEdit) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este produto' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock },
      { new: true }
    );

    console.log('✅ Produto atualizado:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    console.log('🗑️  Tentando excluir produto. UserId:', userId, 'ProductId:', req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido no header' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const canDelete = user.profile === 'Administrador' || product.createdBy?.toString() === userId;
    if (!canDelete) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este produto' });
    }

    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Produto não encontrado para exclusão' });
    }

    console.log('✅ Produto excluído com sucesso:', req.params.id);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
  }
});

// ✅ ROTA PARA POPULAR BANCO (MANTIDA ORIGINAL)
app.post('/api/seed', async (req, res) => {
  try {
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

// ✅ ROTA DE SAÚDE
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Savir Sistemas API',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    timestamp: new Date().toISOString()
  });
});

// ✅ ROTA GET PARA SEED (para usar no navegador)
app.get('/api/seed-get', async (req, res) => {
  try {
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

// ✅ INICIAR SERVIDOR (MODIFICAÇÃO PARA RENDER)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎉 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});

console.log('🔄 Iniciando servidor Savir Sistemas...');