import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-loans',
  templateUrl: './user-loans.component.html',
  styleUrls: ['./user-loans.component.css']
})
export class UserLoansComponent implements OnInit {
  loans: any[] = [];
  newLoan = { amount: '', type: '', userId: null, status: 'pending', tenure: '', dateTaken: '' };
  activeSection: 'apply' | 'applied' | 'repay' = 'applied';

  loanInterestRates: { [key: string]: number } = {
    home: 7,
    personal: 12,
    education: 6,
    car: 8,
    gold: 10,
    business: 11,
    agriculture: 5,
    medical: 9
  };

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.newLoan.userId = currentUser.id;

    this.loanService.getUserLoans(currentUser.id).subscribe(res => {
      this.loans = res.map(loan => ({
        ...loan,
        repaymentAmount: this.calculateRepayment(loan),
        repaymentDate: this.calculateRepaymentDate(loan)
      }));
    });
  }

  applyLoan() {
    this.loanService.applyLoan(this.newLoan).subscribe(() => {
      Swal.fire({
        title: 'Application Submitted',
        text: 'Your loan has been applied successfully and is pending approval.',
        icon: 'success',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#3498db'
      });
      this.newLoan = { amount: '', type: '', userId: this.newLoan.userId, status: 'pending', tenure: '', dateTaken: '' };
      this.loadLoans();
    });
  }

  cancelLoan(id: number) {
    Swal.fire({
      title: 'Cancel Loan Request?',
      text: 'Are you sure you want to cancel this loan request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6'
    }).then(result => {
      if (result.isConfirmed) {
        this.loanService.updateLoanStatus(id, 'cancelled').subscribe(() => {
          Swal.fire({
            title: 'Cancelled',
            text: 'Your loan request has been cancelled.',
            icon: 'success',
            confirmButtonColor: '#27ae60'
          });
          this.loadLoans();
        });
      }
    });
  }

  calculateRepayment(loan: any): number {
    const rate = this.loanInterestRates[loan.type] || 10;
    const principal = Number(loan.amount);
    const tenureYears = Number(loan.tenure) / 12;
    const interest = (principal * rate * tenureYears) / 100;
    return Math.round(principal + interest);
  }

  calculateRepaymentDate(loan: any): string {
    if (!loan.dateTaken || !loan.tenure) return 'N/A';
    const startDate = new Date(loan.dateTaken);
    startDate.setMonth(startDate.getMonth() + Number(loan.tenure));
    return startDate.toISOString().split('T')[0];
  }
}
