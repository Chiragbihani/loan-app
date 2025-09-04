import { Component } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html'
})
export class ApplyLoanComponent {
  loan = { amount: '', type: '', userId: null, status: 'pending',tenure:'' ,dateTaken:''};
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


  constructor(private loanService: LoanService, private auth: AuthService) {}

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loan.userId = currentUser.id;

    this.loanService.applyLoan(this.loan).subscribe(() => {
      alert('Loan applied successfully! Pending approval.');
    });
  }
}
