import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-manager-users',
  templateUrl: './manager-users.html',
  styleUrls: ['./manager-users.css'],
  standalone:false
}) 
export class ManagerUsersComponent implements OnInit {

  users: any[] = [];             // raw from backend
  filteredUsers: any[] = [];     // after search + filter
  paginatedUsers: any[] = [];    // current page slice

  skeletonArray = Array(6).fill(0);

  searchTerm: string = "";
  filterOption: string = "ALL";
  sortOption: string = "A-Z"; // 'A-Z' | 'Z-A' | 'NEWEST' | 'OLDEST'

  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  showPopup = false;
  selectedUser: any = null;

  base = environment.apiBase;
  loading = true;

  // page change animation flag
  pageAnimating = false;

  // showAll toggle - displays all users on one scrollable page
  showAll = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const email = this.auth.getUserFromToken()?.sub;

    // fetch manager -> users
    this.http.get<any>(`${this.base}/managers/by-email/${email}`).subscribe({
      next: manager => {
        this.http.get<any[]>(`${this.base}/managers/${manager.id}/users`).subscribe({
          next: (res) => {
            this.users = Array.isArray(res) ? res.map(u => ({ ...u })) : [];
            this.filteredUsers = [...this.users];
            this.applyAllTransforms();
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  /* SEARCH / FILTER / SORT flow */
  public onSearchChange(): void { this.applyAllTransforms(); }
  public onFilterChange(): void { this.applyAllTransforms(); }
  public onSortChange(): void { this.applyAllTransforms(); }

  public onShowAllChange(): void {
    // when showAll toggled, update itemsPerPage to show all or revert to default
    if (this.showAll) {
      this.itemsPerPage = Math.max(1, this.filteredUsers.length || this.users.length);
    } else {
      this.itemsPerPage = 6;
    }
    this.updatePagination();
  }

  public applyAllTransforms(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();
    this.filteredUsers = (this.users || []).filter(u => {
      const full = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
      const matchesSearch = !term || full.includes(term);

      let matchesAlpha = true;
      const first = ((u.firstName || '').charAt(0) || '').toUpperCase();
      if (this.filterOption === 'A-M') matchesAlpha = first >= 'A' && first <= 'M';
      if (this.filterOption === 'N-Z') matchesAlpha = first >= 'N' && first <= 'Z';

      return matchesSearch && matchesAlpha;
    });

    this.applySorting();

    // if showAll is active, grow itemsPerPage to filtered length
    if (this.showAll) {
      this.itemsPerPage = Math.max(1, this.filteredUsers.length);
    } else {
      this.itemsPerPage = 6;
    }

    this.updatePagination();
  }

  public applySorting(): void {
    const opt = this.sortOption;
    if (!this.filteredUsers) return;

    if (opt === 'A-Z') {
      this.filteredUsers.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    } else if (opt === 'Z-A') {
      this.filteredUsers.sort((a, b) => (b.firstName || '').localeCompare(a.firstName || ''));
    } else if (opt === 'NEWEST') {
      this.filteredUsers.sort((a, b) => {
        const ta = new Date(a.joinedDate || a.id || 0).getTime();
        const tb = new Date(b.joinedDate || b.id || 0).getTime();
        return tb - ta;
      });
    } else if (opt === 'OLDEST') {
      this.filteredUsers.sort((a, b) => {
        const ta = new Date(a.joinedDate || a.id || 0).getTime();
        const tb = new Date(b.joinedDate || b.id || 0).getTime();
        return ta - tb;
      });
    }
  }

  /* PAGINATION */
  public updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil((this.filteredUsers || []).length / this.itemsPerPage));
    this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);
    this.paginate();
  }

  public paginate(): void {
    this.pageAnimating = true;
    setTimeout(() => {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      this.paginatedUsers = (this.filteredUsers || []).slice(start, start + this.itemsPerPage);
      this.pageAnimating = false;
    }, 120);
  }

  public nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.paginate(); } }
  public prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.paginate(); } }
  public goToPage(n: number): void { if (n >= 1 && n <= this.totalPages) { this.currentPage = n; this.paginate(); } }

 public pagesArray(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  /* POPUP */
  public openPopup(user: any): void {
    this.selectedUser = { ...user };
    this.showPopup = true;
  }

  public closePopup(): void {
    this.showPopup = false;
    this.selectedUser = null;
  }

  /* BUTTON ACTIONS */
  public viewUser(u: any): void { this.openPopup(u); }

  public editUser(u: any): void {
    alert(`Edit action for: ${u?.firstName || u?.id}`);
  }

  public removeUser(u: any): void {
    const confirmRemove = confirm(`Remove ${u?.firstName || 'this user'}?`);
    if (!confirmRemove) return;

    this.users = (this.users || []).filter(x => x.id !== u.id);
    this.applyAllTransforms();

    if (this.selectedUser && this.selectedUser.id === u.id) {
      this.closePopup();
    }
  }

  /* HELPERS */
  public initials(u: any): string {
    if (!u) return '';
    const first = u.firstName || '';
    const last = u.lastName || '';
    if (first && first.length) return first.charAt(0).toUpperCase();
    if (last && last.length) return last.charAt(0).toUpperCase();
    if (u.email && u.email.length) return u.email.charAt(0).toUpperCase();
    return '?';
  }

  public formatDate(value: any): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  }
}

