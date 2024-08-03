import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedeemSuccessPage } from './redeem-success.page';

const routes: Routes = [
  {
    path: '',
    component: RedeemSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedeemSuccessPageRoutingModule {}
