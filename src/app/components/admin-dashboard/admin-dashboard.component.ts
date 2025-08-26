import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  pendingLoans: any[] = [];
  approvedLoans: any[] = [];
  rejectedLoans: any[] = [];
  users: any[] = [];

  constructor(private loanService: LoanService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchLoans();
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(res => {
      this.users = res;
    });
  }

  fetchLoans() {
    this.loanService.getAllLoans().subscribe(res => {
      this.pendingLoans = res.filter(l => l.status === 'pending');
      this.approvedLoans = res.filter(l => l.status === 'approved');
      this.rejectedLoans = res.filter(l => l.status === 'rejected');
    });
  }

  updateStatus(id: number, status: string) {
    this.loanService.updateLoanStatus(id, status).subscribe(() => {
      this.fetchLoans();
    });
  }

  getUserName(userId: string): string {
    const user = this.users?.find(u => u.id === userId);
    return user ? user.fullName : 'Unknown';
  }
}
