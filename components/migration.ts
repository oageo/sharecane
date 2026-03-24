// ストレージのスキーマバージョン管理とマイグレーション
//
// ストレージバージョンはパッケージバージョンとは独立した内部カウンターです。
// 対応表:
//   storageVersion 0（キーなし）: v0.1.1 以前（template キーで単一文字列保存）
//   storageVersion 1           : v0.2.0 以降（profiles 配列で複数プロファイル保存）
//
// 新しいマイグレーションを追加する場合:
//   1. CURRENT_STORAGE_VERSION をインクリメントする
//   2. 対応するマイグレーション関数を追加する（例: migrateV020toV030）
//   3. runMigrations() 内に適切な if ブロックを追加する

export const CURRENT_STORAGE_VERSION = 1;

/**
 * 必要なマイグレーションをすべて実行する。
 * アプリ起動時（i18n 読み込みより前）に一度だけ呼び出す。
 */
export async function runMigrations(): Promise<void> {
  const result = await browser.storage.local.get('storageVersion');
  const version: number = result.storageVersion ?? 0;

  if (version < 1) await migrateV010toV020();

  if (version < CURRENT_STORAGE_VERSION) {
    await browser.storage.local.set({ storageVersion: CURRENT_STORAGE_VERSION });
  }
}

/**
 * v0.1.x → v0.2.0: 旧 `template` キーをプロファイル形式に移行する。
 * `template` キーが存在しない場合（新規インストール等）は何もしない。
 */
async function migrateV010toV020(): Promise<void> {
  const result = await browser.storage.local.get(['template', 'locale']);
  if (!result.template) return;

  const profileName = result.locale === 'en' ? 'Default' : 'デフォルト';
  const profile = {
    id: crypto.randomUUID(),
    name: profileName,
    template: result.template as string,
  };

  await browser.storage.local.set({
    profiles: [profile],
    activeProfileId: profile.id,
  });

  await browser.storage.local.remove('template');
}
