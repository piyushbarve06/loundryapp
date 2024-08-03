import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { register } from 'swiper/element/bundle';
declare var google: any;

register();
@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;
  slideOpts = {
    slidesPerView: 1.2,
  };
  addressTitle: any = '';
  apiCalled: boolean = false;
  list: any[] = [];
  distanceType: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.addressTitle = localStorage.getItem('address');
  }

  ngOnInit() {
    this.getList();
    this.util.subscribeNewAddress().subscribe((data: any) => {
      console.log('New Address Fetched');
      this.getList();
    });
  }

  getList() {
    this.apiCalled = false;
    const uid = localStorage.getItem('uid') && localStorage.getItem('uid') != null && localStorage.getItem('uid') != 'null' ? localStorage.getItem('uid') : 'NA';
    this.api.post_public('v1/freelancer/getStoresList', { "lat": localStorage.getItem('lat'), "lng": localStorage.getItem('lng'), "uid": uid }).then((data: any) => {
      console.log(data);
      this.list = [];
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
        this.distanceType = data.distanceType;
        this.list = this.list.sort((a, b) =>
          parseFloat(a.distance) < parseFloat(b.distance) ? -1
            : (parseFloat(a.distance) > parseFloat(b.distance) ? 1 : 0));
        console.log(this.list);
        setTimeout(() => {
          this.getULocation();
        }, 1000);
      }
    }, error => {
      console.log(error);
      this.list = [];
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.list = [];
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  addLike(index: any) {
    console.log(this.list[index]);
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      if (this.list[index].liked == true) {
        console.log('remove like');
        this.util.show();
        this.api.post_private('v1/favourite/deleteLikes', { "uid": localStorage.getItem('uid'), "store_uid": this.list[index].uid, "status": 1 }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.list[index].liked = false;
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
      } else {
        console.log('add like');
        this.util.show();
        this.api.post_private('v1/favourite/create', { "uid": localStorage.getItem('uid'), "store_uid": this.list[index].uid, "status": 1 }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.list[index].liked = true;
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
    } else {
      this.util.navigateToPage('/login');
    }

  }

  getService(id: any) {
    const param: NavigationExtras = {
      queryParams: {
        "id": id
      }
    };
    this.util.navigateToPage('services', param);
  }


  getULocation() {
    let map: any;

    let markersOnMap: any[] = [];
    this.list.forEach((element) => {
      const obj = {
        placeName: element.name,
        cover: this.api.mediaURL + element.cover,
        LatLng: [
          {
            lat: parseFloat(element.lat),
            lng: parseFloat(element.lng)
          }
        ]
      };
      markersOnMap.push(obj);
    });
    var InforObj: any = [];
    var centerCords = {
      lat: parseFloat(localStorage.getItem('lat') ?? ''),
      lng: parseFloat(localStorage.getItem('lng') ?? '')
    };
    initMap();

    function addMarker() {
      for (var i = 0; i < markersOnMap.length; i++) {
        var contentString = '<div id="content"><h1>' + markersOnMap[i].placeName +
          '</h1></div>';
        const icon = {
          url: markersOnMap[i].cover,
          scaledSize: new google.maps.Size(30, 30), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(0, 0), // anchor
          shape: { coords: [17, 17, 18], type: 'circle' },
        };
        console.log(markersOnMap[i].LatLng[0]);
        const marker = new google.maps.Marker({
          position: markersOnMap[i].LatLng[0],
          map: map,
          animation: google.maps.Animation.DROP,
          icon: icon,
        });

        const infowindow = new google.maps.InfoWindow({
          content: contentString,
          maxWidth: 200
        });

        marker.addListener('click', function () {
          closeOtherInfo();
          infowindow.open(marker.get('map'), marker);
          InforObj[0] = infowindow;
        });

      }

      const userIcon = {
        url: 'assets/imgs/location.png',
        scaledSize: new google.maps.Size(40, 40), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
      }

      const marker = new google.maps.Marker({
        position: centerCords,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: userIcon,
      });
    }

    function closeOtherInfo() {
      if (InforObj.length > 0) {
        InforObj[0].set("marker", null);
        InforObj[0].close();
        InforObj.length = 0;
      }
    }

    function initMap() {
      var style = [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: [
            { saturation: -100 }
          ]
        }
      ];

      var mapOptions = {
        zoom: 9,
        scaleControl: false,
        streetViewControl: false,
        zoomControl: false,
        overviewMapControl: false,
        center: centerCords,
        mapTypeControl: false,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'initappz']
        },
        disableDefaultUI: true
      }

      map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var mapType = new google.maps.StyledMapType(style, { name: 'Grayscale' });
      const cityCircle = new google.maps.Circle({
        strokeColor: "#3880ff",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3880ff",
        fillOpacity: 0.35,
        map,
        center: centerCords,
        radius: Math.sqrt(50000) * 100,
      });
      map.mapTypes.set('initappz', mapType);
      map.setMapTypeId('initappz');
      addMarker();
    }

  }

}
