import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-select-driver',
  templateUrl: './select-driver.page.html',
  styleUrls: ['./select-driver.page.scss'],
})
export class SelectDriverPage implements OnInit {
  deliverLat: any = '';
  deliverLng: any = '';
  apiCalled: boolean = false;
  list: any[] = [];
  driverId: any = '';
  distanceType: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    public navParam: NavParams,
    private modalController: ModalController
  ) {
    this.deliverLat = this.navParam.get('lat');
    this.deliverLng = this.navParam.get('lng');
    console.log(this.deliverLat, this.deliverLng);
    this.getDrivers();
  }

  ngOnInit() {
  }

  getDrivers() {
    this.apiCalled = false;
    this.api.post_private('v1/drivers/nearMeDrivers', { "lat": this.deliverLat, "lng": this.deliverLng }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        this.list = data.data;
        this.distanceType = data.distanceType;
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

  close() {
    this.modalController.dismiss('close', 'close');
  }

  selected() {
    const selectedDriver = this.list.filter(x => x.id == this.driverId);
    if (selectedDriver && selectedDriver.length > 0) {
      const param = {
        "id": this.driverId,
        "token": selectedDriver[0].fcm_token
      }
      this.modalController.dismiss(param, 'ok');
    }
  }

}
