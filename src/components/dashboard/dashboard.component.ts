import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
// Fix: Removed `toSignal` import as `computed` is used directly for derived signal state.
// Fix: Removed `map` import as `computed` directly operates on signal values.

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">Bem-vindo ao Savir Sistemas!</h1>
        <p class="text-xl text-gray-600 mb-6">
          Olá <span class="font-semibold text-blue-600">{{ currentUserName() }}</span>,
          aqui você acessa os principais recursos do sistema.
        </p>
        <hr class="my-6 border-gray-300">
        <p class="text-lg text-gray-500">
          Utilize o menu superior para navegar entre os cadastros de Usuários, Clientes e Produtos.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private authService = inject(AuthService);

  // Fix: Use `computed` for derived signal state, accessing the signal value by calling it.
  currentUserName = computed(() => this.authService.currentUser()?.name || 'Usuário');
}