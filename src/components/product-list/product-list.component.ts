import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">Lista de Produtos</h2>
        
        <!-- ✅ Botão para adicionar produto -->
        <button
          (click)="router.navigate(['/products/add'])"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Produto
        </button>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="text-center py-4">Carregando produtos...</div>
      }

      <!-- Products table -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (product of products(); track product.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.id?.slice(0, 8) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ product.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {{ product.price }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.stock }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  
                  @if (authService.isAdministrator() || isOwner(product.createdBy)) {
                    <button
                      (click)="editProduct(product.id!)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    
                    <button
                      (click)="deleteProduct(product.id!)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  } @else {
                    <span class="text-gray-400 text-xs">
                      Sem permissão
                    </span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ✅ Aviso de permissões -->
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        @if (authService.isAdministrator()) {
          <p class="text-blue-700 text-sm">
            👑 Você é administrador e pode gerenciar todos os produtos.
          </p>
        } @else {
          <p class="text-blue-700 text-sm">
            🔒 Você só pode editar/excluir os produtos que você criou.
          </p>
        }
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  public authService = inject(AuthService);
  public router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (productList) => {
        this.products.set(productList.map(p => ({ 
          ...p, 
          id: (p as any)._id || p.id 
        })));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos');
        this.loading.set(false);
      }
    });
  }

  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  async deleteProduct(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await this.productService.deleteProduct(id).toPromise();
        alert('✅ Produto excluído com sucesso!');
        this.loadProducts();
      } catch (error: any) {
        alert(`❌ ${error.error?.error || 'Erro ao excluir produto'}`);
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
