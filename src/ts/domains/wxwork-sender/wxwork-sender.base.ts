/**
 * 消息发送频率限制：每个机器人发送的消息不能超过20条/分钟。
 * @see {@link https://developer.work.weixin.qq.com/document/path/91770}
 */

/**
 * @example
 * {
 *   "msgtype": "text",
 *   "text": {
 *     "content": "广州今日天气：29度，大部分多云，降雨概率：60%",
 *     "mentioned_list":["wangqing","@all"],
 *     "mentioned_mobile_list":["13800001111","@all"]
 *   }
 * }
 */
export interface TextMessage {
  /**
   * 消息类型
   */
  msgtype: 'text'
  text: {
    /**
     * 文本内容，最长不超过 2048 个字节，必须是 utf8 编码
     */
    content: string
    /**
     * userid 的列表，提醒群中的指定成员（@某个成员），`@all` 表示提醒所有人，如果开发者获取不到 userid，可以使用 mentioned_mobile_list
     */
    mentioned_list?: string[]
    /**
     * 手机号列表，提醒手机号对应的群成员（@某个成员），`@all` 表示提醒所有人
     */
    mentioned_mobile_list?: string[]
  }
}

/**
 * @example
 * {
 *   "msgtype": "markdown",
 *   "markdown": {
 *     "content": `实时新增用户反馈<font color=\"warning\">132例</font>，请相关同事注意。\n
 *      >类型:<font color=\"comment\">用户反馈</font>
 *      >普通用户反馈:<font color=\"comment\">117例</font>
 *      >VIP用户反馈:<font color=\"comment\">15例</font>`
 *   }
 * }
 */
export interface MarkdownMessage {
  /**
   * 消息类型
   */
  msgtype: 'markdown'
  markdown: {
    /**
     * markdown 内容，最长不超过 4096 个字节，必须是 utf8 编码
     */
    content: string
  }
}

/**
 * 图片（base64 编码前）最大不能超过 2M，支持 JPG、PNG 格式
 * @example
 * {
 *   "msgtype": "image",
 *   "image": {
 *     "base64": "DATA",
 *     "md5": "MD5"
 *   }
 * }
 */
export interface ImageMessage {
  /**
   * 消息类型
   */
  msgtype: 'image'
  image: {
    /**
     * 图片内容的 base64 编码
     */
    base64: string
    /**
     * 图片内容（base64 编码前）的 md5 值
     */
    md5: string
  }
}

/**
 * @example
 * {
 *   "msgtype": "news",
 *   "news": {
 *     "articles" : [
 *       {
 *         "title" : "中秋节礼品领取",
 *         "description" : "今年中秋节公司有豪礼相送",
 *         "url" : "www.qq.com",
 *         "picurl" : "http://res.mail.qq.com/node/ww/wwopenmng/images/independent/doc/test_pic_msg1.png"
 *       }
 *     ]
 *   }
 * }
 */
export interface ArticleMessage {
  /**
   * 消息类型
   */
  msgtype: 'news'
  news: {
    /**
     * 图文消息，一个图文消息支持 1 到 8 条图文
     */
    articles: Array<{
      /**
       * 标题，不超过 128 个字节，超过会自动截断
       */
      title: string
      /**
       * 描述，不超过 512 个字节，超过会自动截断
       */
      description?: string
      /**
       * 点击后跳转的链接。
       */
      url: string
      /**
       * 图文消息的图片链接，支持 JPG、PNG 格式，较好的效果为大图 1068*455，小图 150*150
       */
      picurl?: string
    }>
  }
}

/**
 * @example
 * {
 *   "msgtype": "file",
 *   "file": {
 *   "media_id": "3a8asd892asd8asd"
 *   }
 * }
 */
export interface FileMessage {
  /**
   * 消息类型
   */
  msgtype: 'file'
  file: {
    /**
     * 文件 id，通过文件上传接口获取
     * @see {@link https://developer.work.weixin.qq.com/document/path/91770#%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%E6%8E%A5%E5%8F%A3}
     */
    media_id: string
  }
}

