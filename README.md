# sharecane - share addon can editable
![GitHub License](https://img.shields.io/github/license/oageo/sharecane)

## 特徴
ブラウザの「共有」ボタンを超えて様々なスタイルで、情報をSNS等へシェア出来るようになります

* [mustache記法](https://mustache.github.io/)を用いたシンプルなテンプレートを作成できます。例示を見るだけですぐにテンプレートの作り方が理解できるでしょう。
* 多言語に対応しております。現在は日本語と英語に対応しており、万が一翻訳テキストが存在しない場合は日本語にフォールバックするようになっております。

## 例
以下のようなWebサイトの場合を考えます。URLは`https://www.osumiakari.jp/articles/20250729-yamadalinesuspension/`とします。

```html
<!DOCTYPE html>
<html lang="ja" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nuxt/Contentから11tyへ切り替えた - osumiakari.jp</title>
    <meta name="description" content="Claude Code様にお世話になることにより懸案をいい感じに解決">
    <meta property="og:title" content="Nuxt/Contentから11tyへ切り替えた">
    <meta property="og:description" content="Claude Code様にお世話になることにより懸案をいい感じに解決">
    <meta property="og:type" content="article">
    <meta name="fediverse:creator" content="@oageo@c.osumiakari.jp">
    <meta name="twitter:creator" content="@Kig_OsumiAkari">
    <meta property="og:url" content="https://www.osumiakari.jp/articles/20250724-change-to-11ty/">
    <meta property="og:image" content="https://www.osumiakari.jp/icon.png">
    <meta property="og:site_name" content="Osumi Akari.jp">
    <meta name="twitter:card" content="summary">
    <link rel="alternate" type="application/rss+xml" href=https://www.osumiakari.jp/feed.xml title="OsumiAkari.jp" />
    <meta name="theme-color" content="#14161a">
    <link rel="stylesheet" href="/bulma/css/bulma.min.css">
</head>
<body>
    <nav class="navbar is-black" role="navigation">
    </nav>
    ...
</body>
```

この場合において、取得できる情報は以下の通りとなります。

* `title`: Nuxt/Contentから11tyへ切り替えた - osumiakari.jp
* `url`: https://www.osumiakari.jp/articles/20250724-change-to-11ty/
* `domain`: www.osumiakari.jp
* `meta.viewport`: width=device-width, initial-scale=1
* `meta.description`: Claude Code様にお世話になることにより懸案をいい感じに解決
* `meta.fediverse_creator`: @oageo@c.osumiakari.jp
* `meta.twitter_creator`: @Kig_OsumiAkari
* `meta.twitter_card`: summary
* `meta.theme_color`: #14161a
* `og.title`: Nuxt/Contentから11tyへ切り替えた
* `og.description`: Claude Code様にお世話になることにより懸案をいい感じに解決
* `og.url`: https://www.osumiakari.jp/articles/20250724-change-to-11ty/
* `og.image`: https://www.osumiakari.jp/icon.png
* `og.site_name`: Osumi Akari.jp
* `og.type`: article
* `og.twitter_card`: summary
* `og.twitter_creator`: @Kig_OsumiAkari

これらの情報を用いて、様々な共有文章テンプレートを作成することが可能です。

| テンプレート例 | 出力結果 |
| ---- | ---- |
| `{{ title }}<br>{{ url }}` | Nuxt/Contentから11tyへ切り替えた - osumiakari.jp<br>https://www.osumiakari.jp/articles/20250724-change-to-11ty/ |
| `{{ og.site_name }} - {{ og.title }} / {{ url }} by {{ og.twitter_creator }}` | Osumi Akari.jp - Nuxt/Contentから11tyへ切り替えた / https://www.osumiakari.jp/articles/20250724-change-to-11ty/ by @Kig_OsumiAkari |
| `{{ og.title }} on {{og.site_name}} {{ url }} #oapicks #blog #{{ og.type }}` | Nuxt/Contentから11tyへ切り替えた on Osumi Akari.jp https://www.osumiakari.jp/articles/20250724-change-to-11ty/ #oapicks #blog #article |
| `このサイト（{{ domain }}）のビューポートとしては「{{ meta.viewport }}」が指定されています。いい感じですね。` | このサイト（www.osumiakari.jp）のビューポートとしては「width=device-width, initial-scale=1」が指定されています。いい感じですね。 |

## ロゴ
![sharecane logo](https://raw.githubusercontent.com/oageo/sharecane/main/public/sharecane.svg)

Inkscapeを用いて5分で作りました。先進的なデザインを目指そうと努力を行いました。

## 作者
[Osumi Akari](https://www.osumiakari.jp)

[贈与に関するページ](https://www.osumiakari.jp/gift/)から様々な形でご支援をいただけますと大変励みになりますので、検討いただけますと幸いです。

