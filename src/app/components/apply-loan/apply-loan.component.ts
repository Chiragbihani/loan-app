import { Component } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';

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

  constructor(private loanService: LoanService, private auth: AuthService) {}

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loan.userId = currentUser.id;

    this.loanService.applyLoan(this.loan).subscribe({
      next: () => {
        Swal.fire({
          title: 'Application Submitted',
          html: `
            <p>Your loan request has been received and is currently <b>pending approval</b>.</p>
          `,
          icon: 'info',
          showConfirmButton: true,
          confirmButtonText: 'Okay',
          confirmButtonColor: '#3498db',
          background: '#f9fbfd',
          color: '#2c3e50'
        });

        // reset form
        this.loan = { amount: '', type: '', userId: currentUser.id, status: 'pending', tenure: '', dateTaken: this.today };
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong while applying for the loan. Please try again later.',
          icon: 'error',
          confirmButtonText: 'Close',
          confirmButtonColor: '#d33'
        });
        console.error('Loan apply error:', err);
      }
    });
  }
}
