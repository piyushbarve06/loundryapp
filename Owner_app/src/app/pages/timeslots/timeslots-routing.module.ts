import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimeslotsPage } from './timeslots.page';

const routes: Routes = [
  {
    path: '',
    component: TimeslotsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeslotsPageRoutingModule {}
