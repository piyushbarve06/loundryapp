import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-stripe-card',
  templateUrl: './add-stripe-card.page.html',
  styleUrls: ['./add-stripe-card.page.scss'],
})
export class AddStripeCardPage implements OnInit {
  cnumber: any = '';
  cname: any = '';
  cvc: any = '';
  date: any = '';
  email: any = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }
  close(role: any) {
    this.modalController.dismiss('', role);
  }

  submit() {
    if (this.email === '' || this.cname === '' || this.cnumber === '' ||
      this.cvc === '' || this.date === '') {
      this.util.showToast(this.util.translate('All Fields are required'), 'danger', 'bottom');
      return false;
    }

    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(this.email))) {
      this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
      return false;
    }
    const year = this.date.split('-')[0];
    const month = this.date.split('-')[1];
    //
    if (this.util.userInfo && this.util.userInfo.stripe_key && this.util.userInfo.stripe_key !== '') {
      console.log('add new card');
      const param = {
        'number': this.cnumber,
        'exp_month': month,
        'exp_year': year,
        'cvc': this.cvc,
        'email': this.email
      };
      this.util.show();
      this.api.post_private('v1/payments/createStripeToken', param).then((data: any) => {
        console.log(data);
        if (data && data.status === 200 && data.success && data.success.id && data.success.card && data.success.card.id) {
          const customerParam = {
            token: data.success.id,
            id: this.util.userInfo.stripe_key
          }
          this.api.post_private('v1/payments/addStripeCards', customerParam).then((data: any) => {
            console.log('new card  response', data);
            this.util.hide();
            if (data && data.status && data.status === 200 && data.success && data.success.id) {
              this.close('done');
            } else {
              this.util.errorToast(this.util.translate('Something went wrong, please contact administrator!'));
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          }).catch(error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          });
        } else {
          this.util.hide();
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else {
      console.log('create new customer');
      const param = {
        'number': this.cnumber,
        'exp_month': month,
        'exp_year': year,
        'cvc': this.cvc,
        'email': this.email
      };
      this.util.show();
      this.api.post_private('v1/payments/createStripeToken', param).then((data: any) => {
        console.log(data);
        if (data && data.status === 200 && data.success && data.success.id && data.success.card && data.success.card.id) {
          const customerParam = {
            source: data.success.id,
            email: this.email
          }
          this.api.post_private('v1/payments/createCustomer', customerParam).then((data: any) => {
            console.log('customer response', data);
            this.util.hide();
            if (data && data.status && data.status === 200 && data.success && data.success.id) {
              this.updateProfile(data.success.id);
            } else {
              this.util.errorToast(this.util.translate('Something went wrong, please contact administrator!'));
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          }).catch(error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          });
        } else {
          this.util.hide();
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    }
  }

  updateProfile(key: any) {
    const param = {
      id: localStorage.getItem('uid'),
      stripe_key: key
    };
    this.util.show(this.util.translate('Saving Informations'));
    this.api.post_private('v1/profile/update', param).then((data: any) => {
      console.log(data);
      const param = {
        id: localStorage.getItem('uid')
      }
      this.api.post_private('v1/profile/getProfile', param).then((data: any) => {
        console.log(data);
        this.util.hide();
        if (data && data.status === 200 && data.data) {
          if (data.data.status === 1) {
            this.util.userInfo = data.data;
          }
        }
        this.close('done');
      }, error => {
        this.util.hide();
        console.log(error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        console.log(error);
        this.util.apiErrorHandler(error);
      })
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }



  getMaxDate(): string {
    return moment().add('50', 'years').format('YYYY-MM-DD');
  }

  minStartDate(): string {
    return moment().format('YYYY-MM-DD');
  }

}
