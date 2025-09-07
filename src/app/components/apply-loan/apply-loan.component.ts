import { Component } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html'
})
export class ApplyLoanComponent {
  today: string = new Date().toISOString().split('T')[0];
  loan = { amount: '', type: '', userId: null, status: 'pending', tenure: '', dateTaken: this.today };

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

  successMessage: string | null = null;

  constructor(private loanService: LoanService, private auth: AuthService) {}

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loan.userId = currentUser.id;

    this.loanService.applyLoan(this.loan).subscribe({
      next: () => {
        this.successMessage = 'Loan applied successfully! Pending approval.';
        this.loan = { amount: '', type: '', userId: currentUser.id, status: 'pending', tenure: '', dateTaken: '' };

        // Auto-hide message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Loan apply error:', err);
      }
    });
  }
}
