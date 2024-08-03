import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-redeem-success',
  templateUrl: './redeem-success.page.html',
  styleUrls: ['./redeem-success.page.scss'],
})
export class RedeemSuccessPage implements OnInit {

  text: any = '';
  constructor(
    private param: NavParams,
    private modalController: ModalController,
    public util: UtilService
  ) {
    const text = this.param.get('txt');
    console.log('to show', text);
    this.text = text;
  }

  ngOnInit() {
  }

  onDismiss() {
    this.modalController.dismiss();
  }

}
