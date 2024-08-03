import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.page.html',
  styleUrls: ['./referral.page.scss'],
})
export class ReferralPage implements OnInit {
  loaded: boolean = false;

  myCode: any = '';
  title: any = '';
  message: any = '';
  referralActive: boolean = false;
  amount: any = '';

  constructor(
    public util: UtilService,
    public api: ApiService,
    private platform: Platform,
  ) {
    this.getMycode();
  }

  ngOnInit() {
  }


  getMycode() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.loaded = false;
    this.api.post_private('v1/referralcode/getMyCode', param).then((data: any) => {
      this.loaded = true;
      console.log(data);
      if (data && data.status && data.status == 200 && data.data && data.referral) {
        if (data.referral && data.referral.status == 1) {
          this.referralActive = true;
          this.title = data.referral.title;
          this.message = data.referral.message;
          this.amount = data.referral.amount;
        }
        if (data && data.data) {
          this.myCode = data.data.code;
        }
      }
    }, error => {
      console.log(error);
      this.loaded = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.loaded = true;
      this.util.apiErrorHandler(error);
    });
  }

  async inviteUser() {

    let url = '';
    if (this.platform.platforms().includes('ios') || this.platform.platforms().includes('ipad') || this.platform.platforms().includes('iphone')) {
      // url = this.util.appStoreUrl;
    } else {
      // url = this.util.playStoreUril;
    }
    const name = this.util && this.util.userInfo && this.util.userInfo.first_name ? this.util.userInfo.first_name : '';
    const title = this.util.translate('Your friend ') + name + this.util.translate(' has invited you to ') + this.util.appName;
    await Share.share({
      title: title,
      text: this.util.translate('Hey Buddy download ') + this.util.appName + this.util.translate(' from app store and use my code ') + this.myCode +
        this.util.translate(' while sign up we both will get ') + this.amount + this.util.translate(' $ wallet amount'),
      url: url,
      dialogTitle: this.util.translate('Share with buddies'),
    });
  }

  copyClipboard() {
    try {
      navigator.clipboard.writeText(this.myCode).then(data => {
        console.log('Async: Copying to clipboard was successful!');
        this.util.showToast('Copied to clipboard', 'success', 'bottom');
      }, error => {
        console.error('Async: Could not copy text: ', error);
      });
    } catch (error) {
      console.log(error);
    }
  }

}
