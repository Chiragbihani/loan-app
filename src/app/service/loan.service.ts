import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private baseUrl = 'http://localhost:3000/loans';

  constructor(private http: HttpClient) {}

  // For user
  applyLoan(loan: any): Observable<any> {
    return this.http.post(this.baseUrl, loan);
  }

  getUserLoans(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}`);
  }

  // For admin
  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  updateLoanStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, { status });
  }
  
}

