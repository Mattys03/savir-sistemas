import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  template: `
<div class="container mx-auto p-4 bg-white rounded-lg shadow-lg max-w-2xl">
  <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ isEditMode() ? 'Editar Usuário' : 'Incluir Usuário' }}</h2>

  <!-- AVISO DE PERMISSÃO -->
  <div *ngIf="showPermissionWarning()" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p class="text-yellow-700 text-sm">
      ⚠️ Você está editando seu próprio perfil. Algumas opções podem estar limitadas.
    </p>
  </div>

  <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
    <div class="mb-4">
      <label for="id" class="block text-gray-700 text-sm font-semibold mb-2">ID</label>
      <input
        id="id"
        type="text"
        formControlName="id"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 bg-gray-100 cursor-not-allowed"
        readonly
      />
    </div>

    <div class="mb-4">
      <label for="name" class="block text-gray-700 text-sm font-semibold mb-2">Nome Completo</label>
      <input
        id="name"
        type="text"
        formControlName="name"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Nome completo do usuário"
      />
      <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="text-red-500 text-xs italic mt-1">
        Nome é obrigatório.
      </div>
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
      <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-xs italic mt-1">
        E-mail inválido ou obrigatório.
      </div>
    </div>

    <div class="mb-4">
      <label for="login" class="block text-gray-700 text-sm font-semibold mb-2">Login</label>
      <input
        id="login"
        type="text"
        formControlName="login"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Login do usuário"
        [readonly]="isEditMode()"
      />
      <div *ngIf="userForm.get('login')?.invalid && userForm.get('login')?.touched" class="text-red-500 text-xs italic mt-1">
        Login é obrigatório.
      </div>
    </div>

    <div *ngIf="!isEditMode()" class="mb-4">
      <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Senha</label>
      <input
        id="password"
        type="password"
        formControlName="password"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Senha do usuário"
        autocomplete="new-password"
      />
      <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="text-red-500 text-xs italic mt-1">
        Senha é obrigatória.
      </div>
    </div>

    <div class="mb-6">
      <label for="profile" class="block text-gray-700 text-sm font-semibold mb-2">Perfil de Acesso</label>
      <select
        id="profile"
        formControlName="profile"
        class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        [disabled]="!canEditProfile()"
      >
        <option value="">Selecione...</option>
        <option value="Administrador">Administrador</option>
        <option value="Usuário">Usuário</option>
      </select>
      <div *ngIf="userForm.get('profile')?.invalid && userForm.get('profile')?.touched" class="text-red-500 text-xs italic mt-1">
        Perfil é obrigatório.
      </div>
      
      <!-- AVISO SE NÃO PODE EDITAR PERFIL -->
      <div *ngIf="!canEditProfile()" class="mt-2 text-sm text-gray-600">
        💡 Apenas administradores podem alterar perfis de acesso.
      </div>
    </div>

    <div class="flex justify-end space-x-4">
      <button
        type="button"
        (click)="router.navigate(['/users'])"
        class="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
      >
        Voltar
      </button>
      <button
        type="submit"
        [disabled]="userForm.invalid || loading()"
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
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private authService = inject(AuthService);

  isEditMode = signal(false);
  loading = signal(false);
  userId: string | null = null;
  isEditingOwnProfile = false;

  userForm = this.fb.group({
    id: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    login: ['', Validators.required],
    password: [''],
    profile: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.isEditMode.set(true);
        
        // VERIFICAR SE ESTÁ EDITANDO O PRÓPRIO PERFIL
        const currentUser = this.authService.currentUser();
        this.isEditingOwnProfile = currentUser?.id === this.userId;
        
        // VERIFICAÇÃO DE PERMISSÃO - Só pode editar se for admin OU se for o próprio perfil
        if (!this.authService.isAdministrator() && !this.isEditingOwnProfile) {
          alert('❌ Você não tem permissão para editar outros usuários!');
          this.router.navigate(['/dashboard']);
          return;
        }

        this.userForm.get('password')?.setValidators([]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.loadUserData(this.userId);
        
        // Login não pode ser editado em modo de edição
        this.userForm.get('login')?.disable();

      } else {
        this.isEditMode.set(false);
        
        // VERIFICAÇÃO DE PERMISSÃO - Só admin pode criar usuários
        if (!this.authService.isAdministrator()) {
          alert('❌ Apenas administradores podem criar novos usuários!');
          this.router.navigate(['/dashboard']);
          return;
        }

        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.patchValue({ id: '' });
        this.userForm.get('login')?.enable();
      }
    });
  }

  // VERIFICAR SE PODE EDITAR O PERFIL (apenas administradores)
  canEditProfile(): boolean {
    return this.authService.isAdministrator();
  }

  // MOSTRAR AVISO DE PERMISSÃO
  showPermissionWarning(): boolean {
    return this.isEditMode() && this.isEditingOwnProfile && !this.authService.isAdministrator();
  }

  async loadUserData(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.userService.getUserById(id).toPromise();
      if (user) {
        this.userForm.patchValue({
          id: user.id?.slice(0, 8) || user._id?.slice(0, 8) || '',
          name: user.name,
          email: user.email,
          login: user.login,
          profile: user.profile,
        });
      } else {
        alert('Usuário não encontrado.');
        this.router.navigate(['/users']);
      }
    } catch (error) {
      alert('Erro ao carregar usuário.');
      this.router.navigate(['/users']);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid && !this.loading()) {
      
      // VERIFICAÇÃO FINAL DE PERMISSÃO ANTES DE SALVAR
      if (this.isEditMode() && !this.authService.isAdministrator() && !this.isEditingOwnProfile) {
        alert('❌ Você não tem permissão para editar outros usuários!');
        return;
      }

      this.loading.set(true);
      
      try {
        const userData = this.userForm.getRawValue();
        const userToSave: Omit<User, 'id'> = {
          name: userData.name!,
          email: userData.email!,
          login: userData.login!,
          profile: userData.profile as 'Administrador' | 'Usuário',
        };

        if (this.isEditMode() && this.userId) {
          // SE FOR USUÁRIO COMUM EDITANDO PRÓPRIO PERFIL, GARANTIR QUE PERFIL NÃO MUDE
          if (!this.authService.isAdministrator() && this.isEditingOwnProfile) {
            userToSave.profile = 'Usuário'; // Forçar perfil de usuário
          }

          const updated = await this.userService.updateUser(this.userId, userToSave).toPromise();
          if (updated) {
            alert('✅ Usuário atualizado com sucesso!');
            
            // SE EDITOU O PRÓPRIO PERFIL, ATUALIZAR DADOS NO AUTH SERVICE
            if (this.isEditingOwnProfile) {
              const currentUser = this.authService.currentUser();
              this.authService.currentUser.set({
                ...currentUser,
                name: userToSave.name,
                email: userToSave.email
              });
            }
            
            this.router.navigate(['/users']);
          } else {
            alert('❌ Erro ao atualizar usuário.');
          }
        } else {
          // MODO CRIAÇÃO - Só admin chega aqui
          const newUser = await this.userService.addUser(userToSave, userData.password || '123').toPromise();
          if (newUser) {
            alert('✅ Usuário cadastrado com sucesso!');
            this.router.navigate(['/users']);
          } else {
            alert('❌ Erro ao cadastrar usuário.');
          }
        }
      } catch (error: any) {
        console.error('Erro completo:', error);
        const errorMessage = error.error?.error || 'Erro ao salvar usuário. Verifique o console.';
        alert(`❌ ${errorMessage}`);
      } finally {
        this.loading.set(false);
      }
    } else {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios corretamente.');
      this.userForm.markAllAsTouched();
    }
  }
}