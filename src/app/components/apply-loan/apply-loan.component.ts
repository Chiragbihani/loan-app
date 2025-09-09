import { Component } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-apply-loan',
  templateUrl: './apply-loan.component.html'
})
export class ApplyLoanComponent {
  today: string = new Date().toISOString().split('T')[0];
  loan = { amount: '', type: '', userId: null, status: 'pending', tenure: '', dateTaken: this.today };

  constructor(
    private loanService: LoanService,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.loan.userId = currentUser.id;

    this.loanService.applyLoan(this.loan).subscribe({
      next: () => {
        Swal.fire({
          title: 'Application Submitted',
          html: `<p>Your loan request has been received and is currently <b>pending approval</b>.</p>`,
          icon: 'info',
          confirmButtonText: 'Okay',
          confirmButtonColor: '#3498db'
        });

        // 🔔 Notify admin
        this.notificationService.pushNotification({
          id: Date.now().toString(),
          role: 'admin',
          message: `${currentUser.fullName} applied for a new loan of ₹${this.loan.amount}`,
          read: false,
          timestamp: new Date(),
          userId: currentUser.id
        }).subscribe();

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
