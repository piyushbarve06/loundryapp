import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.page.html',
  styleUrls: ['./select-country.page.scss'],
})
export class SelectCountryPage implements OnInit {
  ccCode: any = this.util.settingInfo.default_country_code;
  countries: any[] = [];
  dummy: any[] = [];
  cc: any;

  dummyLoad: any[] = [];
  constructor(
    public api: ApiService,
    public util: UtilService,
    private modalController: ModalController
  ) {
    this.dummyLoad = Array(10);
    this.api.getLocalAssets('country.json').then((data: any) => {
      this.dummyLoad = [];
      this.dummy = data;
      this.countries = data;
      console.log(this.dummy);
    }, error => {
      this.dummyLoad = [];
      console.log(error);
    }).catch(error => {
      this.dummyLoad = [];
      console.log(error);
    });
  }

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss();
  }

  onSearchChange(events: any) {
    console.log(events);
    if (events.value !== '') {
      this.countries = this.dummy.filter((item) => {
        return item.country_name.toLowerCase().indexOf(events.detail.value.toLowerCase()) > -1;
      });
    } else {
      this.countries = [];
    }
  }

  okay() {
    console.log(this.ccCode);
    this.modalController.dismiss(this.ccCode, 'selected');
  }

}
