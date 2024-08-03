import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddStripeCardPageRoutingModule } from './add-stripe-card-routing.module';

import { AddStripeCardPage } from './add-stripe-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddStripeCardPageRoutingModule
  ],
  declarations: [AddStripeCardPage]
})
export class AddStripeCardPageModule {}
