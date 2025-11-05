import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // ✅ CORRIGIDO: Agora envia createdBy
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.post<Product>(`${this.apiUrl}/products`, { 
      ...product, 
      createdBy: userId 
    }, { headers });
  }

  // ✅ CORRIGIDO: Agora envia userId no header
  updateProduct(id: string, updatedProduct: Partial<Product>): Observable<Product> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, { 
      ...updatedProduct 
    }, { headers });
  }

  // ✅ CORRIGIDO: Agora envia userId no header
  deleteProduct(id: string): Observable<void> {
    const userId = this.authService.currentUser()?.id;
    const headers = new HttpHeaders().set('user-id', userId || '');
    
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers });
  }
}