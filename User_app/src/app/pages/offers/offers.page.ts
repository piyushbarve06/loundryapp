import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import * as moment from 'moment';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {

  apiCalled: boolean = false;
  list: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService,
    private modalController: ModalController,
    public cart: CartService
  ) {
    this.getOffers();
  }


  getOffers() {
    this.apiCalled = false;
    this.api.get_public('v1/offers/getActive').then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status == 200 && data.data && data.data.length) {
        const info = data.data;
        this.list = info;
      }
    }, error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  selected(item: any) {
    console.log(item);
    const min = parseFloat(item.min_cart_value);
    const freelancerId = item.freelancer_ids.split(',').map(Number);
    console.log(freelancerId);
    if (this.cart.totalPrice >= min) {
      if (freelancerId.includes(this.cart.cart[0].store_id)) {
        // this.cart.coupon = item;
        // this.cart.calcuate();
        // this.util.onBack();
        this.modalController.dismiss(item, 'ok');
        console.log('ok');
      } else {
        this.util.errorToast('This Coupon is not valid for your store', 'danger');
      }

    } else {
      console.log('not valid with minimum amout', min);
      this.util.showToast(this.util.translate('Sorry') + '\n' + this.util.translate('minimum cart value must be') + ' ' + min +
        ' ' + this.util.translate('or equal'), 'danger', 'bottom');
    }
  }

  getTime(time: any) {
    return moment(time).format('LLLL');
  }

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss('close', 'close');
  }

}
