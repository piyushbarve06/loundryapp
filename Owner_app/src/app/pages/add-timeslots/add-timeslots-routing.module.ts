import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddTimeslotsPage } from './add-timeslots.page';

const routes: Routes = [
  {
    path: '',
    component: AddTimeslotsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddTimeslotsPageRoutingModule {}
