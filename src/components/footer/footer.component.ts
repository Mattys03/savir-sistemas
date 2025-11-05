import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-800 text-white text-center py-4 mt-8">
      <div class="container mx-auto px-4">
        &copy; 2024 Savir Sistemas - Todos os direitos reservados.
        <div class="mt-2 text-sm text-gray-400">
          Desenvolvido por <strong class="text-blue-300">Matheus RP</strong>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}