import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.page.html',
  styleUrls: ['./complaints.page.scss'],
})
export class ComplaintsPage implements OnInit {
  id: any = '';
  apiCalled: boolean = false;
  storeName: any = '';
  storeAddress: any = '';
  storeCover: any = '';
  storeMobile: any = '';
  storeEmail: any = '';
  storeUID: any = '';
  items: any[] = [];
  driverName: any = '';
  driverId: any = '';
  driverCover: any = '';
  driverEmail: any = '';
  driverMobile: any = '';
  haveDriver: boolean = false;

  images: any[] = [];
  reasons: any[] = [
    'The order arrived too late',
    'The service did not match the description',
    'The purchase was fraudulent',
    'The service was damaged or defective',
    'The merchant shipped the wrong item',
    'Wrong Item Size or Wrong Service Shipped',
    'Driver arrived too late',
    'Driver behavior',
    'Store Vendors behavior',
    'Issue with Payment Amout',
    'Others',
  ];
  submitted: boolean = false;

  issue_with: any = '';
  reason_id: any = '';
  service_id: any = '';
  title: any = '';
  short_message: any = '';
  status: any = '';
  loaded: boolean;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.getOrderDetails();
      }
    });
  }

  ngOnInit() {
  }

  getOrderDetails() {
    this.apiCalled = false;
    this.api.post_private('v1/orders/getOrderDetails', { "id": this.id }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.storeAddress = info.store_address;
        this.storeCover = info.store_cover;
        this.storeName = info.store_name;
        this.storeEmail = info.store_email;
        this.storeMobile = info.store_mobile;
        this.storeUID = info.store_id;


        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.items)) {
          this.items = JSON.parse(info.items);
        }

        if (info && info.driverInfo && info.driverInfo.first_name) {
          this.haveDriver = true;
          const driverInfo = info.driverInfo;
          console.log(driverInfo);
          this.driverCover = driverInfo.cover;
          this.driverEmail = driverInfo.email;
          this.driverName = driverInfo.first_name + ' ' + driverInfo.last_name;
          this.driverMobile = driverInfo.mobile;
          this.driverId = driverInfo.id;
        }
        console.log(this.items);
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

  onBack() {
    this.util.onBack();
  }

  callApi() {
    console.log('call API');
    const param = {
      uid: localStorage.getItem('uid'),
      order_id: this.id,
      issue_with: this.issue_with,
      driver_id: this.driverId,
      store_id: this.storeUID,
      service_id: this.service_id,
      reason_id: this.reason_id,
      title: this.title,
      short_message: this.short_message,
      status: 0,
      images: JSON.stringify(this.images)
    }
    console.log(param);
    this.util.show();
    this.api.post_private('v1/complaints/registerNewComplaints', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200) {
        this.util.showToast('Your Complaint is register', 'success', 'bottom');
        this.util.onBack();
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

  onSave() {
    console.log(this.issue_with);
    console.log(this.reason_id, this.reason_id != '', this.reason_id != null);
    console.log(this.title);
    console.log(this.short_message);
    console.log(this.storeUID);
    console.log(this.driverId);
    console.log(this.service_id);
    this.submitted = true;
    if (this.issue_with != '' && this.issue_with != null && this.reason_id != '' && this.reason_id != null && this.title != '' && this.title != null &&
      this.short_message != '' && this.short_message != null) {
      console.log('ok');
      if (this.issue_with == 1 && this.storeUID != '' && this.storeUID != null) {
        console.log('order');
        this.callApi();
        return false;
      }
      if (this.issue_with == 2 && this.storeUID != '' && this.storeUID != null) {
        this.callApi();
        console.log('store');
        return false;
      }

      if (this.issue_with == 3 && this.driverId != '' && this.driverId != null) {
        this.callApi();
        console.log('driver');
        return false;
      }

      if (this.issue_with == 4 && this.service_id != '' && this.service_id != null) {
        this.callApi();
        console.log('service');
        return false;
      }
    } else {
      console.log('global');
      this.util.errorToast('All fields are required');
      return false;
    }

  }

  async uploadImage() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose from'),
      buttons: [{
        text: this.util.translate('Camera'),
        icon: 'camera',
        handler: () => {
          console.log('camera clicked');
          this.upload(CameraSource.Camera);
        }
      }, {
        text: this.util.translate('Gallery'),
        icon: 'images',
        handler: () => {
          console.log('gallery clicked');
          this.upload(CameraSource.Photos);
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });

    await actionSheet.present();
  }

  async upload(source: CameraSource) {
    console.log('open', source);
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
            this.images.push(data.data.image_name);
            console.log('this cover', this.images);

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

}
