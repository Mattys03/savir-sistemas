import { Component, ChangeDetectionStrategy, inject, computed, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
// Fix: Removed `toSignal` import as `computed` is used directly for derived signal state.
// Fix: Removed `filter, map` imports as `computed` directly operates on signal values.

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="flex-grow container mx-auto px-4 py-8">
      @if (isAuthenticated()) {
        <router-outlet />
      } @else {
        <!-- Render login page directly if not authenticated, avoiding extra redirects for initial load -->
        <router-outlet />
      }
    </main>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Fix: Use `computed` for derived signal state, as `currentUser` is already a signal.
  isAuthenticated = computed(() => !!this.authService.currentUser());

  constructor() {
    // Fix: Use `effect` to react to signal changes for side effects like navigation,
    // as `Signal`s do not have a `subscribe` method.
    effect(() => {
      const user = this.authService.currentUser();
      const currentUrl = this.router.url;

      if (!user && currentUrl !== '/login') {
        this.router.navigate(['/login']);
      } else if (user && currentUrl === '/login') {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}