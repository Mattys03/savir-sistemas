import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Savir Sistemas - Login</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="login" class="block text-sm font-medium text-gray-700">Login</label>
            <input
              id="login"
              type="text"
              formControlName="login"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu login"
            >
            <div *ngIf="loginForm.get('login')?.invalid && loginForm.get('login')?.touched" 
                 class="text-red-500 text-xs mt-1">
              Login é obrigatório
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite sua senha"
            >
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                 class="text-red-500 text-xs mt-1">
              Senha é obrigatória
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div *ngIf="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>

        <!-- Link para criar nova conta -->
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            Não tem uma conta?
            <a routerLink="/register" class="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Criar nova conta
            </a>
          </p>
        </div>

        <!-- ✅ DICAS DE LOGIN ATUALIZADAS E CORRIGIDAS -->
        <div class="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div class="text-center">
            <strong class="block mb-2 text-blue-800">🎯 Credenciais para Teste:</strong>
            
            <!-- Admin -->
            <div class="mb-3">
              <span class="font-semibold text-red-600 block">👑 Administrador (Acesso Total):</span>
              <div class="mt-1">
                <code class="text-sm bg-red-100 px-2 py-1 rounded">admin</code> 
                <span class="mx-1">/</span>
                <code class="text-sm bg-red-100 px-2 py-1 rounded">123</code>
              </div>
            </div>
            
            <!-- Usuário Comum -->
            <div class="mb-3">
              <span class="font-semibold text-green-600 block">👤 Usuário Comum (Acesso Limitado):</span>
              <div class="mt-1">
                <code class="text-sm bg-green-100 px-2 py-1 rounded">joao</code> 
                <span class="mx-1">/</span>
                <code class="text-sm bg-green-100 px-2 py-1 rounded">123</code>
              </div>
            </div>

            <!-- Informação sobre permissões -->
            <div class="mt-4 pt-3 border-t border-blue-200">
              <div class="text-xs text-blue-700 text-left">
                <p class="mb-1">💡 <strong>Usuário Comum:</strong> Só pode editar/excluir clientes e produtos que ele mesmo criou.</p>
                <p>👑 <strong>Administrador:</strong> Tem acesso total a todos os recursos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  loginForm = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const credentials = this.loginForm.value;

      try {
        this.authService.login(credentials).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.success) {
              this.router.navigate(['/dashboard']);
            } else {
              this.error = response.message || 'Login ou senha incorretos';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Erro de conexão com o servidor';
            console.error('Erro no login:', err);
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