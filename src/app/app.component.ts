import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'i18n-app';

  cookie = inject(SsrCookieService);
  languageService = inject(LanguageService);

  cookieLogEffect = effect(() => {
    const lang = this.cookie.check('lang') ? this.cookie.get('lang') : 'en';

    this.languageService.changeLang(lang);
  });
}
