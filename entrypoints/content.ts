export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('ShareCane content script loaded');

    // プロパティ名を正規化する関数（特殊文字をアンダースコアに置換）
    function normalizePropertyName(name: string): string {
      return name.replace(/[^a-zA-Z0-9_.]/g, '_');
    }

    // 指定した属性（name / property）を持つmetaタグから { 属性値, content } の一覧を取得する
    function collectMetaEntries(attribute: 'name' | 'property'): { key: string; content: string }[] {
      const entries: { key: string; content: string }[] = [];
      document.querySelectorAll(`meta[${attribute}]`).forEach(meta => {
        const key = meta.getAttribute(attribute);
        const content = meta.getAttribute('content');
        if (key && content) {
          entries.push({ key, content });
        }
      });
      return entries;
    }

    function isOgOrTwitter(key: string): boolean {
      return key.startsWith('og:') || key.startsWith('twitter:');
    }

    // og:title → title, twitter:card → twitter_card のように変換
    function toOgKey(key: string): string {
      return normalizePropertyName(key.replace(/^og:/, '').replace(/^twitter:/, 'twitter_'));
    }

    // ページ情報を取得する関数
    function getPageInfo() {
      const propertyEntries = collectMetaEntries('property');
      const nameEntries = collectMetaEntries('name');

      const ogInfo: { [key: string]: string } = {};
      const metaInfo: { [key: string]: string } = {};

      // OGP情報: property属性のog:/twitter: → name属性のtwitter: の順（後勝ち）
      for (const { key, content } of propertyEntries) {
        if (isOgOrTwitter(key)) {
          ogInfo[toOgKey(key)] = content;
        }
      }
      for (const { key, content } of nameEntries) {
        if (key.startsWith('twitter:')) {
          ogInfo[toOgKey(key)] = content;
        }
      }

      // Meta情報: name属性すべて → property属性のOGP以外 の順（後勝ち）
      for (const { key, content } of nameEntries) {
        metaInfo[normalizePropertyName(key)] = content;
      }
      for (const { key, content } of propertyEntries) {
        if (!isOgOrTwitter(key)) {
          metaInfo[normalizePropertyName(key)] = content;
        }
      }

      return {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        og: ogInfo,
        meta: metaInfo
      };
    }

    // ポップアップからのメッセージを受信
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'getPageInfo') {
        const pageInfo = getPageInfo();
        console.log('Sending page info:', pageInfo);
        sendResponse(pageInfo);
      }
      return true; // 非同期レスポンスを示す
    });
  },
});
