import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = { fullName: '', email: '', password: '', phone: '', role: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.user['role'] = 'user';  // default role
    this.authService.register(this.user).subscribe({
      next: () => {
        Swal.fire({
          title: '🎉 Welcome Aboard! 🎉',
          html: `
            <h3 style="color:#2ecc71;">Hi ${this.user.fullName || 'User'},</h3>
            <p>You’ve successfully registered. Let’s get started 🚀</p>
          `,
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Proceed to Login',
          confirmButtonColor: '#27ae60',
          background: '#f0f9f4',
          color: '#2c3e50'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Oops! 😢',
          text: 'Something went wrong during registration.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      }
    });
  }
}
