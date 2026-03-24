// プロファイル管理モジュール
// プロファイルは複数の共有テンプレートを名前付きで管理する機能です。

export interface Profile {
  id: string;
  name: string;
  template: string;
}

const KEY_PROFILES = 'profiles';
const KEY_ACTIVE = 'activeProfileId';

export class ProfileManager {
  private profiles: Profile[] = [];
  private activeId: string | null = null;

  /**
   * ストレージからプロファイル一覧とアクティブIDを読み込む。
   * runMigrations() の後に呼び出すこと。
   */
  async load(): Promise<void> {
    const result = await browser.storage.local.get([KEY_PROFILES, KEY_ACTIVE]);
    this.profiles = (result[KEY_PROFILES] as Profile[]) ?? [];
    this.activeId = (result[KEY_ACTIVE] as string) ?? null;
  }

  private async persist(): Promise<void> {
    await browser.storage.local.set({
      [KEY_PROFILES]: this.profiles,
      [KEY_ACTIVE]: this.activeId,
    });
  }

  /** プロファイル一覧のコピーを返す */
  getProfiles(): Profile[] {
    return [...this.profiles];
  }

  /** アクティブなプロファイルを返す。存在しない場合は null */
  getActiveProfile(): Profile | null {
    return this.profiles.find(p => p.id === this.activeId) ?? null;
  }

  /** アクティブなプロファイルの ID を返す */
  getActiveId(): string | null {
    return this.activeId;
  }

  /**
   * 新しいプロファイルを作成してアクティブにする。
   * @param name プロファイル名
   */
  async create(name: string): Promise<Profile> {
    const profile: Profile = { id: crypto.randomUUID(), name, template: '' };
    this.profiles.push(profile);
    this.activeId = profile.id;
    await this.persist();
    return profile;
  }

  /**
   * 指定した ID のプロファイルをアクティブにする。
   */
  async setActive(id: string): Promise<void> {
    if (this.profiles.some(p => p.id === id)) {
      this.activeId = id;
      await this.persist();
    }
  }

  /**
   * アクティブなプロファイルのテンプレートを更新する。
   */
  async updateTemplate(id: string, template: string): Promise<void> {
    const profile = this.profiles.find(p => p.id === id);
    if (profile) {
      profile.template = template;
      await this.persist();
    }
  }

  /**
   * プロファイル名を変更する。
   * @param id 対象プロファイルの ID
   * @param newName 新しい名前（空文字列の場合は何もしない）
   */
  async rename(id: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    const profile = this.profiles.find(p => p.id === id);
    if (profile && trimmed) {
      profile.name = trimmed;
      await this.persist();
    }
  }

  /**
   * プロファイルを削除する。
   * - 削除後は左隣（なければ先頭）をアクティブにする。
   * - 最後の 1 件を削除しようとする場合は、呼び出し側が事前に create() を呼ぶこと。
   *   （0 件になることは想定しない）
   */
  async delete(id: string): Promise<void> {
    const index = this.profiles.findIndex(p => p.id === id);
    if (index === -1) return;

    const wasActive = this.activeId === id;
    this.profiles.splice(index, 1);

    if (wasActive && this.profiles.length > 0) {
      const nextIndex = Math.max(0, index - 1);
      this.activeId = this.profiles[nextIndex].id;
    } else if (this.profiles.length === 0) {
      this.activeId = null;
    }

    await this.persist();
  }
}