export interface TextNoticeTemplateCard {
  /**
   * 模版卡片的模版类型，文本通知模版卡片的类型为 `text_notice`
   */
  card_type: 'text_notice'
  /**
   * 卡片来源样式信息，不需要来源样式可不填写
   */
  source?: {
    /**
     * 来源图片的 url
     */
    icon_url?: string
    /**
     * 来源图片的描述，建议不超过 13 个字
     */
    desc?: string
    /**
     * 来源文字的颜色，目前支持：0（默认）灰色，1 黑色，2 红色，3 绿色
     */
    desc_color?: 0 | 1 | 2 | 3
  }
  /**
   * 模版卡片的主要内容，包括一级标题和标题辅助信息
   */
  main_title: {
    /**
     * 一级标题，建议不超过 26 个字。模版卡片主要内容的一级标题 `main_title.title` 和二级普通文本 `sub_title_text` 必须有一项填写
     */
    title?: string
    /**
     * 标题辅助信息，建议不超过 30 个字
     */
    desc?: string
  }
  /**
   * 关键数据样式
   */
  emphasis_content?: {
    /**
     * 关键数据样式的数据内容，建议不超过 10 个字
     */
    title?: string
    /**
     * 关键数据样式的数据描述内容，建议不超过 15 个字
     */
    desc?: string
  }
  /**
   * 引用文献样式，建议不与关键数据共用
   */
  quote_area?: {
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，0 或不填代表没有点击事件
     */
    type: 0
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，1 代表跳转 url
     */
    type: 1
    /**
     * 点击跳转的 url
     */
    url: string
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，2 代表跳转小程序
     */
    type: 2
    /**
     * 点击跳转的小程序 appid
     */
    appid: string
    /**
     * 点击跳转的小程序页面路径
     */
    pagepath?: string
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  }
  /**
   * 二级普通文本，建议不超过 112 个字。模版卡片主要内容的一级标题 main_title.title 和二级普通文本 sub_title_text 必须有一项填写
   */
  sub_title_text?: string
  /**
   * 二级标题 + 文本列表，该字段可为空数组，但有数据的话需确认对应字段是否必填，列表长度不超过 6
   */
  horizontal_content_list?: Array<{
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 二级文本，建议不超过 26 个字
     */
    value?: string
  } | {
    /**
     * 链接类型，0 或不填代表是普通文本
     */
    type: 0
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 二级文本，建议不超过 26 个字
     */
    value?: string
  } | {
    /**
     * 链接类型，1 代表跳转url
     */
    type: 1
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 二级文本，建议不超过 26 个字
     */
    value?: string
    /**
     * 链接跳转的 url
     */
    url: string
  } | {
    /**
     * 链接类型，2 代表下载附件
     */
    type: 2
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 文件名称（要包含文件类型），建议不超过 26 个字
     */
    value?: string
    /**
     * 附件的 media_id
     */
    media_id: string
  } | {
    /**
     * 链接类型，3 代表 `@员工`
     */
    type: 3
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 二级文本，建议不超过 26 个字
     */
    value?: string
    /**
     * 被 `@` 的成员的userid
     */
    userid: string
  }>
  /**
   * 跳转指引样式的列表，该字段可为空数组，但有数据的话需确认对应字段是否必填，列表长度不超过 3
   */
  jump_list?: Array<{
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
  } | {
    /**
     * 跳转链接类型，0 或不填代表不是链接
     */
    type: 0
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
  } | {
    /**
     * 跳转链接类型，1 代表跳转url
     */
    type: 1
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
    /**
     * 跳转链接的 url
     */
    url: string
  } | {
    /**
     * 跳转链接类型，2 代表跳转小程序
     */
    type: 2
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
    /**
     * 跳转小程序的 appid
     */
    appid: string
    /**
     * 跳转小程序的页面路径
     */
    pagepath?: string
  }>
  /**
   * 整体卡片的点击跳转事件
   */
  card_action: {
    /**
     * 卡片跳转类型，1 代表跳转 url
     */
    type: 1
    /**
     * 跳转事件的 url
     */
    url: string
  } | {
    /**
     * 卡片跳转类型，2 代表打开小程序
     */
    type: 2
    /**
     * 跳转事件的小程序的 appid
     */
    appid: string
    /**
     * 跳转事件的小程序的 pagepath
     */
    pagepath?: string
  }
}
export interface NewsNoticeTemplateCard {
  card_type: 'news_notice'
  /**
   * 卡片来源样式信息，不需要来源样式可不填写
   */
  source?: {
    /**
     * 来源图片的 url
     */
    icon_url?: string
    /**
     * 来源图片的描述，建议不超过 13 个字
     */
    desc?: string
    /**
     * 来源文字的颜色，目前支持：0（默认）灰色，1 黑色，2 红色，3 绿色
     */
    desc_color?: 0 | 1 | 2 | 3
  }
  /**
   * 模版卡片的主要内容，包括一级标题和标题辅助信息
   */
  main_title: {
    /**
     * 一级标题，建议不超过 26 个字
     */
    title: string
    /**
     * 标题辅助信息，建议不超过 30 个字
     */
    desc?: string
  }
  /**
   * 图片样式
   */
  card_image: {
    /**
     * 图片的 url
     */
    url: string
    /**
     * 图片的宽高比，宽高比要小于 2.25，大于 1.3
     * @default 1.3
     */
    aspect_ratio?: number
  }
  /**
   * 左图右文样式
   */
  image_text_area?: {
    /**
     * 左图右文样式的图片 url
     */
    image_url: string
    /**
     * 左图右文样式的标题
     */
    title?: string
    /**
     * 左图右文样式的描述
     */
    desc?: string
  } | {
    /**
     * 左图右文样式区域点击事件，0 或不填代表没有点击事件
     */
    type: 0
    /**
     * 左图右文样式的图片 url
     */
    image_url: string
    /**
     * 左图右文样式的标题
     */
    title?: string
    /**
     * 左图右文样式的描述
     */
    desc?: string
  } | {
    /**
     * 左图右文样式区域点击事件，1 代表跳转url
     */
    type: 1
    /**
     * 点击跳转的 url
     */
    url: string
    /**
     * 左图右文样式的图片 url
     */
    image_url: string
    /**
     * 左图右文样式的标题
     */
    title?: string
    /**
     * 左图右文样式的描述
     */
    desc?: string
  } | {
    /**
     * 左图右文样式区域点击事件，2 代表跳转小程序
     */
    type: 2
    /**
     * 点击跳转的小程序的 appid
     */
    appid: string
    /**
     * 点击跳转的小程序的 pagepath
     */
    pagepath?: string
    /**
     * 左图右文样式的图片 url
     */
    image_url: string
    /**
     * 左图右文样式的标题
     */
    title?: string
    /**
     * 左图右文样式的描述
     */
    desc?: string
  }
  /**
   * 引用文献样式，建议不与关键数据共用
   */
  quote_area?: {
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，0 或不填代表没有点击事件
     */
    type: 0
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，1 代表跳转url
     */
    type: 1
    /**
     * 点击跳转的 url
     */
    url: string
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  } | {
    /**
     * 引用文献样式区域点击事件，2 代表跳转小程序
     */
    type: 2
    /**
     * 点击跳转的小程序的 appid
     */
    appid: string
    /**
     * 点击跳转的小程序的 pagepath
     */
    pagepath?: string
    /**
     * 引用文献样式的标题
     */
    title?: string
    /**
     * 引用文献样式的引用文案
     */
    quote_text?: string
  }
  /**
   * 卡片二级垂直内容，该字段可为空数组，但有数据的话需确认对应字段是否必填，列表长度不超过 4
   */
  vertical_content_list?: Array<{
    /**
     * 卡片二级标题，建议不超过 26 个字
     */
    title: string
    /**
     * 二级普通文本，建议不超过 112 个字
     */
    desc?: string
  }>
  /**
   * 二级标题 + 文本列表，该字段可为空数组，但有数据的话需确认对应字段是否必填，列表长度不超过 6
   */
  horizontal_content_list?: Array<{
    type: 1
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 二级文本，建议不超过 26 个字
     */
    value?: string
    /**
     * 链接跳转的 url
     */
    url: string
  } | {
    type: 2
    /**
     * 二级标题，建议不超过 5 个字
     */
    keyname: string
    /**
     * 文件名称（要包含文件类型），建议不超过 26 个字
     */
    value?: string
    /**
     * 附件的media_id
     */
    media_id: string
  }>
  /**
   * 跳转指引样式的列表，该字段可为空数组，但有数据的话需确认对应字段是否必填，列表长度不超过 3
   */
  jump_list?: Array<{
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
  } | {
    /**
     * 跳转链接类型，0 或不填代表不是链接
     */
    type: 0
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
  } | {
    /**
     * 跳转链接类型，1 代表跳转url
     */
    type: 1
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
    url: string
  } | {
    /**
     * 跳转链接类型，2 代表跳转小程序
     */
    type: 2
    /**
     * 跳转链接样式的文案内容，建议不超过 13 个字
     */
    title: string
    /**
     * 跳转链接的小程序的 appid
     */
    appid: string
    /**
     * 跳转链接的小程序的 pagepath
     */
    pagepath?: string
  }>
  /**
   * 整体卡片的点击跳转事件
   */
  card_action: {
    /**
     * 卡片跳转类型，1 代表跳转 url
     */
    type: 1
    /**
     * 跳转事件的 url
     */
    url: string
  } | {
    /**
     * 卡片跳转类型，2 代表跳转小程序
     */
    type: 2
    /**
     * 跳转事件的小程序的 appid
     */
    appid: string
    /**
     * 跳转事件的小程序的 pagepath
     */
    pagepath?: string
  }
}
export interface TemplateCardmessage {
  msgtype: 'template_card'
  template_card: TextNoticeTemplateCard | NewsNoticeTemplateCard
}

export type WXWorkMessageUnion = TextMessage | MarkdownMessage | ImageMessage | ArticleMessage | FileMessage | TemplateCardmessage
