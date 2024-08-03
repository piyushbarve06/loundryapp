import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from './api.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public cart: any[] = [];
  public itemId: any[] = [];
  public discount: any = 0;
  public grandTotal: any = 0;
  public totalPrice: any = 0;
  public totalItemInCart: any = 0;
  public serviceTax: any = 0;
  public coupon: any;
  public deliveryAt: any = 'home';
  public walletDiscount: any = 0;
  public deliveryAddress: any;
  public deliveryPrice: any = 0;
  constructor(
    public util: UtilService,
    public api: ApiService,
    public alertCtrl: AlertController
  ) {

    console.log('service tax => ', this.serviceTax);
    this.util.getKeys('cart').then((data: any) => {
      if (data && data !== null && data !== 'null') {
        const userCart = JSON.parse(data);
        if (userCart && userCart.length > 0) {
          this.cart = userCart;
          this.itemId = [...new Set(this.cart.map(item => item.id))];
          this.calcuate();
        } else {
          this.calcuate();
        }
      } else {
        this.calcuate();
      }
    });
  }

  clearCartAlert(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const alert = await this.alertCtrl.create({
        header: this.util.translate('Warning'),
        message: this.util.translate("You already have item's in cart with different laundry store"),
        buttons: [
          {
            text: this.util.translate('Cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel: blah');
              resolve(false);
            }
          }, {
            text: this.util.translate('Clear Cart'),
            handler: () => {
              console.log('Confirm Okay');
              this.clearCart();
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  checkProductInCart(id: any) {
    return this.itemId.includes(id);
  }

  clearCart() {
    this.cart = [];
    this.itemId = [];
    this.totalPrice = 0;
    this.grandTotal = 0;
    this.discount = 0;
    this.coupon = null;
    this.walletDiscount = 0;
    this.deliveryPrice = 0;
    this.deliveryAt = 'home';
    this.util.clearKeys('cart');
  }

  addItem(item: any) {
    console.log('item to adde', item);
    this.cart.push(item);
    this.itemId.push(item.id);
    this.calcuate();
  }

  addQuantity(quantity: any, id: any) {
    console.log('iddd-->>', id);
    console.log('quantity', quantity);
    if (quantity < 0) {
      console.log('wrong input', quantity);
      this.removeItem(id);
      return false;
    }
    this.cart.forEach(element => {
      if (element.id == id) {
        element.quantity = quantity;
      }
    });
    this.calcuate();
  }

  removeItem(id: any) {
    console.log('remove this item from cart');
    console.log('current cart items', this.cart);
    this.cart = this.cart.filter(x => x.id !== id);
    this.itemId = this.itemId.filter(x => x !== id);

    console.log('===>>>>>>>>>', this.cart);
    console.log('items===>>>', this.itemId);
    this.calcuate();
  }

  calcuate() {
    console.log('cart==>', this.cart);
    let total = 0;
    this.totalItemInCart = 0;
    this.cart.forEach(element => {
      if (element && element.discount > 0) {
        total = total + (parseFloat(element.sell_price) * element.quantity);
      } else {
        total = total + (parseFloat(element.original_price) * element.quantity);
      }
      this.totalItemInCart = this.totalItemInCart + element.quantity;
    });
    console.log('total->', total);
    this.totalPrice = total;
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    console.log(this.totalItemInCart);
    if (this.coupon && this.coupon.name) {
      if (this.coupon && this.coupon.type == 0) {
        console.log('per');
        function percentage(num: any, per: any) {
          return (num / 100) * per;
        }
        const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), parseFloat(this.coupon.discount));
        console.log('========>>>>>>>>>>>>>>>', totalPrice);
        this.discount = totalPrice.toFixed(2);
      } else {
        console.log('flat');
        this.discount = this.coupon.discount;
      }
    }
    this.util.clearKeys('cart');
    this.util.setKeys('cart', JSON.stringify(this.cart));

    // this.grandTotal = (parseFloat(this.totalPrice) + parseFloat(this.serviceTax)).toFixed(2);
    this.grandTotal = (this.totalPrice - parseFloat(this.discount)) + parseFloat(this.serviceTax) + parseFloat(this.deliveryPrice);
    this.grandTotal = parseFloat(this.grandTotal).toFixed(2);

    if (this.grandTotal <= this.walletDiscount) {
      this.walletDiscount = this.grandTotal;
      this.grandTotal = this.grandTotal - this.walletDiscount;
    } else {
      this.grandTotal = this.grandTotal - this.walletDiscount;
    }

    this.grandTotal = parseFloat(this.grandTotal).toFixed(2);
  }
}
