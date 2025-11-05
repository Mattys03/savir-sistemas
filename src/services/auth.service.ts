import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<any>(null);

  constructor() {
    // Carrega usuário do localStorage se existir
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  // 🔥 AGORA USA O BACKEND REAL para login
  login(credentials: any): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/auth/login', credentials).pipe(
      tap(response => {
        if (response.success) {
          // Salva o usuário no signal e no localStorage
          this.currentUser.set(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdministrator(): boolean {
    return this.currentUser()?.profile === 'Administrador';
  }

  // 🔥 NOVO: Buscar usuário atual do backend
  getCurrentUser(): any {
    return this.currentUser();
  }
}