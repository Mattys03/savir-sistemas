import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">Lista de Clientes</h2>
        
        <!-- ✅ Botão para adicionar cliente -->
        <button
          (click)="router.navigate(['/clients/add'])"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Cliente
        </button>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="text-center py-4">Carregando clientes...</div>
      }

      <!-- Clients table -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (client of clients(); track client.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.id?.slice(0, 8) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ client.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.phone }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.address }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  
                  <!-- 🔥 EDITAR: Só aparece se for admin OU se for o criador -->
                  <button
                    *ngIf="authService.isAdministrator() || isOwner(client.createdBy)"
                    (click)="editClient(client.id!)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  
                  <!-- 🔥 EXCLUIR: Só aparece se for admin OU se for o criador -->
                  <button
                    *ngIf="authService.isAdministrator() || isOwner(client.createdBy)"
                    (click)="deleteClient(client.id!)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>

                  <!-- 🔥 MENSAGEM se não tem permissão -->
                  <span *ngIf="!authService.isAdministrator() && !isOwner(client.createdBy)" 
                        class="text-gray-400 text-xs">
                    Sem permissão
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ✅ Aviso de permissões -->
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-700 text-sm" *ngIf="authService.isAdministrator()">
          👑 Você é administrador e pode gerenciar todos os clientes.
        </p>
        <p class="text-blue-700 text-sm" *ngIf="!authService.isAdministrator()">
          🔒 Você só pode editar/excluir os clientes que você criou.
        </p>
      </div>
    </div>
  `,
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  public authService = inject(AuthService);
  public router = inject(Router);

  clients = signal<Client[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients().subscribe({
      next: (clientList) => {
        this.clients.set(clientList.map(c => ({ 
          ...c, 
          id: (c as any)._id || c.id 
        })));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        alert('Erro ao carregar clientes');
        this.loading.set(false);
      }
    });
  }

  editClient(id: string): void {
    this.router.navigate(['/clients/edit', id]);
  }

  async deleteClient(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await this.clientService.deleteClient(id).toPromise();
        alert('✅ Cliente excluído com sucesso!');
        this.loadClients();
      } catch (error: any) {
        alert(`❌ ${error.error?.error || 'Erro ao excluir cliente'}`);
      }
    }
  }

  // ✅ VERIFICAR SE É O DONO DO REGISTRO
  isOwner(createdBy: string | undefined): boolean {
    if (!createdBy) return false;
    const currentUser = this.authService.currentUser();
    return currentUser?.id === createdBy;
  }
}