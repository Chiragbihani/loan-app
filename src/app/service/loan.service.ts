import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private loansUrl = 'http://localhost:3000/loans';
  private repaymentsUrl = 'http://localhost:3000/repayments';

  constructor(private http: HttpClient) {}

  // For user
  applyLoan(loan: any): Observable<any> {
    return this.http.post(this.loansUrl, loan);
  }

  getUserLoans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.loansUrl}?userId=${userId}`);
  }

  // For admin
  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(this.loansUrl);
  }

  updateLoanStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.loansUrl}/${id}`, { status });
  }

  // ✅ repayments
  addRepayment(repayment: any): Observable<any> {
    return this.http.post(this.repaymentsUrl, repayment);
  }

  getUserRepayments(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.repaymentsUrl}?userId=${userId}`);
  }

  getAllRepayments(): Observable<any[]> {
    return this.http.get<any[]>(this.repaymentsUrl);
  }
}
