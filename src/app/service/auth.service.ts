import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // Register → default new users as role 'user'
  register(user: any): Observable<any> {
    user.role = 'user';  // ✅ ensures no one registers as admin
    return this.http.post(this.baseUrl, user);
  }

  // Login → store the fresh user in localStorage
  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length) {
          const loggedInUser = users[0];
          localStorage.setItem('currentUser', JSON.stringify(loggedInUser)); // ✅ overwrite old user
          return loggedInUser; // includes role
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
  }

  // Check login status
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // ✅ Get current user object
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }
}
