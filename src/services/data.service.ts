import { Injectable, signal, Signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DataService<T extends { id: string }> {
  private readonly localStorageKey: string;
  private _data = signal<T[]>([]);
  public readonly data: Signal<T[]> = this._data.asReadonly();

  constructor(entityName: string) {
    this.localStorageKey = `app_data_${entityName}`;
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const storedData = localStorage.getItem(this.localStorageKey);
    if (storedData) {
      try {
        const parsedData: T[] = JSON.parse(storedData);
        this._data.set(parsedData);
      } catch (e) {
        console.error(`Error parsing data from localStorage for ${this.localStorageKey}`, e);
        this._data.set([]);
      }
    } else {
      this._data.set([]);
    }
  }

  private saveData(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this._data()));
  }

  getAll(): Signal<T[]> {
    return this.data;
  }

  getById(id: string): Signal<T | undefined> {
    return computed(() => this._data().find(item => item.id === id));
  }

  add(item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: uuidv4() } as T;
    this._data.update(items => [...items, newItem]);
    this.saveData();
    return newItem;
  }

  update(id: string, updatedItem: Partial<T>): boolean {
    let updated = false;
    this._data.update(items => {
      const index = items.findIndex(item => item.id === id);
      if (index > -1) {
        items[index] = { ...items[index], ...updatedItem };
        updated = true;
      }
      return [...items]; // Return a new array reference for signal change detection
    });
    if (updated) {
      this.saveData();
    }
    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this._data().length;
    this._data.update(items => items.filter(item => item.id !== id));
    const deleted = this._data().length < initialLength;
    if (deleted) {
      this.saveData();
    }
    return deleted;
  }

  // Helper for generating unique IDs (can be used for initial data)
  generateId(): string {
    return uuidv4();
  }
}
