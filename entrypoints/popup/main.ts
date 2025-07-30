import './style.css';
import { TemplateEngine, type PageInfo } from '@/components/template';
import { i18n } from '@/components/i18n';

class ShareCanePopup {
  private templateInput: HTMLTextAreaElement;
  private previewArea: HTMLDivElement;
  private copyButton: HTMLButtonElement;
  private copyStatus: HTMLSpanElement;
  private pageInfoArea: HTMLDivElement;
  private langToggleButton: HTMLButtonElement;
  private currentPageInfo: PageInfo | null = null;
  private renderedContent: string = '';

  constructor() {
    this.templateInput = document.querySelector('#template')!;
    this.previewArea = document.querySelector('#preview')!;
    this.copyButton = document.querySelector('#copy-btn')!;
    this.copyStatus = document.querySelector('#copy-status')!;
    this.pageInfoArea = document.querySelector('#page-info')!;
    this.langToggleButton = document.querySelector('#lang-toggle')!;

    this.initializeI18n();
  }

  private async initializeI18n(): Promise<void> {
    await i18n.loadLocaleFromStorage();
    this.updateUITexts();
    this.initializeEventListeners();
    this.loadPageInfo();
    this.loadSavedTemplate();
  }

  private updateUITexts(): void {
    // タイトルを更新
    document.title = i18n.t('title');
    const titleElement = document.querySelector('.title');
    if (titleElement) titleElement.textContent = i18n.t('title');

    // ラベルを更新
    const templateLabel = document.querySelector('label[for="template"]');
    if (templateLabel) templateLabel.textContent = i18n.t('shareTemplate');

    const previewLabel = document.querySelector('label[for="preview"]');
    if (previewLabel) previewLabel.textContent = i18n.t('preview');

    // プレースホルダーを更新
    this.templateInput.placeholder = i18n.t('templatePlaceholder');

    // ボタンテキストを更新
    this.copyButton.textContent = i18n.t('copy');

    // 例の表示を更新
    const exampleSummary = document.querySelector('details summary');
    if (exampleSummary) exampleSummary.textContent = i18n.t('exampleToggle');

    // 例の内容を更新
    const exampleContent = document.querySelector('details .content');
    if (exampleContent) {
      exampleContent.innerHTML = `
        <p><strong>${i18n.t('basicInfo')}:</strong> {{ title }}、{{ url }}、{{ domain }}</p>
        <p><strong>${i18n.t('metaInfo')}:</strong> {{ meta.description }}、{{ meta.keywords }}、{{ meta.author }}</p>
        <p><strong>${i18n.t('ogpInfo')}:</strong> {{ og.title }}、{{ og.description }}、{{ og.url }}、{{ og.site_name }}</p>
        <p><strong>${i18n.t('twitterCard')}:</strong> {{ og.twitter_card }}、{{ og.twitter_site }}</p>
      `;
    }

    // ページ情報セクションのサマリーを更新
    const pageInfoSummary = document.querySelector('div.field:last-child details summary');
    if (pageInfoSummary) pageInfoSummary.textContent = i18n.t('pageInfo');

    // 言語切り替えボタンを更新
    this.langToggleButton.textContent = i18n.getLocale() === 'ja' ? 'EN' : '日本語';
  }

  private initializeEventListeners(): void {
    // テンプレート入力の変更を監視
    this.templateInput.addEventListener('input', () => {
      this.updatePreview();
      this.saveTemplate();
    });

    // コピーボタンのクリック
    this.copyButton.addEventListener('click', () => {
      this.copyToClipboard();
    });

    // 言語切り替えボタンのクリック
    this.langToggleButton.addEventListener('click', () => {
      this.toggleLanguage();
    });
  }

  private async loadPageInfo(): Promise<void> {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('Active tab not found');
      }

