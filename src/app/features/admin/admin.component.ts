import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthStore } from 'src/app/store/auth.store';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  userEmail: string = '';
  roles: string[] = [];
  activeTab: 'products' | 'categories' | 'orders' | 'users' = 'products';

  constructor(
    private authService: AuthService,
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const authState = this.authStore.getAuthValue();
    this.userEmail = authState.email || '';
    this.roles = authState.roles;

    if (!this.roles.includes('Admin')) {
      console.warn('Non-admin user attempted to access admin page');
      this.router.navigate(['/products']);
      return;
    }

    // Check for tab query parameter
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'] as
          | 'products'
          | 'categories'
          | 'orders'
          | 'users';
        if (['products', 'categories', 'orders', 'users'].includes(tab)) {
          this.activeTab = tab;
        }
      }
    });
  }

  switchTab(tab: 'products' | 'categories' | 'orders' | 'users'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
