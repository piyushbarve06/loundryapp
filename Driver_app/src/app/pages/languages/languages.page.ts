import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.page.html',
  styleUrls: ['./languages.page.scss'],
})
export class LanguagesPage implements OnInit {
  selectedLanguages: any = 'en';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private translate: TranslateService,
  ) {
    this.selectedLanguages = localStorage.getItem('selectedLanguage');
  }

  ngOnInit() {
  }

  changed() {
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

  onBack() {
    this.util.onBack();
  }

}
