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

import { SendMailRoutingModule } from './send-mail-routing.module';
import { SendMailComponent } from './send-mail.component';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [
    SendMailComponent
  ],
  imports: [
    CommonModule,
    SendMailRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    CKEditorModule
  ]
})
export class SendMailModule { }
