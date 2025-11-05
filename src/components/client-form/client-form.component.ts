import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // 🔥 ADICIONAR
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule], // 🔥 ADICIONAR HttpClientModule
  template: `
    <div class="container mx-auto p-4 bg-white rounded-lg shadow-lg max-w-2xl">
      <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ isEditMode() ? 'Editar Cliente' : 'Incluir Cliente' }}</h2>

      <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
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
          <label for="name" class="block text-gray-700 text-sm font-semibold mb-2">Nome</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome do cliente"
          />
          @if (clientForm.get('name')?.invalid && clientForm.get('name')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Nome é obrigatório.</p>
          }
        </div>

        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-semibold mb-2">E-mail</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
          @if (clientForm.get('email')?.invalid && clientForm.get('email')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">E-mail inválido ou obrigatório.</p>
          }
        </div>

        <div class="mb-4">
          <label for="phone" class="block text-gray-700 text-sm font-semibold mb-2">Telefone</label>
          <input
            id="phone"
            type="text"
            formControlName="phone"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 11987654321"
          />
          @if (clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Telefone é obrigatório.</p>
          }
        </div>

        <div class="mb-6">
          <label for="address" class="block text-gray-700 text-sm font-semibold mb-2">Endereço</label>
          <input
            id="address"
            type="text"
            formControlName="address"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Endereço completo"
          />
          @if (clientForm.get('address')?.invalid && clientForm.get('address')?.touched) {
            <p class="text-red-500 text-xs italic mt-1">Endereço é obrigatório.</p>
          }
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            (click)="router.navigate(['/clients'])"
            class="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            [disabled]="clientForm.invalid || loading()"
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
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  isEditMode = signal(false);
  loading = signal(false); // 🔥 CONTROLE DE CARREGAMENTO
  clientId: string | null = null;

  clientForm = this.fb.group({
    id: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('id');
      if (this.clientId) {
        this.isEditMode.set(true);
        this.loadClientData(this.clientId);
      } else {
        this.isEditMode.set(false);
        this.clientForm.patchValue({ id: '' });
      }
    });
  }

async loadClientData(id: string): Promise<void> {
  this.loading.set(true);
  try {
    const client = await this.clientService.getClientById(id).toPromise();
    if (client) {
      // 🔥 CORREÇÃO: Usar _id do MongoDB
      const clientId = (client as any)._id || client.id;
      this.clientForm.patchValue({
        id: clientId ? clientId.slice(0, 8) : '',
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      });
    } else {
      alert('Cliente não encontrado.');
      this.router.navigate(['/clients']);
    }
  } catch (error) {
    alert('Erro ao carregar cliente.');
    this.router.navigate(['/clients']);
  } finally {
    this.loading.set(false);
  }
}

  async onSubmit(): Promise<void> {
    if (this.clientForm.valid && !this.loading()) {
      this.loading.set(true);
      
      try {
        const clientData = this.clientForm.getRawValue();
        const clientToSave: Omit<Client, 'id'> = {
          name: clientData.name!,
          email: clientData.email!,
          phone: clientData.phone!,
          address: clientData.address!,
        };

        if (this.isEditMode() && this.clientId) {
          // 🔥 ATUALIZAÇÃO VIA HTTP
          const updated = await this.clientService.updateClient(this.clientId, clientToSave).toPromise();
          if (updated) {
            alert('Cliente atualizado com sucesso!');
            this.router.navigate(['/clients']);
          } else {
            alert('Erro ao atualizar cliente.');
          }
        } else {
          // 🔥 CRIAÇÃO VIA HTTP
          const newClient = await this.clientService.addClient(clientToSave).toPromise();
          if (newClient) {
            alert('Cliente cadastrado com sucesso!');
            this.router.navigate(['/clients']);
          } else {
            alert('Erro ao cadastrar cliente.');
          }
        }
      } catch (error) {
        alert('Erro ao salvar cliente. Verifique o console.');
        console.error('Erro:', error);
      } finally {
        this.loading.set(false);
      }
    } else {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      this.clientForm.markAllAsTouched();
    }
  }
}