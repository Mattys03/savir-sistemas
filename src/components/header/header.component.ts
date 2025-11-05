import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
// Fix: Removed `toSignal` import as `computed` is used directly for derived signal state.
// Fix: Removed `map` import as `computed` directly operates on signal values.

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-blue-600 text-white shadow-md">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <a routerLink="/dashboard" class="text-2xl font-bold tracking-wide">Savir Sistemas</a>
        <div class="hidden md:flex items-center space-x-6">
          @if (isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="font-semibold text-blue-200" class="hover:text-blue-200 transition-colors">Início</a>

            <div class="relative group">
              <button class="flex items-center hover:text-blue-200 transition-colors focus:outline-none">
                Cadastros
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <ul class="absolute hidden group-hover:block bg-white text-gray-800 shadow-lg rounded-md w-48 z-10 top-full left-0">
                <li><a routerLink="/users" routerLinkActive="bg-blue-100" class="block px-4 py-2 hover:bg-blue-50">Usuários</a></li>
                <li><a routerLink="/clients" routerLinkActive="bg-blue-100" class="block px-4 py-2 hover:bg-blue-50">Clientes</a></li>
                <li><a routerLink="/products" routerLinkActive="bg-blue-100" class="block px-4 py-2 hover:bg-blue-50">Produtos</a></li>
              </ul>
            </div>
            
            <span class="text-blue-200">Olá, {{ currentUserName() }}!</span>
            <button (click)="logout()" class="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">Sair</button>
          } @else {
            <a routerLink="/login" routerLinkActive="font-semibold text-blue-200" class="hover:text-blue-200 transition-colors">Login</a>
          }
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button (click)="toggleMobileMenu()" class="text-white focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      <!-- Mobile menu -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden bg-blue-700 pb-4">
          @if (isAuthenticated()) {
            <nav class="flex flex-col items-center space-y-2">
              <a routerLink="/dashboard" routerLinkActive="font-semibold text-blue-200" class="block px-4 py-2 hover:text-blue-200 transition-colors" (click)="closeMobileMenu()">Início</a>

              <div class="relative w-full text-center">
                <button (click)="toggleCadastrosMobileDropdown()" class="w-full py-2 hover:text-blue-200 transition-colors focus:outline-none">
                  Cadastros
                  <svg class="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                @if (isCadastrosMobileDropdownOpen()) {
                  <ul class="bg-blue-800 text-white w-full">
                    <li><a routerLink="/users" routerLinkActive="bg-blue-900" class="block px-4 py-2 hover:bg-blue-900" (click)="closeMobileMenu()">Usuários</a></li>
                    <li><a routerLink="/clients" routerLinkActive="bg-blue-900" class="block px-4 py-2 hover:bg-blue-900" (click)="closeMobileMenu()">Clientes</a></li>
                    <li><a routerLink="/products" routerLinkActive="bg-blue-900" class="block px-4 py-2 hover:bg-blue-900" (click)="closeMobileMenu()">Produtos</a></li>
                  </ul>
                }
              </div>

              <span class="block px-4 py-2 text-blue-200">Olá, {{ currentUserName() }}!</span>
              <button (click)="logout(); closeMobileMenu()" class="px-4 py-2 bg-blue-800 rounded-md hover:bg-blue-900 transition-colors w-auto">Sair</button>
            </nav>
          } @else {
            <nav class="flex flex-col items-center space-y-2">
              <a routerLink="/login" routerLinkActive="font-semibold text-blue-200" class="block px-4 py-2 hover:text-blue-200 transition-colors" (click)="closeMobileMenu()">Login</a>
            </nav>
          }
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Fix: Use `computed` for derived signal state, as `currentUser` is already a signal.
  isAuthenticated = computed(() => !!this.authService.currentUser());

  // Fix: Use `computed` for derived signal state, accessing the signal value by calling it.
  currentUserName = computed(() => this.authService.currentUser()?.name || 'Visitante');

  // Fix: Ensure `signal` is imported from '@angular/core'.
  isMobileMenuOpen = signal(false);
  isCadastrosMobileDropdownOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
    // Close cadastros dropdown if opening/closing main menu
    if (!this.isMobileMenuOpen()) {
      this.isCadastrosMobileDropdownOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.isCadastrosMobileDropdownOpen.set(false);
  }

  toggleCadastrosMobileDropdown(): void {
    this.isCadastrosMobileDropdownOpen.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}