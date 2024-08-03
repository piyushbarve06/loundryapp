import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectDriverPageRoutingModule } from './select-driver-routing.module';

import { SelectDriverPage } from './select-driver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectDriverPageRoutingModule
  ],
  declarations: [SelectDriverPage]
})
export class SelectDriverPageModule {}
