import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (user) => {
        Swal.fire({
          title: `Welcome ${user.fullName || 'User'} 👋`,
          text: 'Login successful!',
          icon: 'success',
          confirmButtonText: 'Continue',
          background: '#f9f9f9',
          color: '#333',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user-loans']);
          }
        });
      },
      error: () => {
        Swal.fire({
          title: 'Login Failed ❌',
          text: 'Invalid email or password!',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
