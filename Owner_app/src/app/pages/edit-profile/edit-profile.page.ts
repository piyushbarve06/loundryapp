import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StoreCategoriesPage } from '../store-categories/store-categories.page';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  apiCalled: boolean = false;
  firstName: any = '';
  lastName: any = '';
  name: any = '';
  cover: any = '';
  address: any = '';
  about: any = '';
  categories: any[] = [];
  lat: any = '';
  lng: any = '';
  zipcode: any = '';
  gender: any = '';
  email: any = '';
  storeId: any = '';
  isLogin: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController
  ) {
    this.getProfile();
  }

  getProfile() {
    this.apiCalled = false;
    this.api.post_private('v1/freelancer/getMyProfile', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.storeInfo && data.userInfo) {
        const storeInfo = data.storeInfo;
        const userInfo = data.userInfo;
        console.log(storeInfo);
        console.log(userInfo);
        this.firstName = userInfo.first_name;
        this.lastName = userInfo.last_name;
        this.email = userInfo.email;
        this.cover = userInfo.cover;

        this.storeId = storeInfo.id;
        this.name = storeInfo.name;
        this.address = storeInfo.address;
        this.about = storeInfo.about;
        this.zipcode = storeInfo.zipcode;
        this.categories = storeInfo.web_cates_data;
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

  async updateProfile() {
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
            this.cover = data.data.image_name;
            console.log('this cover', this.cover);
            const param = {
              cover: this.cover,
              id: this.storeId,
              uid: localStorage.getItem('uid'),
              first_name: this.firstName,
              last_name: this.lastName,
            };
            this.util.show(this.util.translate('updating...'));
            this.api.post_private('v1/freelancer/updateMyProfile', param).then((data: any) => {
              this.util.hide();
              console.log(data);
              localStorage.setItem('cover', this.cover);
              this.getProfile();
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

  ngOnInit() {
  }

  onUpdate() {
    const savedCategories = [...new Set(this.categories.map(item => item.id))];
    console.log(savedCategories);
    console.log(savedCategories.join(','));
    if (this.name == '' || this.name == null || this.firstName == '' || this.firstName == null || this.lastName == '' || this.lastName == null || this.address == '' ||
      this.address == null || this.about == '' || this.about == null || this.zipcode == '' || this.zipcode == '') {
      this.util.errorToast('All fields are required');
      return false;
    }
    const param = {
      cover: this.cover,
      id: this.storeId,
      uid: localStorage.getItem('uid'),
      first_name: this.firstName,
      last_name: this.lastName,
      name: this.name,
      address: this.address,
      about: this.about,
      zipcode: this.zipcode,
      categories: savedCategories.join(',')
    };
    this.util.show(this.util.translate('updating...'));
    this.api.post_private('v1/freelancer/updateMyProfile', param).then((data: any) => {
      this.util.hide();
      console.log(data);
      localStorage.setItem('cover', this.cover);
      localStorage.setItem('name', this.name);
      localStorage.setItem('address', this.address);
      this.getProfile();
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

  onBack() {
    this.util.onBack();
  }

  async openCategories() {
    const modal = await this.modalController.create({
      component: StoreCategoriesPage,
      componentProps: { categories: this.categories }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.data && data.role == 'ok') {
        console.log('selected data', data.data);
        this.categories = data.data;
      }
    });
    await modal.present();

  }

}
