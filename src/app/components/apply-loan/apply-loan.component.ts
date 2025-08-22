import { Component } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html'
})
export class ApplyLoanComponent {
  loan = { amount: '', type: '', userId: null, status: 'pending' };

  constructor(private loanService: LoanService, private auth: AuthService) {}

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loan.userId = currentUser.id;

    this.loanService.applyLoan(this.loan).subscribe(() => {
      alert('Loan applied successfully! Pending approval.');
    });
  }
}
