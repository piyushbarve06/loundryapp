import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-timeslots',
    loadChildren: () => import('./pages/add-timeslots/add-timeslots.module').then(m => m.AddTimeslotsPageModule)
  },
  {
    path: 'app-pages',
    loadChildren: () => import('./pages/app-pages/app-pages.module').then(m => m.AppPagesPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesPageModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./pages/chats/chats.module').then(m => m.ChatsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then(m => m.ContactUsPageModule)
  },
  {
    path: 'earnings',
    loadChildren: () => import('./pages/earnings/earnings.module').then(m => m.EarningsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule)
  },
  {
    path: 'history-details',
    loadChildren: () => import('./pages/history-details/history-details.module').then(m => m.HistoryDetailsPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'inbox',
    loadChildren: () => import('./pages/inbox/inbox.module').then(m => m.InboxPageModule)
  },
  {
    path: 'languages',
    loadChildren: () => import('./pages/languages/languages.module').then(m => m.LanguagesPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'new-services',
    loadChildren: () => import('./pages/new-services/new-services.module').then(m => m.NewServicesPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'select-country',
    loadChildren: () => import('./pages/select-country/select-country.module').then(m => m.SelectCountryPageModule)
  },
  {
    path: 'select-driver',
    loadChildren: () => import('./pages/select-driver/select-driver.module').then(m => m.SelectDriverPageModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./pages/services/services.module').then(m => m.ServicesPageModule)
  },
  {
    path: 'store-categories',
    loadChildren: () => import('./pages/store-categories/store-categories.module').then(m => m.StoreCategoriesPageModule)
  },
  {
    path: 'sub-categories',
    loadChildren: () => import('./pages/sub-categories/sub-categories.module').then(m => m.SubCategoriesPageModule)
  },
  {
    path: 'timeslots',
    loadChildren: () => import('./pages/timeslots/timeslots.module').then(m => m.TimeslotsPageModule)
  },
  {
    path: 'verify',
    loadChildren: () => import('./pages/verify/verify.module').then(m => m.VerifyPageModule)
  },
  {
    path: 'verify-reset',
    loadChildren: () => import('./pages/verify-reset/verify-reset.module').then(m => m.VerifyResetPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
