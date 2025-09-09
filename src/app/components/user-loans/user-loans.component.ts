import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { NotificationService } from '../../service/notification.service';
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
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  userId:string='';

  constructor(private loanService: LoanService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadLoans();
    this.loadUserNotifications();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;
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

      // 🔔 Notify admin
      const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
      this.notificationService.pushNotification({
        id: Date.now().toString(),
        role: 'admin',
        message: `${currentUser.fullName} applied for a new loan of ₹${this.newLoan.amount}`,
        read: false,
        timestamp: new Date(),
        userId: currentUser.id
      }).subscribe();

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

          // 🔔 Notify admin
          const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
          this.notificationService.pushNotification({
            id: Date.now().toString(),
            role: 'admin',
            message: `${currentUser.fullName} cancelled loan #${id}`,
            read: false,
            timestamp: new Date(),
            userId: currentUser.id
          }).subscribe();

          this.loadLoans();
        });
      }
    });
  }
  loadUserNotifications() {
    this.notificationService.getNotifications('user', this.userId).subscribe(res => {
      this.notifications = res;
      this.unreadCount = res.filter(n => !n.read).length;
    });
  }
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.updateUnreadCount(); // reduce count after opening
    }
  }

  markAsRead(notification: any) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.updateUnreadCount();
      });
    }
  }
  clearAllNotifications() {
    this.notifications.forEach(n => {
      if (!n.read) {
        this.notificationService.markAsRead(n.id).subscribe(() => {
          n.read = true;
          this.updateUnreadCount();
        });
      }
    });
  }
  
  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    });
  }
  

  calculateRepayment(loan: any): number {
    const rate = 10;
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
