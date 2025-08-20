import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

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
      next: () => {
        alert('Login successful!');
        this.router.navigate(['/home']);
      },
      error: () => alert('Invalid email or password!')
    });
  }
}
