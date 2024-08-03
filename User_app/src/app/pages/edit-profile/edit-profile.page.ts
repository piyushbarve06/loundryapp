import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  apiCalled: boolean = false;
  firstName: any = '';
  lastName: any = '';
  cover: any = '';
  email: any = '';
  mobile: any = '';
  isLogin: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private actionSheetController: ActionSheetController
  ) {
    this.getUserByID();
  }

  ngOnInit() {
  }

  getUserByID() {
    this.apiCalled = false;
    this.api.post_private('v1/profile/getProfile', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(">>>>><<<<<", data);
      this.apiCalled = true;
      if (data && data.success && data.status === 200) {
        this.util.userInfo = data.data;
        const info = data.data;
        this.firstName = info.first_name;
        this.lastName = info.last_name;
        this.cover = info.cover;
        this.email = info.email;
        this.mobile = info.mobile;
      }
    }, error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error) => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  onBack() {
    this.util.onBack();
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
              id: localStorage.getItem('uid'),
              first_name: this.firstName,
              last_name: this.lastName,
            };
            this.util.show(this.util.translate('updating...'));
            this.api.post_private('v1/profile/update', param).then((data: any) => {
              this.util.hide();
              console.log(data);
              this.getUserByID();
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

  onUpdate() {

    if (this.firstName == '' || this.firstName == null || this.lastName == '' || this.lastName == null) {
      this.util.errorToast('All fields are required');
      return false;
    }
    const param = {
      cover: this.cover,
      id: localStorage.getItem('uid'),
      first_name: this.firstName,
      last_name: this.lastName,
    };
    this.util.show(this.util.translate('updating...'));
    this.api.post_private('v1/profile/update', param).then((data: any) => {
      this.util.hide();
      console.log(data);
      this.getUserByID();
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
