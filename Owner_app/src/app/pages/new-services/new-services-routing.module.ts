import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewServicesPage } from './new-services.page';

const routes: Routes = [
  {
    path: '',
    component: NewServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewServicesPageRoutingModule {}
