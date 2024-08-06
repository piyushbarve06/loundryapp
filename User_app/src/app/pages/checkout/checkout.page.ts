import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, NgZone } from '@angular/core';
import swal from 'sweetalert2';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import * as moment from 'moment';
import { OffersPage } from '../offers/offers.page';
import { AddAddressPage } from '../add-address/add-address.page';
import { StripePayPage } from '../stripe-pay/stripe-pay.page';
import { SuccessPage } from '../success/success.page';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';
import { ModalController } from '@ionic/angular';

register();
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>
  @ViewChild("slideDate") dateslide?: ElementRef<{ swiper: Swiper }>
  current = 1;
  slideOpts = {
    allowTouchMove: false,
    slidesPerView: 1,
    spaceBetween: 0,
  };
  deliveryOption: any = 'home';
  payName: any = '';
  storeName: any = '';
  storeCover: any = '';
  storeAddress: any = '';
  storeLat: any = '';
  storeLng: any = '';
  storeFCM: any = '';
  slot: any = 'pickup';

  pickupDate: any = 1;
  pickupTime: any = '';

  deliveryDate: any = 1;
  deliveryTime: any = '';

  currentDate: any = '';
  currentWeek = 0;
  pickupDays: any[] = [];
  deliveryDays: any[] = [];
  initDate: any = '';
  pickupSlotsCalled: boolean = false;

  pickupSlots: any[] = [];
  deliverySlots: any[] = [];

  balance: any = 0;
  walletCheck: boolean = false;

  myaddress: any[] = [];
  addressApiCalled: boolean = false;
  selectedAddress: any;

  payments: any[] = [];
  paymentAPICalled: boolean = false;

  pay_method: any = '';
  payMethodName: any = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    public cart: CartService,
    private modalController: ModalController,
    private chMod: ChangeDetectorRef,
    private zone: NgZone,
    private iab: InAppBrowser,
  ) {
    setTimeout(() => {
      this.storeInfo();
      this.dateConfi();
    }, 1000);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // console.log(this.swiper);
    console.log(this.swiper?.nativeElement.swiper.activeIndex);
  }

  storeInfo() {
    console.log(this.cart.cart[0].store_id);
    this.api.post_private('v1/freelancer/getStoreInfo', { "id": this.cart.cart[0].store_id }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        this.storeName = info.name;
        this.storeAddress = info.address;
        this.storeCover = info.cover;
        this.storeLat = info.lat;
        this.storeLng = info.lng;
        const userInfo = data.user;
        this.storeFCM = userInfo.fcm_token;
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  onSlideChange() {
    console.log('change');
  }

  slideChanged(event: any) {
    // this.slides.getActiveIndex().then((data: any) => {
    //   console.log(data);
    // });
  }

  onBack() {
    if (this.current == 1) {
      this.util.onBack();
    } else if (this.current == 2) {
      this.swiper?.nativeElement.swiper.slidePrev();
      this.cart.walletDiscount = 0;
      this.walletCheck = false;
      this.current = 1;

    } else if (this.current == 3) {
      if (this.deliveryOption == 'home') {
        this.swiper?.nativeElement.swiper.slidePrev();
        this.cart.walletDiscount = 0;
        this.walletCheck = false;
        this.current = 2;

      } else {
        this.swiper?.nativeElement.swiper.slideTo(0);
        this.current = 1;

      }
    }
  }

  dateConfi() {
    this.pickupDate = moment().format().split('T')[0];
    this.deliveryDate = moment().format().split('T')[0];
    this.currentDate = moment().format().split('T')[0];
    this.pickupDays = [];
    this.deliveryDays = [];
    this.initDate = moment().format();
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    let day = startOfWeek;
    while (day <= endOfWeek) {
      const data = {
        date: day.toDate().getDate(),
        day: day.format('ddd'),
        val: day.format(),
        selectDay: day.format('dddd DD MMMM')
      }
      this.pickupDays.push(data);
      this.deliveryDays.push(data);
      day = day.clone().add(1, 'd');
    }
    this.getPickupSlots();
    this.getPickupSlotsDelivery();
  }

  getPickupSlots() {
    console.log(moment(this.pickupDate).format('d'));
    const param = {
      "uid": this.cart.cart[0].store_id,
      "week_id": moment(this.pickupDate).format('d'),
      "date": this.pickupDate
    };
    this.pickupSlotsCalled = false;
    this.pickupSlots = [];
    this.pickupTime = '';
    this.api.post_private('v1/timeslots/getSlotsByForBookings', param).then((data: any) => {
      console.log(data);
      this.pickupSlotsCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.slots)) {
          this.pickupSlots = JSON.parse(info.slots);
        }
        console.log(this.pickupSlots);
      }
    }, error => {
      console.log(error);
      this.pickupSlotsCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.pickupSlotsCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  getPickupSlotsDelivery() {
    console.log(moment(this.pickupDate).format('d'));
    const param = {
      "uid": this.cart.cart[0].store_id,
      "week_id": moment(this.deliveryDate).format('d'),
      "date": this.deliveryDate
    };
    this.pickupSlotsCalled = false;
    this.deliverySlots = [];
    this.deliveryTime = '';
    this.api.post_private('v1/timeslots/getSlotsByForBookings', param).then((data: any) => {
      console.log(data);
      this.pickupSlotsCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.slots)) {
          this.deliverySlots = JSON.parse(info.slots);
        }
        console.log(this.deliverySlots);
      }
    }, error => {
      console.log(error);
      this.pickupSlotsCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.pickupSlotsCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  previousWeek() {
    if (this.currentWeek !== 0) {
      this.pickupDays = [];
      this.currentWeek = this.currentWeek - 1;
      const startOfWeek = moment().add(this.currentWeek, 'weeks').startOf('week');
      const endOfWeek = moment().add(this.currentWeek, 'weeks').endOf('week');
      let day = startOfWeek;
      while (day <= endOfWeek) {
        const data = {
          date: day.toDate().getDate(),
          day: day.format('ddd'),
          val: day.format(),
          selectDay: day.format('dddd DD MMMM')
        }
        this.pickupDays.push(data);
        day = day.clone().add(1, 'd');
      }
      console.log(this.pickupDays);
    }
  }

  previousWeekDelivery() {
    if (this.currentWeek !== 0) {
      this.deliveryDays = [];
      this.currentWeek = this.currentWeek - 1;
      const startOfWeek = moment().add(this.currentWeek, 'weeks').startOf('week');
      const endOfWeek = moment().add(this.currentWeek, 'weeks').endOf('week');
      let day = startOfWeek;
      while (day <= endOfWeek) {
        const data = {
          date: day.toDate().getDate(),
          day: day.format('ddd'),
          val: day.format(),
          selectDay: day.format('dddd DD MMMM')
        }
        this.deliveryDays.push(data);
        day = day.clone().add(1, 'd');
      }
      console.log(this.deliveryDays);
    }
  }

  selectDate(date: any) {
    console.log(date)
    if (this.currentDate <= date.val.split('T')[0]) {
      this.pickupDate = date.val.split('T')[0];
      console.log(this.pickupDate);
      this.getPickupSlots();
    }
  }

  selectDateDelivery(date: any) {
    console.log(date)
    if (this.currentDate <= date.val.split('T')[0]) {
      this.deliveryDate = date.val.split('T')[0];
      console.log(this.deliveryDate);
      this.getPickupSlotsDelivery();
    }
  }

  savePickupSlot(slot: any) {
    this.pickupTime = slot;
  }

  saveDeliverySlot(slot: any) {
    this.deliveryTime = slot;
  }

  nextWeek() {
    this.pickupDays = [];
    this.currentWeek++;
    console.log(this.currentWeek);
    const startOfWeek = moment().add(this.currentWeek, 'weeks').startOf('week');
    const endOfWeek = moment().add(this.currentWeek, 'weeks').endOf('week');
    let day = startOfWeek;
    while (day <= endOfWeek) {
      const data = {
        date: day.toDate().getDate(),
        day: day.format('ddd'),
        val: day.format(),
        selectDay: day.format('dddd DD MMMM')
      }
      this.pickupDays.push(data);
      day = day.clone().add(1, 'd');
    }
    console.log(this.pickupDays);
  }

  nextWeekDelivery() {
    this.deliveryDays = [];
    this.currentWeek++;
    console.log(this.currentWeek);
    const startOfWeek = moment().add(this.currentWeek, 'weeks').startOf('week');
    const endOfWeek = moment().add(this.currentWeek, 'weeks').endOf('week');
    let day = startOfWeek;
    while (day <= endOfWeek) {
      const data = {
        date: day.toDate().getDate(),
        day: day.format('ddd'),
        val: day.format(),
        selectDay: day.format('dddd DD MMMM')
      }
      this.deliveryDays.push(data);
      day = day.clone().add(1, 'd');
    }
    console.log(this.deliveryDays);
  }

  payment() {
    console.log('on first tab', this.deliveryOption);
    this.cart.deliveryAt = this.deliveryOption;
    if (this.pickupDate == '') {
      this.util.errorToast('Please select pick up date', 'danger');
      return false;
    }
    if (this.pickupTime == 'hello') {
      this.util.errorToast('Please select pick up time', 'danger');
      return false;
    }
    if (this.deliveryDate == '') {
      this.util.errorToast('Please select delivery date', 'danger');
      return false;
    }
    if (this.deliveryTime == 'hello') {
      this.util.errorToast('Please select delivery time', 'danger');
      return false;
    }
    if (this.deliveryOption == 'home') {
      console.log('address');
      this.swiper?.nativeElement.swiper.slideNext();
      this.cart.walletDiscount = 0;
      this.walletCheck = false;
      this.cart.calcuate();
      this.current = 2;
      this.getAddress();

    } else {
      console.log('payment');
      this.swiper?.nativeElement.swiper.slideTo(2);
      this.cart.calcuate();
      this.current = 3;
      this.getWallet();
      this.getPayments();
    }
  }

  getAddress() {
    const param = {
      id: localStorage.getItem('uid')
    }
    this.myaddress = [];
    this.addressApiCalled = false;
    this.api.post_private('v1/address/getByUID', param).then((data: any) => {
      console.log(data);
      this.addressApiCalled = true;
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.myaddress = data.data;
      }
    }, error => {
      console.log(error);
      this.addressApiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.addressApiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  getWallet() {
    this.api.post_private('v1/profile/getMyWalletBalance', { id: localStorage.getItem('uid') }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.balance = parseFloat(data.data.balance);
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  getPayments() {
    this.payments = [];
    this.paymentAPICalled = false;
    this.api.get_private('v1/payments/getPayments').then((data: any) => {
      console.log('payments->', data);
      this.paymentAPICalled = true;
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.payments = data.data;
      }
    }, error => {
      console.log(error);
      this.paymentAPICalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.paymentAPICalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  async openOffers() {
    if (this.cart && this.cart.walletDiscount && this.cart.walletDiscount > 0) {
      this.util.errorToast('Sorry you have already added a wallet discount to cart');
      return false;
    }
    const modal = await this.modalController.create({
      component: OffersPage,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role == 'ok') {
        this.cart.coupon = data.data;
        this.cart.calcuate();
      }
    });
    await modal.present();
  }

  async selectAddress() {
    console.log(this.selectedAddress);
    if (this.selectedAddress) {
      const selecte = this.myaddress.filter(x => x.id == this.selectedAddress);
      const item = selecte[0];
      const distance = await this.distanceInKmBetweenEarthCoordinates(this.storeLat, this.storeLng,
        item.lat, item.lng);
      console.log(distance);
      if (this.util.settingInfo.allowDistance >= distance) {
        this.swiper?.nativeElement.swiper.slideNext();
        const distancePricer = distance * this.util.settingInfo.delivery_charge;
        this.cart.deliveryPrice = Math.floor(distancePricer).toFixed(2);
        console.log(this.cart.deliveryPrice);
        this.current = 3;
        console.log('item', item);
        this.cart.deliveryAddress = item;
        this.cart.calcuate();
        this.getWallet();
        this.getPayments();
      } else {
        const kind = this.util.settingInfo.searchResultKind == 1 ? 'Miles' : 'KM';
        this.util.errorToast('Sorry we provide service near to' + ' ' + this.util.settingInfo.allowDistance + ' ' + this.util.translate(kind), 'danger');
      }
    } else {
      this.util.errorToast('Please select delivery address', 'danger');
    }
    // this.router.navigate(['/tabs/cart/payment']);
  }

  degreesToRadians(degrees: any) {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1: any, lon1: any, lat2: any, lon2: any) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;

    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  goToTrack() {

    console.log(this.pay_method);

    swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('Orders once placed cannot be cancelled and are non-refundable'),
      icon: 'question',
      confirmButtonText: this.util.translate('Yes'),
      cancelButtonText: this.util.translate('Cancel'),
      showCancelButton: true,
      backdrop: false,
      background: 'white'
    }).then((data) => {
      console.log(data);
      if (data && data.value) {
        console.log('go to procesed,,');
        if (this.pay_method == 1) {
          console.log('cod');
          this.payMethodName = 'cod';
          this.createOrder('cod');
        } else if (this.pay_method == 2) {
          console.log('stripe');
          this.payMethodName = 'stripe';
          this.stripePayment();
        } else if (this.pay_method == 3) {
          console.log('paypal');
          this.payMethodName = 'paypal';
          this.payWithPayPal();
        } else if (this.pay_method == 4) {
          console.log('paytm');
          this.payMethodName = 'paytm';
          this.payWithPayTm();
        } else if (this.pay_method == 5) {
          console.log('razorpay');
          this.payMethodName = 'razorpay';
          this.payWithRazorPay();
        } else if (this.pay_method == 6) {
          console.log('instamojo');
          this.payMethodName = 'instamojo';
          this.paywithInstaMojo()
        } else if (this.pay_method == 7) {
          console.log('paystack');
          this.payMethodName = 'paystack';
          this.paystackPay();
        } else if (this.pay_method == 8) {
          console.log('flutterwave');
          this.payMethodName = 'flutterwave';
          this.payWithFlutterwave();
        } else if (this.pay_method == 9) {
          console.log('paykun');
        }
      }
    });
  }

  getText() {
    return 'please visit all the stores listed on top';
  }

  async addNew() {
    const modal = await this.modalController.create({
      component: AddAddressPage,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.data && data.data == 'ok') {
        this.getAddress();
      }
    });
    await modal.present();

  }

  removeOffers() {
    this.cart.coupon = null;
    this.cart.discount = 0;
    this.cart.calcuate();
  }

  walletChange(event: any) {
    console.log(event, event.detail.checked);
    if (event && event.detail && event.detail.checked == true) {
      if (this.cart && this.cart.coupon && this.cart.coupon.id) {
        this.util.errorToast('Sorry you have already added a offers discount to cart');
        this.walletCheck = false;
        return false;
      }
      this.cart.walletDiscount = parseFloat(this.balance);
      this.cart.calcuate();
    } else {
      this.cart.walletDiscount = 0;
      this.cart.calcuate();
    }
  }

  paymentChange() {
    const payMethod = this.payments.filter(x => x.id == this.pay_method);
    console.log("paymethod", payMethod);
    if (payMethod && payMethod.length) {
      this.payName = payMethod[0].name;
    }
  }

  async stripePayment() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    function convertToCents(amount: any) {
      return Math.round(amount * 100);
    }
    const amountToPay = convertToCents(this.cart.grandTotal);
    const browser = this.iab.create(this.api.baseUrl + 'v1/payments/stripeAppCheckout?amount=' + amountToPay, '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      console.log(navUrl.includes('success_payments'), navUrl.includes('failed_payments'));
      if (navUrl.includes('success_payments') || navUrl.includes('failed_payments')) {
        browser.close();
        if (navUrl.includes('success_payments')) {
          const urlItems = new URL(event.url);
          console.log(urlItems);
          const orderId = urlItems.searchParams.get('session_id');
          const param = {
            key: orderId,
          };
          this.createOrder(JSON.stringify(param));
        } else {
          this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
        }
      }

    });
    console.log('browser=> end');
  }

  createOrder(payKey: any) {
    const param = {
      "uid": localStorage.getItem('uid'),
      "store_id": this.cart.cart[0].store_id,
      "order_to": this.deliveryOption == 'home' ? 1 : 0,
      "address": this.deliveryOption == 'home' ? JSON.stringify(this.cart.deliveryAddress) : 'NA',
      "items": JSON.stringify(this.cart.cart),
      "coupon_id": this.cart && this.cart.coupon && this.cart.coupon.name ? this.cart.coupon.id : 0,
      "coupon": this.cart && this.cart.coupon && this.cart.coupon.name ? JSON.stringify(this.cart.coupon) : 'NA',
      "discount": this.cart.discount,
      "distance_cost": this.cart.deliveryPrice,
      "total": this.cart.totalPrice,
      "serviceTax": this.cart.serviceTax,
      "grand_total": this.cart.grandTotal,
      "pay_method": this.pay_method,
      "paid": payKey,
      "pickup_date": this.pickupDate,
      // "pickup_slot": this.pickupTime,
      "pickup_slot": 12,
      "delivery_date": this.deliveryDate,
      "delivery_slot": 12,
      // "delivery_slot": this.deliveryTime,
      'wallet_used': this.walletCheck == true && this.cart.walletDiscount > 0 ? 1 : 0,
      'wallet_price':
        this.walletCheck == true && this.cart.walletDiscount > 0 ? this.cart.walletDiscount : 0,
      "status": 0
    };
    this.util.show();
    this.api.post_private('v1/orders/create', param).then((data: any) => {
      console.log(data);
      this.util.hide();

      if (data && data.status && data.status == 200 && data.data && data.data.id) {

        this.cart.clearCart();
        this.cart.clearCart();
        this.chMod.detectChanges();
        this.sendNotification(data.data.id);
        this.zone.run(() => {
          this.openSuccess(data.data.id);
        });
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  sendNotification(orderId: any) {
    const param = {
      id: this.storeFCM,
      title: 'New Order ' + ' #' + orderId,
      message: 'New Order'
    };
    this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
      console.log('notification response', data);
    }, error => {
      console.log('error in notification', error);
    }).catch(error => {
      console.log('error in notification', error);
    });
  }

  async openSuccess(orderID: any) {
    const modal = await this.modalController.create({
      component: SuccessPage,
      cssClass: 'custom_modal',
      backdropDismiss: false,
      componentProps: { id: orderID }
    });
    return await modal.present();
  }

  async payWithPayPal() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const browser = this.iab.create(this.api.baseUrl + 'v1/payments/payPalPay?amount=' + this.cart.grandTotal, '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      console.log(navUrl.includes('success_payments'), navUrl.includes('failed_payments'));
      if (navUrl.includes('success_payments') || navUrl.includes('failed_payments')) {
        browser.close();
        if (navUrl.includes('success_payments')) {
          const urlItems = new URL(event.url);
          console.log(urlItems);
          const orderId = urlItems.searchParams.get('pay_id');
          const param = {
            key: orderId,
          };
          this.createOrder(JSON.stringify(param));
        } else {
          this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
        }
      }

    });
    console.log('browser=> end');
  }

  async payWithPayTm() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const browser = this.iab.create(this.api.baseUrl + 'v1/payNow?amount=' + this.cart.grandTotal, '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      console.log(navUrl.includes('success_payments'), navUrl.includes('failed_payments'));
      if (navUrl.includes('success_payments') || navUrl.includes('failed_payments')) {
        browser.close();
        if (navUrl.includes('success_payments')) {
          const urlItems = new URL(event.url);
          console.log(urlItems);
          const orderId = urlItems.searchParams.get('id');
          const txt_id = urlItems.searchParams.get('txt_id');
          const param = {
            key: orderId,
            txtId: txt_id
          };
          this.createOrder(JSON.stringify(param));
        } else {
          this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
        }
      }

    });
    console.log('browser=> end');
  }

  getName() {
    return this.util.userInfo && this.util.userInfo.first_name ? this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name : 'Washing WALA';
  }

  getEmail() {
    return this.util.userInfo && this.util.userInfo.email ? this.util.userInfo.email : 'info@washingwala.com';
  }

  async payWithRazorPay() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      amount: this.cart.grandTotal ? (this.cart.grandTotal * 100).toFixed() : 5,
      email: this.getEmail(),
      logo: this.util && this.util.appLogo ? this.api.mediaURL + this.util.appLogo : 'null',
      name: this.getName(),
      app_color: this.util && this.util.app_color ? this.util.app_color : '#f47878'
    }
    const browser = this.iab.create(this.api.baseUrl + 'v1/payments/razorPay?' + this.api.JSON_to_URLEncoded(param), '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success_payments')) {
        const urlItems = new URL(event.url);
        console.log(urlItems);
        const orderId = urlItems.searchParams.get('pay_id');
        if (orderId && orderId != null) {
          this.verifyPurchaseRazorPay(orderId);
        } else {
          const orderId = urlItems.searchParams.get('key_id');
          this.verifyPurchaseRazorPay(orderId);
        }

      }

      if (navUrl.includes('status=authorized') || navUrl.includes('status=failed') || navUrl.includes('redirect_callback')) {
        console.log('close here');
        browser.close();
        const urlItems = new URL(event.url).pathname;
        console.log('--->>', urlItems.split('/'), urlItems.split('/').length, urlItems.split('/')[3]);
        if (urlItems.split('/').length >= 5 && urlItems.split('/')[3].startsWith('pay_')) {
          const paymentId = urlItems.split('/')[3];
          console.log('paymentId', paymentId);
          this.verifyPurchaseRazorPay(paymentId);
        }
      }

    });
    console.log('browser=> end');
  }

  verifyPurchaseRazorPay(paymentId: any) {
    this.util.show();
    this.api.get_private('v1/payments/VerifyRazorPurchase?id=' + paymentId).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.success && data.success.status && data.success.status == 'captured') {
        this.util.hide();
        this.createOrder(JSON.stringify(data.success));
      } else {
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
    });
  }

  async paywithInstaMojo() {
    const param = {
      allow_repeated_payments: 'False',
      amount: this.cart.grandTotal,
      buyer_name: this.getName(),
      purpose: this.util.appName + ' Orders',
      redirect_url: this.api.baseUrl + 'v1/success_payments',
      phone: this.util.userInfo && this.util.userInfo.mobile ? this.util.userInfo.mobile : '',
      send_email: 'True',
      webhook: this.api.baseUrl,
      send_sms: 'True',
      email: this.getEmail()
    };

    this.util.show();
    this.api.post_private('v1/payments/instamojoPay', param).then((data: any) => {
      console.log('instamojo response', data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.success && data.success.success == true) {
        const options: InAppBrowserOptions = {
          location: 'no',
          clearcache: 'yes',
          zoom: 'yes',
          toolbar: 'yes',
          closebuttoncaption: 'close'
        };
        const browser: any = this.iab.create(data.success.payment_request.longurl, '_blank', options);
        browser.on('loadstop').subscribe((event: any) => {
          const navUrl = event.url;
          console.log('navURL', navUrl);
          if (navUrl.includes('success_payments')) {
            browser.close();
            const urlItems = new URL(event.url);
            console.log(urlItems);
            const orderId = urlItems.searchParams.get('payment_id');
            console.log(orderId);
            this.createOrder(orderId);
          }
        });
      } else {
        const error = JSON.parse(data.error);
        console.log('error message', error);
        if (error && error.message) {
          this.util.showToast(error.message, 'danger', 'bottom');
          return false;
        }
        this.util.apiErrorHandler(error);
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

  async paystackPay() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const paykey = '' + Math.floor((Math.random() * 1000000000) + 1);
    const param = {
      email: this.util.userInfo.email,
      amount: (this.cart.grandTotal * 100).toFixed(),
      first_name: this.util.userInfo.first_name,
      last_name: this.util.userInfo.last_name,
      ref: paykey
    }
    console.log('to url==>', this.api.JSON_to_URLEncoded(param))
    const url = this.api.baseUrl + 'v1/payments/paystackPay?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe((event: any) => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success') || navUrl.includes('close')) {
        console.log('close');
        browser.close();
        if (navUrl.includes('success')) {
          console.log('closed---->>>>>')
          this.createOrder(paykey);
        } else {
          console.log('closed');
        }
      }
    });
  }

  async payWithFlutterwave() {
    const payMethod = this.payments.filter(x => x.id == this.pay_method);
    console.log(payMethod);
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      amount: this.cart.grandTotal,
      email: this.getEmail(),
      phone: this.util.userInfo.mobile,
      name: this.getName(),
      code: payMethod[0].currency_code,
      logo: this.api.mediaURL + this.util.appLogo,
      app_name: this.util.appName
    }
    console.log('to url==>', this.api.JSON_to_URLEncoded(param))
    const url = this.api.baseUrl + 'v1/payments/flutterwavePay?' + this.api.JSON_to_URLEncoded(param);
    const browser: any = this.iab.create(url, '_blank', options);
    browser.on('loadstop').subscribe((event: any) => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success_payments') || navUrl.includes('failed_payments')) {
        console.log('close');
        browser.close();
        if (navUrl.includes('success_payments')) {
          const urlItems = new URL(event.url);
          const orderId = urlItems.searchParams.get('transaction_id');
          const txtId = urlItems.searchParams.get('tx_ref');
          const ord = {
            orderId: orderId,
            txtId: txtId
          }
          this.createOrder(JSON.stringify(ord));
        } else {
          this.util.errorToast(this.util.translate('Something went wrong while payments. please contact administrator'));
        }

      }
    });
  }

}
