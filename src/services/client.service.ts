import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  // ✅ SOLUÇÃO DIRETA - Use localhost para desenvolvimento
  // ⚠️ SUBSTITUA pela SUA URL do Render quando for fazer deploy
  private apiUrl = 'https://savir-sistemas.onrender.com/api'; // Para desenvolvimento
  // private apiUrl = 'https://seu-backend.onrender.com/api'; // Para produção

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  addClient(client: Omit<Client, 'id'>): Observable<Client> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.post<Client>(`${this.apiUrl}/clients`, { 
      ...client, 
      createdBy: userId 
    }, { headers });
  }

  updateClient(id: string, updatedClient: Partial<Client>): Observable<Client> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}`, { 
      ...updatedClient 
    }, { headers });
  }

  deleteClient(id: string): Observable<void> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`, { headers });
  }
}