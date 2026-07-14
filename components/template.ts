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
}