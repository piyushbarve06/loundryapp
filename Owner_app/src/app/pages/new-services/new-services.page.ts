import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CategoriesPage } from '../categories/categories.page';
import { SubCategoriesPage } from '../sub-categories/sub-categories.page';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-new-services',
  templateUrl: './new-services.page.html',
  styleUrls: ['./new-services.page.scss'],
})
export class NewServicesPage implements OnInit {
  cateName: any = '';
  coverImage: any = '';
  name: any = '';
  realPrice: any = '';
  discount: any = '';
  sellPrice: any = '';
  cateId: any = '';
  subId: any = '';
  subName: any = '';
  // variations: any[] = [];
  submited: boolean = false;
  isNew: boolean = true;
  serviceId: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.serviceId = data.id;
        this.isNew = false;
        this.getInfo();
        console.log('update');
      }
    });
  }

  getInfo() {
    this.util.show();
    this.api.post_private('v1/services/getById', { "id": this.serviceId }).then((data: any) => {
      this.util.hide();
      console.log(data);
      if (data && data.status && data.status == 200) {
        const info = data.data;
        this.name = info.name;
        this.realPrice = info.original_price;
        this.sellPrice = info.sell_price;
        this.discount = info.discount;
        this.coverImage = info.cover;
        this.cateId = info.cate_id;
        this.subId = info.sub_cate;
        this.cateName = info.category.name;
        this.subName = info.sub_category.name;
        // if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.variations)) {
        //   this.variations = JSON.parse(info.variations);
        // }
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

  ngOnInit() {
  }


  async openCate() {
    const modal = await this.modalController.create({
      component: CategoriesPage,
      componentProps: {
        id: this.cateId
      }
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.data && data.role == 'selected') {
        this.cateId = data.data.id;
        this.cateName = data.data.name;
      }
    });
  }

  async openSub() {
    if (this.cateId && this.cateName) {
      const modal = await this.modalController.create({
        component: SubCategoriesPage,
        componentProps: {
          cateId: this.cateId,
          subId: this.subId
        }
      });
      modal.present();
      modal.onDidDismiss().then((data) => {
        console.log(data);
        if (data && data.data && data.role == 'selected') {
          this.subId = data.data.id;
          this.subName = data.data.name;
        }
      });
    } else {
      this.util.errorToast(this.util.translate('Please select category'), 'danger');
    }
  }

  async cover() {
    const actionSheet = await this.actionSheetCtrl.create({
      mode: 'md',
      buttons: [{
        text: this.util.translate('Camera'),
        role: 'camera',
        icon: 'camera',
        handler: () => {
          console.log('Camera clicked');
          this.upload(CameraSource.Camera);
        }
      },
      {
        text: this.util.translate('Gallery'),
        role: 'gallery',
        icon: 'image',
        handler: () => {
          console.log('Gallery clicked');
          this.upload(CameraSource.Photos);
        }
      }, {
        text: this.util.translate('Cancel'),
        role: 'cancel',
        icon: 'close',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }


  b64toBlob(b64Data: any, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async upload(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        source,
        quality: 50,
        resultType: CameraResultType.Base64
      });
      console.log('image output', image);
      if (image && image.base64String) {
        const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
        this.util.show(this.util.translate('Uploading..'));
        this.api.uploadImage('v1/uploadImage', blobData, image.format).then((data) => {
          console.log('image upload', data);
          this.util.hide();
          if (data && data.status === 200 && data.success === true && data.data.image_name) {
            this.coverImage = data.data.image_name;
            console.log('this cover', this.coverImage);
          } else {
            console.log('NO image selected');
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }).catch(error => {
          console.log('error', error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }
    } catch (error) {
      console.log(error);
      this.util.apiErrorHandler(error);
    }
  }

  onDicount(input: any) {
    const value = parseFloat(input.detail.value);
    console.log(value);
    if (this.realPrice && value <= 99) {
      this.percentage(this.discount, this.realPrice);
    }
  }

  onRealPrice(input: any) {
    const value = parseFloat(input.detail.value);
    console.log(value);
    if (this.sellPrice && value > 1) {
      this.percentage(this.discount, this.realPrice);
    }
  }

  percentage(percent: any, total: any) {
    this.sellPrice = 0;
    const price = ((percent / 100) * total);
    this.sellPrice = this.realPrice - price;
  }

  submit() {
    console.log(this.cateId);
    console.log(this.subId);
    console.log(this.coverImage);
    console.log(this.name);
    console.log(this.realPrice);
    console.log(this.sellPrice);
    console.log(this.discount);
    this.submited = true;
    if (this.cateId == '' || this.subId == '' || this.coverImage == '' || this.name == '' ||
      this.realPrice == '' || this.realPrice == null) {
      this.util.errorToast('All fields are required', 'danger');
      return false;
    }
    const param = {
      "store_id": localStorage.getItem('uid'),
      "cate_id": this.cateId,
      "sub_cate": this.subId,
      "name": this.name,
      "cover": this.coverImage,
      "original_price": this.realPrice,
      "sell_price": this.discount && this.discount != '' && this.discount != null ? this.sellPrice : 0,
      "discount": this.discount && this.discount != '' && this.discount != null ? this.discount : 0,
      "variations": "NA",
      "status": 1
    };
    console.log(param);
    this.util.show();
    this.api.post_private('v1/services/create', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200) {
        this.util.showToast('Service Addded', 'success', 'bottom');
        this.util.serviceChanged();
        this.util.onBack();
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

  updateService() {
    console.log(this.cateId);
    console.log(this.subId);
    console.log(this.coverImage);
    console.log(this.name);
    console.log(this.realPrice);
    console.log(this.sellPrice);
    console.log(this.discount);
    this.submited = true;
    if (this.cateId == '' || this.subId == '' || this.coverImage == '' || this.name == '' ||
      this.realPrice == '' || this.realPrice == null) {
      this.util.errorToast('All fields are required', 'danger');
      return false;
    }
    const param = {
      "id": this.serviceId,
      "store_id": localStorage.getItem('uid'),
      "cate_id": this.cateId,
      "sub_cate": this.subId,
      "name": this.name,
      "cover": this.coverImage,
      "original_price": this.realPrice,
      "sell_price": this.discount && this.discount != '' && this.discount != null ? this.sellPrice : 0,
      "discount": this.discount && this.discount != '' && this.discount != null ? this.discount : 0,
      "variations": "NA",
    };
    console.log(param);
    this.util.show();
    this.api.post_private('v1/services/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200) {
        this.util.showToast('Service Updated', 'success', 'bottom');
        this.util.serviceChanged();
        this.util.onBack();
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

  onBack() {
    this.util.onBack();
  }

}
