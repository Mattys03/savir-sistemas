import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/savir-sistemas')
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');

    // Schemas
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      login: String,
      profile: String,
      password: String
    });

    const ClientSchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      address: String
    });

    const ProductSchema = new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      stock: Number
    });

    const User = mongoose.model('User', UserSchema);
    const Client = mongoose.model('Client', ClientSchema);
    const Product = mongoose.model('Product', ProductSchema);

    // 🔥 LIMPAR TUDO PRIMEIRO
    await User.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});

    console.log('🗑️ Todos os dados antigos foram removidos');

    // 🔥 INSERIR NOVOS DADOS LIMPOS
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
      }
    ]);

    const clients = await Client.insertMany([
      {
        name: 'Empresa A Ltda',
        email: 'contato@empresaA.com',
        phone: '11987654321',
        address: 'Rua X, 123 - São Paulo'
      }
    ]);

    const products = await Product.insertMany([
      {
        name: 'Produto de Exemplo',
        description: 'Este é um produto de exemplo',
        price: 100.00,
        stock: 10
      }
    ]);

    console.log('✅ NOVOS dados inseridos:');
    console.log('   👤', users.length, 'usuários');
    console.log('   🏢', clients.length, 'clientes');
    console.log('   📦', products.length, 'produtos');
    console.log('\n🔐 LOGIN PARA TESTE:');
    console.log('   👨‍💼 Login: admin');
    console.log('   🔑 Senha: 123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
  });