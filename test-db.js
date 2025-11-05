import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI não está definido');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    console.log('✔️ Conexão com MongoDB bem-sucedida');
    return mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com MongoDB:', err);
    process.exit(1);
  });
