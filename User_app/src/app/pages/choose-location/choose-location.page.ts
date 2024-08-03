import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
declare var google: any;

@Component({
  selector: 'app-choose-location',
  templateUrl: './choose-location.page.html',
  styleUrls: ['./choose-location.page.scss'],
})
export class ChooseLocationPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  query: any = '';
  autocompleteItems1: any = [];
  GoogleAutocomplete;
  geocoder: any;
  map: any;
  addr: any;
  lat: any;
  lng: any;
  previousMarker: any;
  isLoading: boolean = false;
  constructor(
    public util: UtilService,
    private chMod: ChangeDetectorRef,
    private alertController: AlertController
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.query = '';
    this.autocompleteItems1 = [];
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

  onSearchChange(event: any) {
    console.log(event);
    console.log(this.query);
    if (this.query == '') {
      this.autocompleteItems1 = [];
      return;
    }
    const addsSelected = localStorage.getItem('addsSelected');
    if (addsSelected && addsSelected != null) {
      localStorage.removeItem('addsSelected');
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({ input: this.query }, (predictions: any, status: any) => {
      console.log(predictions);
      if (predictions && predictions.length > 0) {
        this.autocompleteItems1 = predictions;
        console.log(this.autocompleteItems1);
      }
    });
    this.chMod.detectChanges();
  }

  selectSearchResult1(item: any) {
    console.log('select', item);
    localStorage.setItem('addsSelected', 'true');
    this.autocompleteItems1 = [];
    this.query = item.description;
    // this.util.cityAddress = item.description;
    this.geocoder.geocode({ placeId: item.place_id }, (results: any, status: any) => {
      if (status == 'OK' && results[0]) {
        console.log(status);
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log(this.lat, this.lng);
        this.chMod.detectChanges();
        this.loadMap(this.lat, this.lng);
      }
    });
  }

  loadMap(lat: any, lng: any) {
    this.lat = lat;
    this.lng = lng;
    const latLng = new google.maps.LatLng(lat, lng);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      scaleControl: true,
      streetViewControl: false,
      zoomControl: false,
      overviewMapControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      disableDoubleClickZoom: false,
      styles: [],
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.previousMarker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      animation: google.maps.Animation.DROP,
      title: 'Your Location',
    });
  }

  selectedAddress() {
    localStorage.setItem('location', 'true');
    localStorage.setItem('lat', this.lat);
    localStorage.setItem('lng', this.lng);
    localStorage.setItem('address', this.query);
    this.util.publishNewAddress();
    this.util.navigateRoot('tabs');
  }

  onBack() {
    this.util.onBack();
  }

}
