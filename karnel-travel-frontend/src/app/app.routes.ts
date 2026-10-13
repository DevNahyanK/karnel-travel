import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CatalogListComponent } from './components/catalog-list/catalog-list.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog/:type', component: CatalogListComponent },
  { path: 'catalog/:type/:id', component: ItemDetailComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: '**', redirectTo: '' }
];