      const response = await browser.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
      this.currentPageInfo = response;
      this.displayPageInfo();
      this.updatePreview();
    } catch (error) {
      console.error('Failed to load page info:', error);
      this.pageInfoArea.innerHTML = i18n.t('loading');
      this.previewArea.innerHTML = i18n.t('loading');
    }
  }

  private displayPageInfo(): void {
    if (!this.currentPageInfo) return;

    const info = this.currentPageInfo;
    let html = `
      <div class="info-section">
        <strong>${i18n.t('basicInfo')}:</strong>
        <div><strong>title:</strong> ${this.escapeHtml(info.title)}</div>
        <div><strong>url:</strong> ${this.escapeHtml(info.url)}</div>
        <div><strong>domain:</strong> ${this.escapeHtml(info.domain)}</div>
      </div>
    `;

    // Meta情報がある場合は表示
    const metaInfo = info.meta;
    const hasMetaInfo = Object.keys(metaInfo).length > 0;
    
    if (hasMetaInfo) {
      html += `
        <div class="info-section">
          <strong>${i18n.t('metaInfo')}:</strong>
          ${Object.entries(metaInfo).map(([key, value]) => 
            `<div><strong>meta.${key}:</strong> ${this.escapeHtml(value)}</div>`
          ).join('')}
        </div>
      `;
    }

    // OGP情報がある場合は表示
    const ogInfo = info.og;
    const ogEntries = Object.entries(ogInfo).filter(([key, value]) => value && !key.startsWith('twitter_'));
    
    if (ogEntries.length > 0) {
      html += `
        <div class="info-section">
          <strong>${i18n.t('ogpInfo')}:</strong>
          ${ogEntries.map(([key, value]) => 
            `<div><strong>og.${key}:</strong> ${this.escapeHtml(value)}</div>`
          ).join('')}
        </div>
      `;
    }

    // Twitter Card情報がある場合は表示
    const twitterEntries = Object.entries(ogInfo).filter(([key, value]) => value && key.startsWith('twitter_'));
    
    if (twitterEntries.length > 0) {
      html += `
        <div class="info-section">
          <strong>${i18n.t('twitterCard')}:</strong>
          ${twitterEntries.map(([key, value]) => 
            `<div><strong>og.${key}:</strong> ${this.escapeHtml(value)}</div>`
          ).join('')}
        </div>
      `;
    }

    this.pageInfoArea.innerHTML = html;
  }

  private updatePreview(): void {
    const template = this.templateInput.value.trim();
    
    if (!template) {
      this.previewArea.innerHTML = i18n.t('previewPlaceholder');
      this.copyButton.disabled = true;
      return;
    }

    if (!this.currentPageInfo) {
      this.previewArea.innerHTML = i18n.t('loading');
      this.copyButton.disabled = true;
      return;
    }

    try {
      this.renderedContent = TemplateEngine.render(template, this.currentPageInfo);
      // <br>をHTMLとして表示するため、innerHTML を使用
      this.previewArea.innerHTML = this.renderedContent;
      this.copyButton.disabled = false;
    } catch (error) {
      console.error('Template rendering failed:', error);
      this.previewArea.innerHTML = i18n.t('copyError');
      this.copyButton.disabled = true;
    }
  }

  private async copyToClipboard(): Promise<void> {
    try {
      // HTMLタグを取り除いてプレーンテキストとしてコピー
      const textContent = this.renderedContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(textContent);
      
      this.copyStatus.textContent = i18n.t('copied');
      this.copyStatus.className = 'tag is-success is-small';
      
      setTimeout(() => {
        this.copyStatus.textContent = '';
        this.copyStatus.className = 'tag is-light is-small';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.copyStatus.textContent = i18n.t('copyError');
      this.copyStatus.className = 'tag is-danger is-small';
    }
  }

  private saveTemplate(): void {
    const template = this.templateInput.value;
    browser.storage.local.set({ template });
  }

  private async loadSavedTemplate(): Promise<void> {
    try {
      const result = await browser.storage.local.get('template');
      if (result.template) {
        this.templateInput.value = result.template;
        this.updatePreview();
      } else {
        // デフォルトのテンプレートを設定
        this.templateInput.value = '{{ title }}<br>{{ url }}';
        this.updatePreview();
      }
    } catch (error) {
      console.error('Failed to load saved template:', error);
    }
  }

  private async toggleLanguage(): Promise<void> {
    const currentLocale = i18n.getLocale();
    const newLocale = currentLocale === 'ja' ? 'en' : 'ja';
    
    i18n.setLocale(newLocale);
    await i18n.saveLocaleToStorage();
    
    // UI テキストを再更新
    this.updateUITexts();
    
    // ページ情報表示を再更新
    if (this.currentPageInfo) {
      this.displayPageInfo();
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ポップアップが読み込まれたときに初期化
document.addEventListener('DOMContentLoaded', () => {
  new ShareCanePopup();
});
