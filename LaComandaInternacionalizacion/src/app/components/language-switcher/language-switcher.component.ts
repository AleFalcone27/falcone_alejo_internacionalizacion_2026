import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

interface LanguageOption {
  code: string;
  flag: string;
  label: string;
}

const LANGUAGE_STORAGE_KEY = 'appLang';
const DEFAULT_LANG = 'es';

@Component({
  standalone: true,
  selector: 'app-language-switcher',
  imports: [CommonModule, IonicModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent {
  isOpen = false;

  languages: LanguageOption[] = [
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'pt', flag: '🇵🇹', label: 'Português' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  ];

  constructor(private translate: TranslateService) {}

  get currentLang(): string {
    return this.translate.getCurrentLang() ?? DEFAULT_LANG;
  }

  isDefaultActive(): boolean {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === null;
  }

  currentFlag(): string {
    if (this.isDefaultActive()) {
      return '🌐';
    }
    return this.languages.find(l => l.code === this.currentLang)?.flag ?? '🌐';
  }

  selectDefault() {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    this.translate.use(DEFAULT_LANG);
    this.isOpen = false;
  }

  selectLanguage(code: string) {
    this.translate.use(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    this.isOpen = false;
  }
}
