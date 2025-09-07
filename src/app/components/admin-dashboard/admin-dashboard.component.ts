import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  pendingLoans: any[] = [];
  approvedLoans: any[] = [];
  rejectedLoans: any[] = [];
  repaidLoans: any[] = []; // ✅ fully paid loans
  users: any[] = [];
  activeTab: 'pending' | 'approved' | 'rejected' | 'repaid'|'' = '';
  fundsChart: any;
  collectedChart: any;
  repayments: any[] = [];


  // private fundsChart: Chart | null = null;
  // private collectedChart: Chart | null = null;

  constructor(private loanService: LoanService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchLoans();
    this.fetchUsers();
  }

  ngAfterViewInit() {
    // initial empty render
    this.loadFundsChart();
    this.loadCollectedChart();
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(res => {
      this.users = res;
    });
  }
  loadLoans() {
  this.loanService.getAllLoans().subscribe(res => {
    this.approvedLoans = res.filter(l => l.status === 'approved');
    this.repaidLoans = res.filter(l => l.status === 'repaid'); // ✅ fully paid tab
  });
}


  fetchLoans() {
    this.loanService.getAllLoans().subscribe(res => {
      this.pendingLoans = res.filter(l => l.status === 'pending');
      this.approvedLoans = res.filter(l => l.status === 'approved');
      this.rejectedLoans = res.filter(l => l.status === 'rejected');
      this.repaidLoans = res.filter(l => l.status === 'repaid'); // ✅ fully paid tab

      // refresh charts when data updates
      this.loadFundsChart();
      this.loadCollectedChart();
    });
  }
  loadRepayments() {
    this.loanService.getAllRepayments().subscribe(data => {
      this.repayments = data;
    });
  }


  updateStatus(id: number, status: string) {
    this.loanService.updateLoanStatus(id, status).subscribe(() => {
      this.fetchLoans();
    });
  }

  getUserName(userId: string): string {
    const user = this.users?.find(u => u.id === userId);
    return user ? user.fullName : 'Unknown';
  }

  loadFundsChart() {
  if (this.fundsChart) this.fundsChart.destroy(); // destroy old chart

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = new Array(12).fill(0);

  this.approvedLoans.forEach(loan => {
    const loanDate = new Date(loan.date || new Date());
    const monthIndex = loanDate.getMonth();
    monthlyData[monthIndex] += loan.amount;
  });

  this.fundsChart = new Chart("fundsChart", {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: "Funds Disbursed",
        data: monthlyData,
        borderColor: "#f39c12",
        backgroundColor: "rgba(243, 156, 18, 0.2)",
        fill: true,
        tension: 0.3
      }]
    }
  });
}

loadCollectedChart() {
  if (this.collectedChart) this.collectedChart.destroy(); // destroy old chart

  const collected = this.approvedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const pending = this.pendingLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const repaid = this.repaidLoans.reduce((sum, loan) => sum + loan.amount, 0); // ✅ fully paid loans
  const remaining = pending;

  this.collectedChart = new Chart("collectedChart", {
    type: 'doughnut',
    data: {
      labels: ["Approved", "Pending","Repaid"],
      datasets: [{
        data: [collected, remaining, repaid], // ✅ include repaid
        backgroundColor: ["#27ae60", "#c0392b","#2980b9"],
        hoverBackgroundColor: ["#2ecc71", "#e74c3c","#3498db"],
        borderColor: "#fff",
        borderWidth: 1
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

}
