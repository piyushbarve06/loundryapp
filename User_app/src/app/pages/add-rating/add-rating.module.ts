import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRatingPageRoutingModule } from './add-rating-routing.module';

import { AddRatingPage } from './add-rating.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRatingPageRoutingModule,
  ],
  declarations: [AddRatingPage]
})
export class AddRatingPageModule { }
