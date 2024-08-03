import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { CartService } from 'src/app/services/cart.service';
import { AddStripeCardPage } from '../add-stripe-card/add-stripe-card.page';

@Component({
  selector: 'app-stripe-pay',
  templateUrl: './stripe-pay.page.html',
  styleUrls: ['./stripe-pay.page.scss'],
})
export class StripePayPage implements OnInit {
  cards: any[] = [];
  dummyCards: any[] = [];
  token: any;
  currency_code: any = '';
  constructor(
    private navParam: NavParams,
    private modalController: ModalController,
    public api: ApiService,
    public util: UtilService,
    public cart: CartService
  ) {
    this.currency_code = this.navParam.get('currency_code');
    console.log('currency_code=>', this.currency_code);
    this.checkStripeKeys();
  }

  ngOnInit() {
  }
  close(key: any, role: any) {
    this.modalController.dismiss(key, role);
  }

  getStripeCards() {
    console.log('get cards');
    this.dummyCards = Array(5);
    const param = {
      id: this.util.userInfo.stripe_key
    }
    this.cards = [];
    this.api.post_private('v1/payments/getStripeCards', param).then((data: any) => {
      console.log(data);
      this.dummyCards = [];
      if (data && data.status && data.status === 200 && data.success && data.success.data && data.success.data.length) {
        this.cards = data.success.data;
        this.token = this.cards[0].id;
      }
    }, error => {
      this.dummyCards = [];
      console.log(error);
      this.cards = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.dummyCards = [];
      console.log(error);
      this.cards = [];
      this.util.apiErrorHandler(error);
    });
  }

  checkStripeKeys() {
    if (this.util.userInfo && this.util.userInfo.stripe_key && this.util.userInfo.stripe_key !== '') {
      this.getStripeCards();
    }
  }
  changeMethod(id: any) {
    this.token = id;
  }

  payment() {
    if (this.token && this.token != null) {
      const param = {
        amount: parseInt(this.cart.grandTotal) * 100,
        currency: this.currency_code && this.currency_code !== null && this.currency_code !== '' ? this.currency_code : 'USD',
        customer: this.util.userInfo.stripe_key,
        card: this.token
      };
      this.util.show(this.util.translate('Processing..'))
      this.api.post_private('v1/payments/createStripePayments', param).then((data: any) => {
        console.log(data);
        this.util.hide();
        if (data && data.status && data.status === 200 && data.success && data.success.id) {
          this.close(JSON.stringify(data.success), 'done');
        }
      }, (error) => {
        this.util.hide();
        console.log(error);
        this.util.hide();
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.showErrorAlert(error.error.error.message);
          return false;
        }
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.util.hide();
        console.log(error);
        this.util.hide();
        if (error && error.error && error.error.error && error.error.error.message) {
          this.util.showErrorAlert(error.error.error.message);
          return false;
        }
        this.util.apiErrorHandler(error);
      });
    }
  }

  async addNewCards() {
    const modal = await this.modalController.create({
      component: AddStripeCardPage,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      this.checkStripeKeys();
    });
    await modal.present();
  }

}
