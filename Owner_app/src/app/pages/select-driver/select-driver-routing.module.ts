import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectDriverPage } from './select-driver.page';

const routes: Routes = [
  {
    path: '',
    component: SelectDriverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectDriverPageRoutingModule {}
