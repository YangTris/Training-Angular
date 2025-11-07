import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthStore } from 'src/app/store/auth.store';

const VALID_TABS = ['products', 'categories', 'orders', 'users'] as const;
type AdminTab = (typeof VALID_TABS)[number];

function isValidTab(tab: string): tab is AdminTab {
  return VALID_TABS.includes(tab as AdminTab);
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  userEmail: string = '';
  roles: string[] = [];
  activeTab: AdminTab = 'products';

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

    this.route.queryParams.subscribe((params) => {
      const tabParam = params['tab'];
      if (isValidTab(tabParam)) {
        this.activeTab = tabParam;
      }
    });
  }

  switchTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}