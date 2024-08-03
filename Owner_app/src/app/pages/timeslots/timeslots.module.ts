import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimeslotsPageRoutingModule } from './timeslots-routing.module';

import { TimeslotsPage } from './timeslots.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimeslotsPageRoutingModule
  ],
  declarations: [TimeslotsPage]
})
export class TimeslotsPageModule {}
