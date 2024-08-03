import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  constructor(
    public util: UtilService,
    public cart: CartService,
    public api: ApiService,
  ) {
  }

  ngOnInit() {
  }

  onBack() {
    this.util.onBack();
  }

  saveCartAction(index: any, item: any, action: any) {
    if (this.cart.cart[index].quantity == 0) {
      if (action == 'add') {
        this.addToCart(item, index);
      }
    } else if (this.cart.cart[index].quantity > 0 && action == 'add') {
      this.add(item, index);
    } else if (this.cart.cart[index].quantity > 0 && action == 'remove') {
      this.remove(item, index);
    }
  }

  add(product: any, index: any) {
    console.log(product);
    if (this.cart.cart[index].quantity > 0) {
      this.cart.cart[index].quantity = this.cart.cart[index].quantity + 1;
      this.cart.addQuantity(this.cart.cart[index].quantity, product.id);
    }
  }

  remove(product: any, index: any) {
    console.log(product, index);
    if (this.cart.cart[index].quantity == 1) {
      this.cart.cart[index].quantity = 0;
      this.cart.removeItem(product.id)
    } else {
      this.cart.cart[index].quantity = this.cart.cart[index].quantity - 1;
      this.cart.addQuantity(this.cart.cart[index].quantity, product.id);
    }
  }

  addToCart(item: any, index: any) {
    console.log(item);
    console.log('exist item and store id');
    if (this.cart.cart.length == 0) {
      this.cart.cart[index].quantity = 1;
      this.cart.addItem(item);
    } else if (this.cart.cart.length >= 0) {
      const service = this.cart.cart.filter(x => x.store_id != item.store_id);
      console.log(service);
      if (service && service.length) {
        this.cart.clearCartAlert().then((data: any) => {
          console.log(data);
          if (data && data == true) {
            this.cart.cart.forEach(element => {
              element.quantity = 0;
            });
          }
        });
      } else {
        this.cart.cart[index].quantity = 1;
        this.cart.addItem(item);
      }
    }
  }

  onCheckout() {
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      this.util.navigateToPage('checkout');
    } else {
      this.util.navigateRoot('login');
    }
  }

}
