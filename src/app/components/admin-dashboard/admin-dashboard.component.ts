import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  pendingLoans: any[] = [];
  approvedLoans: any[] = [];
  rejectedLoans: any[] = [];

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.fetchLoans();
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
}
