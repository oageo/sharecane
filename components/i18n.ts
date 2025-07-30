// 翻訳機能を提供するモジュール

type Locale = 'ja' | 'en';
type TranslationKeys = {
  title: string;
  shareTemplate: string;
  templatePlaceholder: string;
  exampleToggle: string;
  basicInfo: string;
  metaInfo: string;
  ogpInfo: string;
  twitterCard: string;
  preview: string;
  previewPlaceholder: string;
  copy: string;
  pageInfo: string;
  loading: string;
  copied: string;
  copyError: string;
};

class I18n {
  private currentLocale: Locale = 'ja';
  private translations: Map<Locale, TranslationKeys> = new Map();

  constructor() {
    // デフォルトの翻訳データを設定
    this.translations.set('ja', {
      title: 'ShareCane',
      shareTemplate: '共有テンプレート',
      templatePlaceholder: '例: {{ title }}<br>{{ url }}',
      exampleToggle: '一例を表示',
      basicInfo: '基本情報',
      metaInfo: 'Metaタグ情報',
      ogpInfo: 'OGP情報',
      twitterCard: 'Twitter Card',
      preview: 'プレビュー',
      previewPlaceholder: 'テンプレートを入力してください',
      copy: 'コピー',
      pageInfo: 'ページ情報',
      loading: '読み込み中…',
      copied: 'コピーしました',
      copyError: 'エラー'
    });

    this.translations.set('en', {
      title: 'ShareCane',
      shareTemplate: 'Share Template',
      templatePlaceholder: 'Example: {{ title }}<br>{{ url }}',
      exampleToggle: 'Show Examples',
      basicInfo: 'Basic Info',
      metaInfo: 'Meta Tags',
      ogpInfo: 'OGP Info',
      twitterCard: 'Twitter Card',
      preview: 'Preview',
      previewPlaceholder: 'Please enter a template',
      copy: 'Copy',
      pageInfo: 'Page Info',
      loading: 'Loading...',
      copied: 'Copied!',
      copyError: 'Error'
    });
  }

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