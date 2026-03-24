import './style.css';
import { TemplateEngine, type PageInfo } from '@/components/template';
import { i18n } from '@/components/i18n';
import { runMigrations } from '@/components/migration';
import { ProfileManager } from '@/components/profiles';

class ShareCanePopup {
  private templateInput: HTMLTextAreaElement;
  private previewArea: HTMLDivElement;
  private copyButton: HTMLButtonElement;
  private copyStatus: HTMLSpanElement;
  private pageInfoArea: HTMLDivElement;
  private langToggleButton: HTMLButtonElement;
  private profileTabs: HTMLUListElement;
  private newProfileForm: HTMLDivElement;
  private newProfileNameInput: HTMLInputElement;
  private confirmNewProfileBtn: HTMLButtonElement;
  private cancelNewProfileBtn: HTMLButtonElement;

  private currentPageInfo: PageInfo | null = null;
  private renderedContent: string = '';
  private profileManager: ProfileManager = new ProfileManager();

  constructor() {
    this.templateInput = document.querySelector('#template')!;
    this.previewArea = document.querySelector('#preview')!;
    this.copyButton = document.querySelector('#copy-btn')!;
    this.copyStatus = document.querySelector('#copy-status')!;
    this.pageInfoArea = document.querySelector('#page-info')!;
    this.langToggleButton = document.querySelector('#lang-toggle')!;
    this.profileTabs = document.querySelector('#profile-tabs')!;
    this.newProfileForm = document.querySelector('#new-profile-form')!;
    this.newProfileNameInput = document.querySelector('#new-profile-name')!;
    this.confirmNewProfileBtn = document.querySelector('#confirm-new-profile')!;
    this.cancelNewProfileBtn = document.querySelector('#cancel-new-profile')!;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // マイグレーションを最初に実行（v0.1.x → v0.2.0 のデータ移行を含む）
    await runMigrations();
    await i18n.loadLocaleFromStorage();
    await this.profileManager.load();

    this.updateUITexts();
    this.renderProfileTabs();
    this.initializeEventListeners();
    this.loadPageInfo();
    this.loadActiveProfileTemplate();
  }

  private updateUITexts(): void {
    document.title = i18n.t('title');
    const titleElement = document.querySelector('.title');
    if (titleElement) titleElement.textContent = i18n.t('title');

    const templateLabel = document.querySelector('label[for="template"]');
    if (templateLabel) templateLabel.textContent = i18n.t('shareTemplate');

    const previewLabel = document.querySelector('label[for="preview"]');
    if (previewLabel) previewLabel.textContent = i18n.t('preview');

    this.templateInput.placeholder = i18n.t('templatePlaceholder');
    this.copyButton.textContent = i18n.t('copy');

    const exampleSummary = document.querySelector('details summary');
    if (exampleSummary) exampleSummary.textContent = i18n.t('exampleToggle');

    const exampleContent = document.querySelector('details .content');
    if (exampleContent) {
      exampleContent.textContent = '';
      const examples = [
        { label: i18n.t('basicInfo'), content: '{{ title }}、{{ url }}、{{ domain }}' },
        { label: i18n.t('metaInfo'), content: '{{ meta.description }}、{{ meta.keywords }}、{{ meta.author }}' },
        { label: i18n.t('ogpInfo'), content: '{{ og.title }}、{{ og.description }}、{{ og.url }}、{{ og.site_name }}' },
        { label: i18n.t('twitterCard'), content: '{{ og.twitter_card }}、{{ og.twitter_site }}' }
      ];
      examples.forEach(example => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = example.label + ': ';
        p.appendChild(strong);
        p.appendChild(document.createTextNode(example.content));
        exampleContent.appendChild(p);
      });
    }

    const pageInfoSummary = document.querySelector('div.field:last-child details summary');
    if (pageInfoSummary) pageInfoSummary.textContent = i18n.t('pageInfo');

    this.langToggleButton.textContent = i18n.getLocale() === 'ja' ? 'EN' : '日本語';

