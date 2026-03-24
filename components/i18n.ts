// 翻訳機能を提供するモジュール

import jaTranslations from '@/locales/ja.json';
import enTranslations from '@/locales/en.json';

type Locale = 'ja' | 'en';
type TranslationKeys = typeof jaTranslations;

class I18n {
  private currentLocale: Locale = 'ja';
  private translations: Map<Locale, TranslationKeys> = new Map([
    ['ja', jaTranslations],
    ['en', enTranslations],
  ]);

  // ブラウザの言語設定から適切なロケールを検出
  detectLocale(): Locale {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    return 'ja'; // デフォルトは日本語
  }

  // 現在のロケールを設定
  setLocale(locale: Locale): void {
    this.currentLocale = locale;
  }

  // 現在のロケールを取得
  getLocale(): Locale {
    return this.currentLocale;
  }

  // 翻訳テキストを取得
  t(key: keyof TranslationKeys): string {
    const translation = this.translations.get(this.currentLocale);
    return translation?.[key] || key;
  }

  // ストレージから言語設定を読み込み
  async loadLocaleFromStorage(): Promise<void> {
    try {
      const result = await browser.storage.local.get('locale');
      if (result.locale && (result.locale === 'ja' || result.locale === 'en')) {
        this.currentLocale = result.locale;
      } else {
        // ストレージに設定がない場合はブラウザの言語を検出
        this.currentLocale = this.detectLocale();
        await this.saveLocaleToStorage();
      }
    } catch (error) {
      console.warn('Failed to load locale from storage:', error);
      this.currentLocale = this.detectLocale();
    }
  }

  // ストレージに言語設定を保存
  async saveLocaleToStorage(): Promise<void> {
    try {
      await browser.storage.local.set({ locale: this.currentLocale });
    } catch (error) {
      console.warn('Failed to save locale to storage:', error);
    }
  }
}

export const i18n = new I18n();
export type { Locale, TranslationKeys };