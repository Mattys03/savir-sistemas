import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service'; // ✅ ADICIONAR
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mx-auto p-4 bg-white rounded-lg shadow-lg max-w-2xl">
      <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ isEditMode() ? 'Editar Produto' : 'Incluir Produto' }}</h2>

      <!-- ✅ AVISO DE PERMISSÃO -->
      <div *ngIf="showPermissionWarning()" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-700 text-sm">
          ⚠️ Você está editando um produto criado por outro usuário. Certifique-se de ter permissão.
        </p>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="id" class="block text-gray-700 text-sm font-semibold mb-2">ID</label>
          <input
            id="id"
            type="text"
            formControlName="id"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 bg-gray-100 cursor-not-allowed"
            readonly
          />
        </div>

        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-semibold mb-2">Nome do Produto</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome do produto"
          />
          @if (productForm.get('name')?.invalid && productForm.get('name')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Nome é obrigatório.</p>
          }
        </div>

        <div class="mb-4">
          <label for="description" class="block text-gray-700 text-sm font-semibold mb-2">Descrição</label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descrição detalhada do produto"
          ></textarea>
          @if (productForm.get('description')?.invalid && productForm.get('description')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Descrição é obrigatória.</p>
          }
        </div>

        <div class="mb-4">
          <label for="price" class="block text-gray-700 text-sm font-semibold mb-2">Preço</label>
          <input
            id="price"
            type="number"
            formControlName="price"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
          />
          @if (productForm.get('price')?.invalid && productForm.get('price')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Preço é obrigatório e deve ser um número positivo.</p>
          }
        </div>

        <div class="mb-6">
          <label for="stock" class="block text-gray-700 text-sm font-semibold mb-2">Estoque</label>
          <input
            id="stock"
            type="number"
            formControlName="stock"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
          @if (productForm.get('stock')?.invalid && productForm.get('stock')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Estoque é obrigatório e deve ser um número inteiro não-negativo.</p>
          }
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            (click)="router.navigate(['/products'])"
            class="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            [disabled]="productForm.invalid || loading()"
            class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading() ? 'Salvando...' : 'Gravar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService); // ✅ ADICIONAR
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  isEditMode = signal(false);
  loading = signal(false);
  productId: string | null = null;
  productCreatedBy: string | null = null; // ✅ ADICIONAR para verificar permissões

  productForm = this.fb.group({
    id: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.isEditMode.set(true);
        
        // ✅ VERIFICAÇÃO DE PERMISSÃO ANTES DE CARREGAR
        this.loadProductData(this.productId);
      } else {
        this.isEditMode.set(false);
        this.productForm.patchValue({ id: '' });
      }
    });
  }

  // ✅ VERIFICAR SE TEM PERMISSÃO PARA EDITAR
  hasPermission(): boolean {
    if (!this.isEditMode()) return true; // Criação sempre permitida
    
    const currentUser = this.authService.currentUser();
    return this.authService.isAdministrator() || currentUser?.id === this.productCreatedBy;
  }

  // ✅ MOSTRAR AVISO DE PERMISSÃO
  showPermissionWarning(): boolean {
    return this.isEditMode() && !this.hasPermission();
  }

  loadProductData(id: string): void {
    this.loading.set(true);
    
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          // ✅ Salvar quem criou o produto para verificar permissões
          this.productCreatedBy = (product as any).createdBy;
          
          // ✅ VERIFICAR PERMISSÃO APÓS CARREGAR OS DADOS
          if (!this.hasPermission()) {
            alert('❌ Você não tem permissão para editar este produto!');
            this.router.navigate(['/products']);
            return;
          }

          const productId = (product as any)._id || product.id;
          this.productForm.patchValue({
            id: productId ? productId.slice(0, 8) : '',
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
          });
        } else {
          alert('Produto não encontrado.');
          this.router.navigate(['/products']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        alert('Erro ao carregar produto.');
        this.router.navigate(['/products']);
        this.loading.set(false);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid && !this.loading()) {
      
      // ✅ VERIFICAÇÃO FINAL DE PERMISSÃO ANTES DE SALVAR
      if (this.isEditMode() && !this.hasPermission()) {
        alert('❌ Você não tem permissão para editar este produto!');
        return;
      }

      this.loading.set(true);
      
      try {
        const productData = this.productForm.getRawValue();
        const productToSave: Omit<Product, 'id'> = {
          name: productData.name!,
          description: productData.description!,
          price: productData.price!,
          stock: productData.stock!,
        };

        if (this.isEditMode() && this.productId) {
          const updated = await this.productService.updateProduct(this.productId, productToSave).toPromise();
          if (updated) {
            alert('✅ Produto atualizado com sucesso!');
            this.router.navigate(['/products']);
          } else {
            alert('❌ Erro ao atualizar produto.');
          }
        } else {
          const newProduct = await this.productService.addProduct(productToSave).toPromise();
          if (newProduct) {
            alert('✅ Produto cadastrado com sucesso!');
            this.router.navigate(['/products']);
          } else {
            alert('❌ Erro ao cadastrar produto.');
          }
        }
      } catch (error: any) {
        console.error('Erro completo:', error);
        const errorMessage = error.error?.error || 'Erro ao salvar produto. Verifique o console.';
        alert(`❌ ${errorMessage}`);
      } finally {
        this.loading.set(false);
      }
    } else {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios corretamente.');
      this.productForm.markAllAsTouched();
    }
  }
}