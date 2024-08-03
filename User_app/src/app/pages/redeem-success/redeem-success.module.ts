import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedeemSuccessPageRoutingModule } from './redeem-success-routing.module';

import { RedeemSuccessPage } from './redeem-success.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RedeemSuccessPageRoutingModule
  ],
  declarations: [RedeemSuccessPage]
})
export class RedeemSuccessPageModule {}
