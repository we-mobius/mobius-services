const PUBLIC_PATH = '/' // '/board/'
// https://fonts.googleapis.com/
//  -> https://fonts.googleapis.cnpmjs.org/
//  -> https://fonts.dogedoge.com/
const CSS_CDN_ORIGIN = 'https://fonts.googleapis.cnpmjs.org/'

module.exports = {
  template: {
    index: {
      title: 'Hello Mobius JS!',
      whisper: 'The owner is looking for a job as a product manager | business manager \\n             For a quickest preview of his info, check https://www.cigaret.world',
      fonts: [
        `${PUBLIC_PATH}statics/fonts/Workbench[wdth,wght].woff2`,
        `${PUBLIC_PATH}statics/fonts/Sixtyfour[wdth,wght].woff2`
      ],
      asyncCss: [
        `${CSS_CDN_ORIGIN}css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Sans+SC:wght@100;300;400;500;700;900&display=swap`,
        `${CSS_CDN_ORIGIN}css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;900&display=swap`
      ],
      css: [],
      scripts: [],
      favicon: `${PUBLIC_PATH}statics/favicons/thoughts-daily.icon.png`,
      headHtmlSnippet: `
        <style>
          body { developer: cigaret; wechat: cigaret_bot; email: kcigaret@outlook.com; }
        </style>
      `,
      bodyHtmlSnippet: `
        <div id="mobius-app" class="w-full h-64 flex justify-around items-center">
          <span class="text-6xl">Mobius Project Template!</span>
        </div>
        <div class="w-full flex justify-around items-center">
          <div class="w-1/4 h-48 svg-smallerthan5KB"></div>
          <div class="w-1/4 h-48 svg-biggerthan5KB"></div>
        </div>
      `,
      // from: https://analytics.google.com/analytics/web/
      googleAnalytics: {
        trackingId: false // UA-XXXX-XX
      },
      // from: https://tongji.baidu.com/sc-web/
      baiduAnalytics: {
        trackingId: false // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      }
    }
  }
}
