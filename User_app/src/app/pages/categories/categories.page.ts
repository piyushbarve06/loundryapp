import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  cateId: any = '';
  storeId: any = '';
  categories: any[] = [];

  selectedCateId: any = '';

  apiCalled: boolean = false;
  services: any[] = [];
  constructor(
    public util: UtilService,
    public route: ActivatedRoute,
    public api: ApiService,
    public cart: CartService
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.cate_id && data.store_id) {
        this.cateId = data.cate_id;
        this.storeId = data.store_id;
        this.getSubCategories();
      }
    });
  }

  getSubCategories() {
    this.api.post_public('v1/sub_categories/userCategories', { "id": this.cateId }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.categories = data.data;
        if (this.categories && this.categories.length) {
          this.selectedCateId = this.categories[0].id;
          this.getServices();
        }
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  getServices() {
    this.services = [];
    this.apiCalled = false;
    this.api.post_public('v1/services/getStoreService', { "id": this.selectedCateId, "uid": this.storeId, "cate_id": this.cateId }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      this.services = [];
      if (data && data.status && data.status == 200 && data.data) {
        data.data.forEach((info: any) => {
          if (this.cart.itemId.includes(info.id)) {
            const index = this.cart.cart.filter(x => x.id == info.id);
            info['quantity'] = index[0].quantity;
          } else {
            info['quantity'] = 0;
          }
        });
        this.services = data.data;
        console.log(this.services);
      }
    }, error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  segmentChanged() {
    console.log(this.selectedCateId);
    this.getServices();
  }

  ngOnInit() {
  }

  add(product: any, index: any) {
    console.log(product);
    if (this.services[index].quantity > 0) {
      this.services[index].quantity = this.services[index].quantity + 1;
      this.cart.addQuantity(this.services[index].quantity, product.id);
    }
  }

  remove(product: any, index: any) {
    console.log(product, index);
    if (this.services[index].quantity == 1) {
      this.services[index].quantity = 0;
      this.cart.removeItem(product.id)
    } else {
      this.services[index].quantity = this.services[index].quantity - 1;
      this.cart.addQuantity(this.services[index].quantity, product.id);
    }
  }

  addToCart(item: any, index: any) {
    console.log(item);
    console.log('exist item and store id');
    if (this.cart.cart.length == 0) {
      this.services[index].quantity = 1;
      this.cart.addItem(item);
    } else if (this.cart.cart.length >= 0) {
      const service = this.cart.cart.filter(x => x.store_id != item.store_id);
      console.log(service);
      if (service && service.length) {
        this.cart.clearCartAlert().then((data: any) => {
          console.log(data);
          if (data && data == true) {
            this.services.forEach(element => {
              element.quantity = 0;
            });
          }
        });
      } else {
        this.services[index].quantity = 1;
        this.cart.addItem(item);
      }
    }
  }

  checkCartItems() {
    const cart = this.cart.cart;
    if (cart && cart.length) {
      cart.forEach(element => {
        if (this.cart.itemId && this.cart.itemId.length && this.cart.itemId.includes(element.id)) {
          const index = this.services.findIndex(x => x.id == element.id);
          this.services[index].quantity = element.quantity;
        }
      });
    }
  }

  saveCartAction(index: any, item: any, action: any) {
    console.log(index);
    console.log(item);
    console.log(action);
    if (this.services[index].quantity == 0) {
      if (action == 'add') {
        this.addToCart(item, index);
      }
    } else if (this.services[index].quantity > 0 && action == 'add') {
      this.add(item, index);
    } else if (this.services[index].quantity > 0 && action == 'remove') {
      this.remove(item, index);
    }
  }

  onBack() {
    this.util.onBack();
  }

  onCart() {
    this.util.navigateToPage('cart');
  }

}
