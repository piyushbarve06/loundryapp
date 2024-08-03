import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EarningsPageRoutingModule } from './earnings-routing.module';

import { EarningsPage } from './earnings.page';
import { NgChartsModule } from 'ng2-charts';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EarningsPageRoutingModule,
    NgChartsModule
  ],
  declarations: [EarningsPage]
})
export class EarningsPageModule { }
