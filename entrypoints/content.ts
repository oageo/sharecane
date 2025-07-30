export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('ShareCane content script loaded');
    
    // ページ情報を取得する関数
    function getPageInfo() {
      return {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        og: getOGPInfo(),
        meta: getMetaInfo()
      };
    }
    
    // メタタグの内容を取得するヘルパー関数
    function getMetaContent(name: string): string {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta?.getAttribute('content') || '';
    }
    
    // OGP情報を取得する関数
    function getOGPInfo() {
      const ogInfo: { [key: string]: string } = {};
      
      // プロパティ名を正規化する関数（特殊文字をアンダースコアに置換）
      function normalizePropertyName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_.]/g, '_');
      }
      
      // すべてのmeta property属性でog:またはtwitter:で始まるものを取得
      const ogPropertyElements = document.querySelectorAll('meta[property]');
      ogPropertyElements.forEach(meta => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (property && content && (property.startsWith('og:') || property.startsWith('twitter:'))) {
          // og:title → title, twitter:card → twitter_card のように変換
          let normalizedProperty = property.replace(/^og:/, '').replace(/^twitter:/, 'twitter_');
          normalizedProperty = normalizePropertyName(normalizedProperty);
          ogInfo[normalizedProperty] = content;
        }
      });
      
      // すべてのmeta name属性でtwitter:で始まるものも取得
      const twitterNameElements = document.querySelectorAll('meta[name]');
      twitterNameElements.forEach(meta => {
        const name = meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (name && content && name.startsWith('twitter:')) {
          // twitter:card → twitter_card のように変換
          let normalizedName = name.replace(/^twitter:/, 'twitter_');
          normalizedName = normalizePropertyName(normalizedName);
          ogInfo[normalizedName] = content;
        }
      });
      
      return ogInfo;
    }
    
    // Meta情報を取得する関数
    function getMetaInfo() {
      const metaInfo: { [key: string]: string } = {};
      
      // プロパティ名を正規化する関数（特殊文字をアンダースコアに置換）
      function normalizePropertyName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_.]/g, '_');
      }
      
      // すべてのmeta name属性を取得
      const metaNameElements = document.querySelectorAll('meta[name]');
      metaNameElements.forEach(meta => {
        const name = meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (name && content) {
          const normalizedName = normalizePropertyName(name);
          metaInfo[normalizedName] = content;
        }
      });
      
      // meta property属性も取得（OGP以外）
      const metaPropertyElements = document.querySelectorAll('meta[property]');
      metaPropertyElements.forEach(meta => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (property && content && !property.startsWith('og:') && !property.startsWith('twitter:')) {
          const normalizedProperty = normalizePropertyName(property);
          metaInfo[normalizedProperty] = content;
        }
      });
      
      return metaInfo;
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
