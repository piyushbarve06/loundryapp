import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { forgot } from 'src/app/interfaces/forgot';
import { NgForm } from '@angular/forms';
import { password } from 'src/app/interfaces/password';
import { ModalController } from '@ionic/angular';
import { VerifyResetPage } from '../verify-reset/verify-reset.page';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  login: forgot = { email: '' };
  submitted = false;
  isLogin: boolean = false;
  newPassword: password = {
    password: '',
    confirm: ''
  }
  step: any = 1;
  temp: any = '';
  otpId: any = '';
  viewPassword: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private chMod: ChangeDetectorRef,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  changeType() {
    this.viewPassword = !this.viewPassword;
  }

  onLogin(form: NgForm) {
    console.log('form', form);
    this.submitted = true;
    this.chMod.detectChanges();
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      console.log('login');
      this.isLogin = true;

      this.api.post_public('v1/auth/verifyEmailForReset', this.login).then((data: any) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status && data.status == 200 && data.data) {
          this.otpId = data.otp_id;
          this.openVerificationModal(data.otp_id, this.login.email, this.login);
        } else if (data && data.status == 401 && data.error.error) {
          this.util.errorToast(data.error.error, 'danger');
        } else if (data && data.user && data.user.type != 'user') {
          this.util.errorToast(this.util.translate('Access denied'), 'danger');
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });

    }
  }

  async openVerificationModal(id: any, to: any, obj: any) {
    this.otpId = id;
    const modal = await this.modalController.create({
      component: VerifyResetPage,
      backdropDismiss: false,
      cssClass: 'custom-modal',
      componentProps: {
        'id': id,
        'to': to,
        'obj': obj
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data.data, data.role);
      if (data && data.data && data.role && data.role == 'ok') {
        this.submitted = false;
        this.temp = data.data.temp;
        console.log('temp token', this.temp);
        this.step = 2;
      }
    })
    return await modal.present();
  }

  resetPassword(form: NgForm) {
    console.log('form', form);
    this.submitted = true;
    this.chMod.detectChanges();
    if (form.valid) {
      if (this.newPassword.password != this.newPassword.confirm) {
        this.util.errorToast(this.util.translate('Password does not match'), 'danger');
        return false;
      }

      this.isLogin = true;

      // this.api.post_private('v1/password/updateUserPasswordWithEmail', { "email": this.login.email, "password": this.newPassword.password, "id": this.otpId }).then((data: any) => {
      const param = {
        id: this.otpId,
        email: this.login.email,
        password: this.newPassword.password
      };
      this.api.post_temp('v1/password/updateUserPasswordWithEmail', param, this.temp).then((data: any) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status && data.status == 200 && data.data) {
          this.util.showToast('Password Updated', 'success', 'bottom');
          this.util.onBack();
        } else if (data && data.status == 401 && data.error.error) {
          this.util.errorToast(data.error.error, 'danger');
        } else if (data && data.user && data.user.type != 'user') {
          this.util.errorToast(this.util.translate('Access denied'), 'danger');
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });
    }
  }

}
