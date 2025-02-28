/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Washing Wala Full App Ionic 6 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportsRoutingModule } from './supports-routing.module';
import { SupportsComponent } from './supports.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    SupportsComponent
  ],
  imports: [
    CommonModule,
    SupportsRoutingModule,
    NgxSpinnerModule,
    NgxSkeletonLoaderModule,
    FormsModule
  ]
})
export class SupportsModule { }
