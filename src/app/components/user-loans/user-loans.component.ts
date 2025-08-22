import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';

@Component({
  selector: 'app-user-loans',
  templateUrl: './user-loans.component.html',
  styleUrls: ['./user-loans.component.css']
})
export class UserLoansComponent implements OnInit {
  loans: any[] = [];
  newLoan = { amount: '', type: '', userId: null, status: 'pending' };

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.newLoan.userId = currentUser.id;

    this.loanService.getUserLoans(currentUser.id).subscribe(res => {
      this.loans = res;
    });
  }

  applyLoan() {
    this.loanService.applyLoan(this.newLoan).subscribe(() => {
      alert('Loan applied successfully! Pending approval.');
      this.newLoan = { amount: '', type: '', userId: this.newLoan.userId, status: 'pending' };
      this.loadLoans(); // refresh the table
    });
  }

  cancelLoan(id: number) {
    if (confirm('Are you sure you want to cancel this loan request?')) {
      this.loanService.updateLoanStatus(id, 'cancelled').subscribe(() => {
        alert('Loan request cancelled.');
        this.loadLoans();
      });
    }
  }
}
