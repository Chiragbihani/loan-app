import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repay-loan',
  templateUrl: './repay-loan.component.html',
  styleUrls: ['./repay-loan.component.css']
})
export class RepayLoanComponent implements OnInit {
  activeLoans: any[] = [];
  repayments: any[] = [];
  selectedLoanId: number | null = null;
  paymentMode: string = 'UPI';

  // Extra payment details
  upiId: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  bank: string = '';

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
      this.activeLoans = loans
        .filter(loan => loan.status === 'approved')
        .map(loan => ({
          ...loan,
          repaymentAmount: this.calculateRepayment(loan),
          repaymentDate: this.calculateRepaymentDate(loan)
        }));
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

  getRepaymentAmount(): number {
    const loan = this.activeLoans.find(l => l.id === this.selectedLoanId);
    return loan ? this.calculateRepayment(loan) : 0;
  }

  getRepaymentDate(): string {
    const loan = this.activeLoans.find(l => l.id === this.selectedLoanId);
    return loan ? this.calculateRepaymentDate(loan) : 'N/A';
  }

  // Step 1: Confirm payment before proceeding
  confirmPayment() {
    Swal.fire({
      title: 'Confirm Payment',
      text: `Are you sure you want to repay ₹${this.getRepaymentAmount()} via ${this.paymentMode}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.repayLoan();
      }
    });
  }

  // Step 2: Process repayment
  repayLoan() {
    if (!this.selectedLoanId) return;

    const repayment = {
      id: Date.now(),
      userId: JSON.parse(localStorage.getItem('currentUser')!).id,
      loanId: this.selectedLoanId,
      amount: this.getRepaymentAmount(),
      mode: this.paymentMode,
      date: new Date()
    };

    this.loanService.addRepayment(repayment).subscribe(() => {
      this.loanService.updateLoanStatus(this.selectedLoanId!, 'repaid').subscribe(() => {
        Swal.fire('Payment Successful', `₹${repayment.amount} has been repaid successfully!`, 'success');

        this.loadActiveLoans();
        this.loadRepayments();

        this.selectedLoanId = null;
        this.paymentMode = 'UPI';
        this.upiId = '';
        this.cardNumber = '';
        this.cardExpiry = '';
        this.cardCvv = '';
        this.bank = '';
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
