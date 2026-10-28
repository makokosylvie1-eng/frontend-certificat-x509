import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const TOKEN_KEY = 'x509_token';

// Lecture du jeton sans injection : utilisée aussi par l'intercepteur HTTP.
// Le test "window" évite une erreur pendant le rendu côté serveur (SSR).
export function getStoredToken(): string | null {
  return typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly api = '/api';

  user: AuthUser | null = null;

  get token(): string | null {
    return getStoredToken();
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.user;
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, payload)
      .pipe(tap((res) => this.saveSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  // Restaure l'utilisateur après un rechargement de page.
  fetchMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.api}/me`).pipe(tap((u) => (this.user = u)));
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.api}/logout`, {}).pipe(tap(() => this.clear()));
  }

  clear(): void {
    this.user = null;
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  }

  private saveSession(res: AuthResponse): void {
    this.user = res.user;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(TOKEN_KEY, res.token);
    }
  }
}