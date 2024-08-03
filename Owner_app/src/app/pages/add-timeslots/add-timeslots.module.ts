import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddTimeslotsPageRoutingModule } from './add-timeslots-routing.module';

import { AddTimeslotsPage } from './add-timeslots.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddTimeslotsPageRoutingModule
  ],
  declarations: [AddTimeslotsPage]
})
export class AddTimeslotsPageModule {}
