import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewServicesPageRoutingModule } from './new-services-routing.module';

import { NewServicesPage } from './new-services.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewServicesPageRoutingModule
  ],
  declarations: [NewServicesPage]
})
export class NewServicesPageModule {}
