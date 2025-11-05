import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <!-- Cabeçalho -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Criar Nova Conta</h1>
          <p class="text-gray-600">Preencha os dados para se registrar no sistema</p>
        </div>

        <!-- Formulário -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Nome Completo -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite seu nome completo"
            >
            <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" 
                 class="text-red-500 text-xs mt-2">
              ⚠️ Nome é obrigatório
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="seu@email.com"
            >
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                 class="text-red-500 text-xs mt-2">
              ⚠️ Email é obrigatório e deve ser válido
            </div>
          </div>

          <!-- Login -->
          <div>
            <label for="login" class="block text-sm font-medium text-gray-700 mb-2">
              Nome de Usuário *
            </label>
            <input
              id="login"
              type="text"
              formControlName="login"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Escolha um nome de usuário"
            >
            <div *ngIf="registerForm.get('login')?.invalid && registerForm.get('login')?.touched" 
                 class="text-red-500 text-xs mt-2">
              ⚠️ Login é obrigatório
            </div>
          </div>

          <!-- Senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite sua senha"
            >
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                 class="text-red-500 text-xs mt-2">
              ⚠️ Senha é obrigatória (mínimo 3 caracteres)
            </div>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha *
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite a senha novamente"
            >
            <div *ngIf="registerForm.hasError('passwordsMismatch') && registerForm.get('confirmPassword')?.touched" 
                 class="text-red-500 text-xs mt-2">
              ⚠️ As senhas não coincidem
            </div>
          </div>

          <!-- Botão de Registrar -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '🔄 Criando conta...' : '📝 Criar Minha Conta' }}
          </button>
        </form>

        <!-- Mensagem de Erro -->
        <div *ngIf="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <span class="text-red-500 text-lg mr-2">❌</span>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Link para voltar ao Login -->
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Já tem uma conta?
            <a routerLink="/login" class="font-semibold text-blue-600 hover:text-blue-500 ml-1 underline">
              Fazer login
            </a>
          </p>
        </div>

        <!-- Informações extras -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs text-blue-700 text-center">
            📋 Após o registro, você poderá fazer login e acessar todo o sistema Savir.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  error = '';

  // ✅ CORRIGIDO: URL do backend no Render
  private apiUrl = 'https://savir-sistemas.onrender.com/api';

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    login: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(3)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      const userData = this.registerForm.value;

      try {
        // Criar novo usuário
        const newUser = {
          name: userData.name!,
          email: userData.email!,
          login: userData.login!,
          profile: 'Usuário', // Perfil padrão para novos usuários
          password: userData.password!
        };

        // ✅ CORRIGIDO: Usando a URL do Render
        this.http.post<any>(`${this.apiUrl}/users`, newUser).subscribe({
          next: (response) => {
            this.loading = false;
            
            if (response.success) {
              alert('🎉 Conta criada com sucesso! Agora faça login.');
              this.router.navigate(['/login']);
            } else {
              this.error = response.error || 'Erro ao criar conta.';
            }
          },
          error: (err) => {
            this.loading = false;
            
            // Mensagens de erro mais específicas
            if (err.status === 400) {
              this.error = err.error?.error || 'Dados inválidos. Verifique as informações.';
            } else if (err.status === 409) {
              this.error = 'Usuário ou email já existe. Tente outro.';
            } else if (err.status === 0) {
              this.error = 'Erro de conexão. Verifique se o backend está online.';
            } else {
              this.error = err.error?.error || 'Erro ao criar conta. Tente novamente.';
            }
            
            console.error('Erro no registro:', err);
          }
        });
      } catch (error) {
        this.loading = false;
        this.error = 'Erro inesperado';
        console.error('Erro:', error);
      }
    }
  }
}