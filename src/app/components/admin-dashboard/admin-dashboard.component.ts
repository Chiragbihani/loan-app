import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoanService } from '../../service/loan.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  pendingLoans: any[] = [];
  approvedLoans: any[] = [];
  rejectedLoans: any[] = [];
  repaidLoans: any[] = []; // ✅ fully paid loans
  users: any[] = [];
  activeTab: 'pending' | 'approved' | 'rejected' | 'repaid' | '' = '';
  fundsChart: any;
  collectedChart: any;
  repayments: any[] = [];

  // private fundsChart: Chart | null = null;
  // private collectedChart: Chart | null = null;

  constructor(private loanService: LoanService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchLoans();
    this.fetchUsers();
    this.loadRepayments();
  }

  ngAfterViewInit() {
    // initial empty render
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe((res) => {
      this.users = res;
    });
  }
  loadLoans() {
    this.loanService.getAllLoans().subscribe((res) => {
      this.approvedLoans = res.filter((l) => l.status === 'approved');
      this.repaidLoans = res.filter((l) => l.status === 'repaid'); // ✅ fully paid tab
    });
  }

  fetchLoans() {
    this.loanService.getAllLoans().subscribe((res) => {
      this.pendingLoans = res.filter((l) => l.status === 'pending');
      this.approvedLoans = res.filter((l) => l.status === 'approved');
      this.rejectedLoans = res.filter((l) => l.status === 'rejected');
      this.repaidLoans = res.filter((l) => l.status === 'repaid'); // ✅ fully paid tab

      // refresh charts when data updates
      this.loadFundsChart();
      this.loadCollectedChart();
    });
  }
  loadRepayments() {
    this.loanService.getAllRepayments().subscribe((data) => {
      this.repayments = data;
      this.loadCollectedChart();
      this.loadFundsChart(); // Refresh chart with repayment data
    });
  }

  updateStatus(id: number, status: string) {
    this.loanService.updateLoanStatus(id, status).subscribe(() => {
      this.fetchLoans();
    });
  }

  getUserName(userId: string): string {
    const user = this.users?.find((u) => u.id === userId);
    return user ? user.fullName : 'Unknown';
  }
  getRepaidAmount(loanId: number): number {
    const loanRepayments = this.repayments.filter((r) => r.loanId === loanId);
    return loanRepayments.reduce((sum, r) => sum + r.amount, 0);
  }

  loadFundsChart() {
    if (this.fundsChart) this.fundsChart.destroy(); // destroy old chart

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyDisbursed = new Array(12).fill(0);
    const monthlyReimbursed = new Array(12).fill(0);

    // ✅ Loan disbursal by month
    this.approvedLoans.forEach((loan) => {
      const loanDate = new Date(loan.date || new Date());
      const monthIndex = loanDate.getMonth();
      monthlyDisbursed[monthIndex] += loan.amount;
    });

    // ✅ Repayments by month
    this.repayments.forEach((r) => {
      const repayDate = new Date(r.date || new Date());
      const monthIndex = repayDate.getMonth();
      monthlyReimbursed[monthIndex] += r.amount;
    });

    this.fundsChart = new Chart('fundsChart', {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Funds Disbursed',
            data: monthlyDisbursed,
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.2)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Funds Reimbursed',
            data: monthlyReimbursed,
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  loadCollectedChart() {
    if (this.collectedChart) this.collectedChart.destroy(); // destroy old chart

    const collected = this.approvedLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );
    const pending = this.pendingLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );
    const repaid = this.repayments.reduce((sum, r) => sum + r.amount, 0); // ✅ fully paid loans
    const remaining = pending;

    this.collectedChart = new Chart('collectedChart', {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Repaid'],
        datasets: [
          {
            data: [collected, remaining, repaid], // ✅ include repaid
            backgroundColor: ['#2980b9', '#f39c12', '#27ae60'],
            hoverBackgroundColor: ['#3498db', '#f39c12', '#2ecc71'],
            borderColor: '#fff',
            borderWidth: 1,
          },
        ],
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
  async downloadReport() {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Title

    pdf.setFontSize(18);
    pdf.text('Loan Management Report', 105, 15, { align: 'center' }); // Loan Summary

    pdf.setFontSize(12);
    pdf.text(`Pending Loans: ${this.pendingLoans.length}`, 10, 30);
    pdf.text(`Approved Loans: ${this.approvedLoans.length}`, 10, 38);
    pdf.text(`Rejected Loans: ${this.rejectedLoans.length}`, 10, 46);
    pdf.text(`Repaid Loans: ${this.repaidLoans.length}`, 10, 54); // Add Charts

    const fundsChartElement = document.getElementById(
      'fundsChart'
    ) as HTMLCanvasElement;
    if (fundsChartElement) {
      const canvasImg = await html2canvas(fundsChartElement);
      const imgData = canvasImg.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 70, 180, 80);
    }
    const collectedChartElement = document.getElementById(
      'collectedChart'
    ) as HTMLCanvasElement;
    if (collectedChartElement) {
      const canvasImg = await html2canvas(collectedChartElement);
      const imgData = canvasImg.toDataURL('image/png');
      pdf.addPage();
      pdf.text('Collected vs Repaid Overview', 105, 15, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 20, 30, 170, 120);
    } // Add Loan Tables (Pending, Approved, Rejected, Repaid)

    const sections = [
      { id: 'pendingLoans', title: 'Pending Loans' },
      { id: 'approvedLoans', title: 'Approved Loans' },
      { id: 'rejectedLoans', title: 'Rejected Loans' },
      { id: 'repaidLoans', title: 'Repaid Loans' },
    ];

    for (const section of sections) {
      this.activeTab = section.id.replace('Loans', '') as any; // Set activeTab to ensure correct table is visible
      await new Promise((r) => setTimeout(r, 100)); // Wait for DOM to update
      const tableElement = document.getElementById(section.id);
      if (tableElement) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text(section.title, 105, 15, { align: 'center' });
        const tableImg = await html2canvas(tableElement);
        const imgData = tableImg.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 30, 190, 0); // auto height
      }
    } // Save PDF

    pdf.save('loan-report.pdf');
  }
}
