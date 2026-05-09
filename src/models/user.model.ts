export interface User {
  _id?: string;  // 🔥 ADICIONAR
  id?: string;
  name: string;
  email: string;
  login: string;
  profile: 'Administrador' | 'Usuário';
}
