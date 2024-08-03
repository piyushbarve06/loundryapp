import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { TranslateService } from '@ngx-translate/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
declare var google: any;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  isLoading: boolean = false;
  selectedLanguages: any = 'en';
  constructor(
    public util: UtilService,
    private alertController: AlertController,
    private translate: TranslateService,
  ) {
    this.selectedLanguages = localStorage.getItem('selectedLanguage');
  }

  ngOnInit() {
  }

  onLocation() {
    this.isLoading = true;
    const isLocationPlugin = Capacitor.isPluginAvailable('Geolocation');
    if (isLocationPlugin) {
      this.getPermission();
    }
  }

  async getPermission() {
    const permission = await Geolocation.checkPermissions();
    console.log(permission.location);
    if (permission && permission.location == 'granted') {
      this.getLocation();
    } else {
      const platform = Capacitor.getPlatform();
      console.log(platform);
      if (platform == 'web') {
        this.getWebLocationPermission();
      } else {
        this.askPermission();
      }
    }
  }

  async askPermission() {
    const permission = await Geolocation.requestPermissions();
    console.log(permission);
    if (permission && permission.location == 'granted') {
      this.getLocation();
    } else if (permission && permission.location == 'denied') {
      this.presentAlert();
    }
  }

  async presentAlert() {
    this.isLoading = false;
    const alert = await this.alertController.create({
      header: this.util.translate('Permission Denied'),
      subHeader: this.util.translate('Location Error'),
      message: this.util.translate('Please enable location from App settings'),
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: this.util.translate('Okay'),
          handler: () => {
            console.log('Confirm Okay');
            this.getLocationInfo();
          }
        }
      ]
    });
    await alert.present();
  }

  getLocationInfo() {
    const isLocationPlugin = Capacitor.isPluginAvailable('Geolocation');
    if (isLocationPlugin) {
      this.getPermission();
    }
  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    console.log(coordinates);
    if (coordinates && coordinates.coords && coordinates.coords) {
      this.getAddress(coordinates.coords.latitude, coordinates.coords.longitude);
    }
  }

  report(message: any) {
    console.log(message);
  }

  getWebLocationPermission() {
    navigator.permissions.query({
      name: 'geolocation'
    }).then((result) => {
      if (result.state == 'granted') {
        this.report(result.state);
      } else if (result.state == 'prompt') {
        this.report(result.state);
        navigator.geolocation.getCurrentPosition(position => {
          console.log(position);
          this.getAddress(position.coords.latitude, position.coords.longitude);
        });
      } else if (result.state == 'denied') {
        this.report(result.state);
      }
      result.onchange = () => {
        this.report(result.state);
      }
    });
  }

  getAddress(lat: any, lng: any) {
    if (typeof google == 'object' && typeof google.maps == 'object') {
      const geocoder = new google.maps.Geocoder();
      const location = new google.maps.LatLng(lat, lng);
      this.isLoading = true;
      geocoder.geocode({ 'location': location }, (results: any, status: any) => {
        console.log(results);
        this.isLoading = false;
        console.log('status', status);
        if (results && results.length) {
          localStorage.setItem('location', 'true');
          localStorage.setItem('lat', lat);
          localStorage.setItem('address', results[0].formatted_address);
          this.util.deliveryAddress = results[0].formatted_address;
          localStorage.setItem('lng', lng);
          this.util.publishNewAddress();
          this.util.navigateRoot('tabs');
        } else {
          this.util.errorToast('Something went wrong please try again later');
        }
      });
    } else {
      this.util.errorToast(this.util.translate('Error while fetching google maps... please check your google maps key'));
      return false;
    }
  }

  chooseLocation() {
    this.util.navigateToPage('choose-location');
  }

  translateApp() {
    console.log(this.selectedLanguages);
    const selected = this.util.allLanguages.filter(x => x.code == this.selectedLanguages);
    console.log(selected);
    if (selected && selected.length > 0) {
      localStorage.setItem('selectedLanguage', this.selectedLanguages);
      localStorage.setItem('direction', selected[0].direction);
      this.translate.use(localStorage.getItem('selectedLanguage') || 'en');
      document.documentElement.dir = selected[0].direction;
    }
  }

}
