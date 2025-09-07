import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';

@Component({
  selector: 'app-repay-loan',
  templateUrl: './repay-loan.component.html',
  styleUrls: ['./repay-loan.component.css']
})
export class RepayLoanComponent implements OnInit {
  activeLoans: any[] = []; // Only approved/active loans
  repayments: any[] = [];
  selectedLoanId: number | null = null;
  paymentMode: string = 'UPI';

  // Interest rates mapping (should match user-loans.component.ts)
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
    this.loadActiveLoans();
    this.loadRepayments();
  }

  loadActiveLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loanService.getUserLoans(currentUser.id).subscribe(loans => {
      // Filter only approved/active loans
      this.activeLoans = loans
        .filter(loan => loan.status === 'approved')
        .map(loan => ({
          ...loan,
          repaymentAmount: this.calculateRepayment(loan),
          repaymentDate: this.calculateRepaymentDate(loan)
        }));
    });
  }

  // Dynamic repayment calculation
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

  getRepaymentAmount(): number {
    const loan = this.activeLoans.find(l => l.id === this.selectedLoanId);
    return loan ? this.calculateRepayment(loan) : 0;
  }

  getRepaymentDate(): string {
    const loan = this.activeLoans.find(l => l.id === this.selectedLoanId);
    return loan ? this.calculateRepaymentDate(loan) : 'N/A';
  }

  repayLoan() {
  if (!this.selectedLoanId) return;

  const repayment = {
    id: Date.now(), // unique id
    userId: JSON.parse(localStorage.getItem('currentUser')!).id,
    loanId: this.selectedLoanId,
    amount: this.getRepaymentAmount(),
    mode: this.paymentMode,
    date: new Date()
  };

  // 1️⃣ Save repayment in db.json
  this.loanService.addRepayment(repayment).subscribe(() => {
    // 2️⃣ Update loan status to "repaid"
    this.loanService.updateLoanStatus(this.selectedLoanId!, 'repaid').subscribe(() => {
      alert(`Repayment of ₹${repayment.amount} for Loan #${repayment.loanId} successful!`);

      // Refresh lists
      this.loadActiveLoans();
      this.loadRepayments();

      this.selectedLoanId = null;
      this.paymentMode = 'UPI';
    });
  });
}

loadRepayments() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
  this.loanService.getUserRepayments(currentUser.id).subscribe(res => {
    this.repayments = res;
  });
}
}
