import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddStripeCardPage } from './add-stripe-card.page';

const routes: Routes = [
  {
    path: '',
    component: AddStripeCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddStripeCardPageRoutingModule {}
