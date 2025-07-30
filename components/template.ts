export interface OGPInfo {
  title: string;
  description: string;
  url: string;
  image: string;
  site_name: string;
  type: string;
  locale: string;
  twitter_card: string;
  twitter_site: string;
  twitter_creator: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
}

export interface PageInfo {
  title: string;
  url: string;
  domain: string;
  og: OGPInfo;
  meta: { [key: string]: string };
}

export class TemplateEngine {
  /**
   * mustache記法のテンプレートをレンダリングする
   * @param template テンプレート文字列（例: "{{ title }}<br>{{ url }}" または "{{ og.title }}"）
   * @param data データオブジェクト
   * @returns レンダリング結果
   */
  static render(template: string, data: PageInfo): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9._]+)\s*\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined && value !== '' ? String(value) : match;
    });
  }

  /**
   * ネストされたオブジェクトから値を取得する
   * @param obj オブジェクト
   * @param path パス（例: "og.title"）
   * @returns 値
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * テンプレートから使用可能な変数を抽出する
   * @param template テンプレート文字列
   * @returns 使用されている変数名の配列
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(/\{\{\s*([a-zA-Z0-9._]+)\s*\}\}/g);
    if (!matches) return [];
    
    return matches.map(match => {
      const variable = match.replace(/\{\{\s*|\s*\}\}/g, '');
      return variable;
    }).filter((value, index, self) => self.indexOf(value) === index); // 重複除去
  }

  /**
   * 利用可能な変数のリストを取得する
   */
  static getAvailableVariables(): { key: string; description: string }[] {
    return [
      // 基本のページ情報
      { key: 'title', description: 'ページのタイトル' },
      { key: 'url', description: 'ページのURL' },
      { key: 'domain', description: 'URLのうちドメイン部分' },
      
      // Meta情報（よく使われるもの）
      { key: 'meta.description', description: 'meta説明文（meta description）' },
      { key: 'meta.keywords', description: 'metaキーワード（meta keywords）' },
      { key: 'meta.author', description: 'meta著者（meta author）' },
      { key: 'meta.date', description: 'meta日付（meta date）' },
      { key: 'meta.copyright', description: 'meta著作権（meta copyright）' },
      { key: 'meta.language', description: 'meta言語（meta language）' },
      { key: 'meta.robots', description: 'meta robots設定（meta robots）' },
      { key: 'meta.generator', description: 'metaジェネレーター（meta generator）' },
      { key: 'meta.fediverse_creator', description: 'Fediverse作成者（meta fediverse:creator）' },
      { key: 'meta.article_published_time', description: '記事公開時間（article:published_time）' },
      { key: 'meta.article_author', description: '記事著者（article:author）' },
      
      // OGP情報
      { key: 'og.title', description: 'OGタイトル' },
      { key: 'og.description', description: 'OG説明文' },
      { key: 'og.url', description: 'OG URL' },
      { key: 'og.image', description: 'OG画像URL' },
      { key: 'og.site_name', description: 'OGサイト名' },
      { key: 'og.type', description: 'OGタイプ' },
      { key: 'og.locale', description: 'OGロケール' },
      
      // Twitter Card情報
      { key: 'og.twitter_card', description: 'Twitterカードタイプ' },
      { key: 'og.twitter_site', description: 'Twitterサイト' },
      { key: 'og.twitter_creator', description: 'Twitter作成者' },
      { key: 'og.twitter_title', description: 'Twitterタイトル' },
      { key: 'og.twitter_description', description: 'Twitter説明文' },
      { key: 'og.twitter_image', description: 'Twitter画像URL' }
    ];
  }
}