    // 新規プロファイルフォームのテキストを更新
    this.newProfileNameInput.placeholder = i18n.t('newProfilePlaceholder');
    this.confirmNewProfileBtn.textContent = i18n.t('newProfileCreate');
    this.cancelNewProfileBtn.textContent = i18n.t('newProfileCancel');
  }

  // -------------------------
  // プロファイルタブ
  // -------------------------

  /**
   * プロファイルタブを再描画する。
   * プロファイルの追加・削除・切り替え後に呼び出す。
   */
  private renderProfileTabs(): void {
    this.profileTabs.textContent = '';

    for (const profile of this.profileManager.getProfiles()) {
      const li = document.createElement('li');
      if (profile.id === this.profileManager.getActiveId()) {
        li.classList.add('is-active');
      }

      const a = document.createElement('a');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = profile.name;
      nameSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startRenameProfile(profile.id, nameSpan);
      });
      a.appendChild(nameSpan);

      // タブ内の削除ボタン（Bulma .delete）
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete is-small ml-1';
      deleteBtn.setAttribute('aria-label', profile.name);
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDeleteProfile(profile.id);
      });
      a.appendChild(deleteBtn);

      a.addEventListener('click', () => {
        this.handleSwitchProfile(profile.id);
      });

      li.appendChild(a);
      this.profileTabs.appendChild(li);
    }

    // 「+」タブ（新規作成）
    const addLi = document.createElement('li');
    const addA = document.createElement('a');
    addA.textContent = '+';
    addA.addEventListener('click', () => {
      this.showNewProfileForm();
    });
    addLi.appendChild(addA);
    this.profileTabs.appendChild(addLi);
  }

  /**
   * タブ名をインライン編集モードに切り替える。
   * Enter / blur で確定、Escape でキャンセル。
   */
  private startRenameProfile(id: string, nameSpan: HTMLSpanElement): void {
    const originalName = nameSpan.textContent ?? '';

    const input = document.createElement('input');
    input.className = 'input is-small';
    input.value = originalName;
    // 文字数に応じた最低限の幅を確保
    input.style.minWidth = '8ch';
    input.style.width = `${Math.max(originalName.length, 4)}ch`;
    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    const commit = async () => {
      await this.profileManager.rename(id, input.value);
      this.renderProfileTabs();
    };

    const cancel = () => {
      this.renderProfileTabs();
    };

    input.addEventListener('blur', commit);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.removeEventListener('blur', commit);
        commit();
      } else if (e.key === 'Escape') {
        input.removeEventListener('blur', commit);
        cancel();
      }
    });
  }

  private async handleSwitchProfile(id: string): Promise<void> {
    if (id === this.profileManager.getActiveId()) return;
    await this.profileManager.setActive(id);
    this.renderProfileTabs();
    this.loadActiveProfileTemplate();
  }

  private async handleDeleteProfile(id: string): Promise<void> {
    const profiles = this.profileManager.getProfiles();

    // 最後の 1 件かつテンプレートに内容がある場合は削除しない
    if (profiles.length === 1 && profiles[0].template.trim() !== '') return;

    // 最後の 1 件（テンプレートが空）を削除しようとする場合は先に空のプロファイルを作成して 0 件を防ぐ
    if (profiles.length === 1) {
      await this.profileManager.create(i18n.t('newProfileDefaultName'));
    }
    await this.profileManager.delete(id);
    this.renderProfileTabs();
    this.loadActiveProfileTemplate();
  }

  // -------------------------
  // 新規プロファイルフォーム
  // -------------------------

  private showNewProfileForm(): void {
    this.newProfileForm.classList.remove('is-hidden');
    this.newProfileNameInput.value = '';
    this.newProfileNameInput.focus();
  }

  private hideNewProfileForm(): void {
    this.newProfileForm.classList.add('is-hidden');
  }

  private async handleCreateNewProfile(): Promise<void> {
    const name = this.newProfileNameInput.value.trim();
    if (!name) return;
    await this.profileManager.create(name);
    this.renderProfileTabs();
    this.loadActiveProfileTemplate();
    this.hideNewProfileForm();
  }

  // -------------------------
  // テンプレート読み書き
  // -------------------------

  private loadActiveProfileTemplate(): void {
    const active = this.profileManager.getActiveProfile();
    this.templateInput.value = active?.template ?? '';
    this.updatePreview();
  }

  private saveTemplate(): void {
    const active = this.profileManager.getActiveProfile();
    if (active) {
      this.profileManager.updateTemplate(active.id, this.templateInput.value);
    }
  }

  // -------------------------
  // イベントリスナー
  // -------------------------

  private initializeEventListeners(): void {
    this.templateInput.addEventListener('input', () => {
      this.updatePreview();
      this.saveTemplate();
    });

    this.copyButton.addEventListener('click', () => {
      this.copyToClipboard();
    });

    this.langToggleButton.addEventListener('click', () => {
      this.toggleLanguage();
    });

    this.confirmNewProfileBtn.addEventListener('click', () => {
      this.handleCreateNewProfile();
    });

    this.cancelNewProfileBtn.addEventListener('click', () => {
      this.hideNewProfileForm();
    });

    this.newProfileNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleCreateNewProfile();
      if (e.key === 'Escape') this.hideNewProfileForm();
    });
  }

  // -------------------------
  // ページ情報
  // -------------------------

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
      this.pageInfoArea.textContent = i18n.t('loading');
      this.previewArea.textContent = i18n.t('loading');
    }
  }

  private displayPageInfo(): void {
    if (!this.currentPageInfo) return;

    const info = this.currentPageInfo;
    this.pageInfoArea.textContent = '';

    const basicSection = this.createInfoSection(i18n.t('basicInfo'), [
      { key: 'title', value: info.title },
      { key: 'url', value: info.url },
      { key: 'domain', value: info.domain }
    ]);
    this.pageInfoArea.appendChild(basicSection);

    const metaInfo = info.meta;
    if (Object.keys(metaInfo).length > 0) {
      const metaEntries = Object.entries(metaInfo).map(([key, value]) => ({ key: `meta.${key}`, value }));
      this.pageInfoArea.appendChild(this.createInfoSection(i18n.t('metaInfo'), metaEntries));
    }

    const ogEntries = Object.entries(info.og)
      .filter(([key, value]) => value && !key.startsWith('twitter_'))
      .map(([key, value]) => ({ key: `og.${key}`, value }));
    if (ogEntries.length > 0) {
      this.pageInfoArea.appendChild(this.createInfoSection(i18n.t('ogpInfo'), ogEntries));
    }

    const twitterEntries = Object.entries(info.og)
      .filter(([key, value]) => value && key.startsWith('twitter_'))
      .map(([key, value]) => ({ key: `og.${key}`, value }));
    if (twitterEntries.length > 0) {
      this.pageInfoArea.appendChild(this.createInfoSection(i18n.t('twitterCard'), twitterEntries));
    }
  }

  private createInfoSection(title: string, entries: { key: string; value: string }[]): HTMLDivElement {
    const section = document.createElement('div');
    section.className = 'info-section';

    const titleElement = document.createElement('strong');
    titleElement.textContent = title + ':';
    section.appendChild(titleElement);

    entries.forEach(entry => {
      const div = document.createElement('div');
      const keyElement = document.createElement('strong');
      keyElement.textContent = entry.key + ': ';
      div.appendChild(keyElement);
      div.appendChild(document.createTextNode(entry.value));
      section.appendChild(div);
    });

    return section;
  }

  // -------------------------
  // プレビュー・コピー
  // -------------------------

  private updatePreview(): void {
    const template = this.templateInput.value.trim();

    if (!template) {
      this.previewArea.textContent = i18n.t('previewPlaceholder');
      this.copyButton.disabled = true;
      return;
    }

    if (!this.currentPageInfo) {
      this.previewArea.textContent = i18n.t('loading');
      this.copyButton.disabled = true;
      return;
    }

    try {
      this.renderedContent = TemplateEngine.render(template, this.currentPageInfo);
      this.displayRenderedContent(this.renderedContent);
      this.copyButton.disabled = false;
    } catch (error) {
      console.error('Template rendering failed:', error);
      this.previewArea.textContent = i18n.t('copyError');
      this.copyButton.disabled = true;
    }
  }

  private displayRenderedContent(content: string): void {
    this.previewArea.textContent = '';
    const parts = content.split('<br>');
    parts.forEach((part, index) => {
      if (index > 0) {
        this.previewArea.appendChild(document.createElement('br'));
      }
      this.previewArea.appendChild(document.createTextNode(part));
    });
  }

  private async copyToClipboard(): Promise<void> {
    try {
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

  // -------------------------
  // 言語切り替え
  // -------------------------

  private async toggleLanguage(): Promise<void> {
    const newLocale = i18n.getLocale() === 'ja' ? 'en' : 'ja';
    i18n.setLocale(newLocale);
    await i18n.saveLocaleToStorage();
    this.updateUITexts();
    if (this.currentPageInfo) {
      this.displayPageInfo();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ShareCanePopup();
});
