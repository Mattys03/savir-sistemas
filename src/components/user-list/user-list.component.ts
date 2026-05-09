import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">Lista de Usuários</h2>
        
        <!-- ✅ Só admin pode adicionar usuários -->
        <button
          *ngIf="authService.isAdministrator()"
          (click)="router.navigate(['/users/add'])"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Usuário
        </button>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="text-center py-4">Carregando usuários...</div>
      }

      <!-- Users table -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (user of users(); track user.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.id?.slice(0, 8) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.login }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span [class]="getProfileBadgeClass(user.profile)">
                    {{ user.profile }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  
                  <!-- 🔥 BOTÃO EDITAR: Só aparece se for admin OU se for o próprio perfil -->
                  <button
                    *ngIf="authService.isAdministrator() || isOwnProfile(user.id!)"
                    (click)="editUser(user.id!)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  
                  <!-- 🔥 BOTÃO EXCLUIR: Só aparece se for admin E NÃO for o próprio perfil -->
                  <button
                    *ngIf="authService.isAdministrator() && !isOwnProfile(user.id!)"
                    (click)="deleteUser(user.id!)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>

                  <!-- 🔥 MENSAGEM para usuário comum no próprio perfil -->
                  <span *ngIf="!authService.isAdministrator() && isOwnProfile(user.id!)" 
                        class="text-gray-500 text-xs">
                    Seu perfil
                  </span>

                  <!-- 🔥 MENSAGEM para usuário comum em outros perfis -->
                  <span *ngIf="!authService.isAdministrator() && !isOwnProfile(user.id!)" 
                        class="text-gray-400 text-xs">
                    Sem permissão
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ✅ Aviso para usuários não administradores -->
      <div *ngIf="!authService.isAdministrator()" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-700 text-sm">
          🔒 Você só pode editar seu próprio perfil. Apenas administradores podem gerenciar outros usuários.
        </p>
      </div>

      <!-- ✅ Aviso para administradores -->
      <div *ngIf="authService.isAdministrator()" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-700 text-sm">
          👑 Você tem permissão total para gerenciar todos os usuários.
        </p>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  public authService = inject(AuthService);
  public router = inject(Router);

  users = signal<User[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    
    this.userService.getAllUsers().subscribe({
      next: (userList) => {
        this.users.set(userList.map(u => ({ 
          ...u, 
          id: (u as any)._id || u.id 
        })));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários');
        this.loading.set(false);
      }
    });
  }

  // 🔥 EDITAR USUÁRIO
  editUser(id: string): void {
    this.router.navigate(['/users/edit', id]);
  }

  // 🔥 EXCLUIR USUÁRIO
  async deleteUser(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await this.userService.deleteUser(id).toPromise();
        alert('✅ Usuário excluído com sucesso!');
        this.loadUsers();
      } catch (error) {
        alert('❌ Erro ao excluir usuário.');
      }
    }
  }

  // ✅ VERIFICAR SE É O PRÓPRIO PERFIL
  isOwnProfile(userId: string): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === userId;
  }

  // ✅ ESTILO PARA OS BADGES DE PERFIL
  getProfileBadgeClass(profile: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    
    switch (profile) {
      case 'Administrador':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Usuário':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}
