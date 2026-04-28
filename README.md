# 梁芷穎 Portfolio — 完整技術規格文件

**版本：** v5.0（ZhiYing5）  
**生成日期：** 2026-04-23  
**維護者：** 梁芷穎 (Liang Zhi Ying)

---

## 目錄

1. [專案概述](#一專案概述)
2. [全端技術架構](#二全端技術架構)
3. [頁面結構總覽](#三頁面結構總覽)
4. [各頁面詳細規格](#四各頁面詳細規格)
5. [共用元件](#五共用元件-shared-components)
6. [動畫與互動效果彙整表](#六動畫與互動效果彙整表)
7. [開發優先順序建議](#七開發優先順序建議)

---

## 一、專案概述

### 1.1 網站名稱與用途

**名稱：** 梁芷穎 LIANG ZHI YING — 個人作品集  
**用途：** 數位設計師與互動藝術家的線上作品集，展示互動裝置、動態影像與靜態視覺三大類別的創作成果，同時作為求職、接案與藝術展覽的門面。

### 1.2 目標使用者

| 使用者類型 | 需求 |
|----------|------|
| 藝術與設計相關業主 / 策展人 | 快速瀏覽作品品質、聯絡創作者 |
| 招募方 / 面試官 | 確認技術能力清單、查看完整履歷 |
| 設計社群同好 | 探索創作過程、獲取靈感 |
| 合作夥伴 / 媒體 | 追蹤最新動態、了解進行中項目 |

### 1.3 核心功能摘要

- **作品展示：** 12 件作品分三類呈現（互動裝置 4、動態影像 5、平面藝術 2），支援個別詳情頁
- **動態時間軸：** Recent Updates 區塊，顯示最新創作進度與展覽資訊
- **技能展示：** 互動「書本」設計，以分頁切換展示四大技術領域
- **內容管理：** 受密碼保護的 `/admin` 面板，透過 Netlify Functions 更新 JSON 資料
- **響應式設計：** 完整支援手機（540px）、平板（1024px）、桌面三種斷點

---

## 二、全端技術架構

### 2.1 前端 (Frontend)

| 項目 | 技術選型 | 說明 |
|------|---------|------|
| 結構層 | HTML5 | 語意化標籤、ARIA 無障礙屬性 |
| 樣式層 | CSS3（原生） | CSS Grid、Flexbox、Custom Properties、4638 行主樣式 |
| 邏輯層 | Vanilla JavaScript (ES6+) | async/await、IntersectionObserver、事件委派 |
| 動畫庫 | **GSAP 3.12.7** + ScrollTrigger | 主要動畫引擎，處理所有時間軸動畫 |
| 平滑捲動 | **Lenis 1.0.29** | 自訂 easing 慣性捲動，與 GSAP RAF 整合 |
| 字型系統 | ChillDINGothic（CJK）/ ShipporiAntique / BoutiqueBitmap9x9 | 三套自訂字型，WOFF2 格式 |
| 打包工具 | **Parcel 2.14.4** | 本地開發模組打包 |

**狀態管理：** 無外部狀態庫，使用 DOM 操作 + 模組閉包管理本地狀態（currentIndex、activeTab 等）

**路由：** 靜態多頁應用（MPA），Netlify SPA fallback 重導向至 `index.html`

### 2.2 後端 (Backend)

| 項目 | 技術選型 | 說明 |
|------|---------|------|
| 本地開發伺服器 | Node.js + Express | `server.js`，僅用於本機開發 |
| 無伺服器函數 | **Netlify Functions** (Node.js) | 4 個 Serverless 端點，esbuild 打包 |
| API 設計 | REST（JSON over HTTP） | POST 方法為主 |
| 驗證機制 | 自訂 **HMAC-SHA256 Token** | `auth.js`：Base64 payload + HMAC 簽章，環境變數存密鑰 |

**Serverless Functions 端點列表：**

| 端點 | 方法 | 功能 |
|------|-----|------|
| `/.netlify/functions/auth` | POST | 帳號密碼驗證，回傳 Token |
| `/.netlify/functions/update-posts` | POST | 新增 / 更新 posts.json 條目 |
| `/.netlify/functions/update-projects` | POST | 管理 projects.json 條目 |
| `/.netlify/functions/upload-image` | POST | 圖片上傳處理 |

### 2.3 資料庫 (Database)

| 層次 | 技術 | 說明 |
|------|-----|------|
| 主資料存儲 | **JSON 平面檔案** | `posts.json`、`projects.json`、`projects-nav.json`，版本控管於 Git |
| 快取層 | Netlify Edge CDN | 靜態資源全球快取，無額外快取設定 |
| ORM | 無（直接 JSON 操作） | Serverless Function 直接讀寫 JSON 檔 |

**未來資料庫選型建議：**

| 方案 | 優點 | 缺點 |
|------|-----|------|
| **Supabase（PostgreSQL）** | 免費額度大、內建 Auth、REST API | 需學習 SQL |
| **PlanetScale（MySQL）** | 無 schema 遷移衝突、分支功能 | 免費方案已停用 |
| **Notion API** | 非技術使用者可直接編輯內容 | API 速率限制，不適合高流量 |

### 2.4 基礎設施 (Infrastructure)

| 項目 | 技術 | 說明 |
|------|-----|------|
| 部署平台 | **Netlify** | 自動 CI/CD，推送 main branch 即部署 |
| CDN | Netlify Edge CDN | 全球靜態資源分發 |
| CI/CD | Netlify Build（Git-triggered） | 無額外配置，推送即構建 |
| 建置根目錄 | `ZhiYing5/` | `netlify.toml` 指定 |
| 函數打包 | esbuild（Netlify 內建） | 比 Webpack 快，無需手動配置 |
| 監控 | 無（目前） | 建議加入 Sentry（錯誤監控）或 Netlify Analytics |

**netlify.toml 設定摘要：**

```toml
[build]
  base = "ZhiYing5"
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2.5 第三方服務

| 類別 | 服務 | 用途 |
|------|-----|------|
| 字型 | Google Fonts (Public Sans) | 英文備用字型 |
| 社群連結 | Instagram / Medium / YouTube / Linktree | Footer 社群圖示連結 |
| 動畫引擎 | GSAP (CDN or npm) | ScrollTrigger 插件 |
| 分析工具 | 無（建議加入） | 建議：Umami（自架、隱私友好）或 Netlify Analytics |
| 金流 | 無 | 作品集網站不需 |
| 登入 | 自訂 HMAC Token | 僅 Admin 面板使用 |
| 郵件 | 無 | 聯絡方式透過社群連結 |

### 2.6 設計系統

**色彩變數：**

```css
--sk-paper:       #F7F3E8;   /* 米白背景 */
--sk-paper-soft:  #FBF8EE;   /* 柔和米白 */
--sk-ink:         #002C40;   /* 深海藍（主文字）*/
--sk-teal:        #005C80;   /* 青藍（強調、標題）*/
--sk-cyan:        #92C7CF;   /* 淺青（高亮、active 狀態）*/
--sk-accent:      #D9A441;   /* 金黃（特殊強調）*/
--sk-pink:        #E9A6A1;   /* 玫瑰粉（次要強調）*/
--sk-mint:        #B8D8C8;   /* 鼠尾草綠（第三強調）*/
--sk-light:       #E6F4F7;   /* 極淺青（深色背景上的文字）*/
--sk-background:  #FCFCD4;   /* 淺黃（light 文字）*/
```

**字型：**

| 字型名稱 | 格式 | 用途 |
|---------|-----|------|
| ChillDINGothic | WOFF2 | CJK 主文字（Preloaded） |
| ChillDINGothic Bold | OTF | 標題粗體 |
| ShipporiAntique | TTF | 英文襯線字 |
| BoutiqueBitmap9x9 | TTF | 像素風 UI 標籤 |

**版面常數：**

```css
--site-max:    1280px;
--site-gutter: clamp(20px, 4vw, 64px);
```

---

## 三、頁面結構總覽

| 頁面名稱 | 路由路徑 | 類型 |
|---------|---------|------|
| 首頁（主頁面）| `/` | 單頁滾動 |
| 孔外狂徒 | `/projects/outofhole/outofhole.html` | 作品詳情頁 |
| 艟Tong | `/projects/tong/tong.html` | 作品詳情頁 |
| Stamped | `/projects/Stamped/Stamped.html` | 作品詳情頁 |
| HOLOGACHA（開發中）| `/projects/HOLOGACHA/HOLOGACHA.html` | 作品詳情頁 |
| Weekender Girl | `/projects/weekendergirl/weekendergirl.html` | 作品詳情頁 |
| 愛拼才會營 | `/projects/Win/Win.html` | 作品詳情頁 |
| 有料沒料? | `/projects/Post/Post.html` | 作品詳情頁 |
| Walker | `/projects/Walker/Walker.html` | 作品詳情頁 |
| The Rose | `/projects/Rose/Rose.html` | 作品詳情頁 |
| Summer Week | `/projects/Summer Week/` | 作品詳情頁 |
| Kiss | `/projects/Kiss/Kiss.html` | 作品詳情頁 |
| 動態專案詳情頁 | `/project-page.html?id={id}` | 通用模板頁 |
| 後台管理 | `/admin` → `/admin.html` | 管理面板（受保護）|

---

## 四、各頁面詳細規格

---

### 頁面：首頁

**路由：** `/`  
**說明：** 單頁滾動架構，包含 Header、Intro、Skills、Recent Updates、Gallery、Footer 六大主區塊。

#### 4.1 區塊結構（由上而下）

1. Header / Navbar
2. Intro（Hero）
3. Skills（About Me）
4. Recent Updates（Posts Timeline）
5. Gallery（Works）
6. Footer

---

#### 4.2 Header / Navbar

**功能描述：**  
固定於頁面頂部（`position: fixed`，`z-index: 99999`），提供全站主導覽與識別。背景色 `rgba(0, 92, 128, 0.9)`，底部有青色邊框。

**按鈕清單：**

| 按鈕文字 | 樣式 | 行為 | 目的地 |
|---------|------|-----|-------|
| 梁芷穎 LIANG ZHI YING（Logo）| 白色文字，ChillDINGothic | Lenis 平滑捲動至頂部 | `#intro` |
| HOME | 白色文字，hover 底線 | 平滑捲動至 Hero 區塊 | `#intro` |
| ABOUT ME | 白色文字，hover 底線 | 平滑捲動至 Skills 區塊 | `#skills` |
| WORKS | 白色文字，hover 底線 | 平滑捲動至 Gallery 區塊 | `#gallery` |

**互動功能：**
- Lenis 平滑捲動整合（點擊導覽連結觸發 `lenis.scrollTo()`）
- 手機版：Logo 隱藏，導覽列置中顯示

**動畫特效：**
- 頁面載入時 Navbar 無專屬進場動畫（即時顯示）
- Hover：文字出現底線（CSS transition）

---

#### 4.3 Intro Section（Hero）

**功能描述：**  
全螢幕 Hero 區塊，高度 600px，展示動態輪播背景圖（隨機抽取 5 件作品縮圖），中央疊加大型主視覺文字，傳達設計師身份定位。

**按鈕清單：**

| 按鈕 | 樣式 | 行為 | 目的地 |
|-----|------|-----|-------|
| 圓點分頁指示器（5個）| 半透明白色圓點，active 為實心白 | 點擊切換至對應作品圖 | 無外部連結 |

**互動功能：**
- **自動輪播：** 每 5 秒自動切換至下一張圖片
- **手動切換：** 點擊底部圓點直接跳至指定作品
- **圖片隨機化：** 每次頁面載入從 `projects.json` 隨機選取 5 件作品

**動畫特效：**

| 動畫 | 描述 | 持續時間 |
|-----|------|---------|
| 圖片切換（淡出）| 當前圖 opacity 0、scale 0.95 | 0.4s |
| 圖片切換（淡入）| 新圖 opacity 0→1、scale 1.05→1（Ken Burns）| 0.5s 淡入 + 4.5s 縮放 |
| 文字疊層 | 固定疊加，不隨輪播動畫 | — |

---

#### 4.4 Skills Section（About Me）

**功能描述：**  
以「翻開書本」比喻展示個人簡介與技能清單。左頁為照片 + 打字機風格自我介紹 + 手寫簽名；右頁為四分類技能分頁列表。最小高度 `120vh`，桌面 800px，手機 1600px。

**按鈕清單：**

| 按鈕 | 樣式 | 行為 |
|-----|------|-----|
| Frontend | 分頁 Tab，active 狀態背景加深 | 切換右頁顯示前端技能清單 |
| Motion | 同上 | 切換右頁顯示動態設計工具 |
| Interactive | 同上 | 切換右頁顯示互動裝置工具 |
| Design | 同上 | 切換右頁顯示設計工具 |

**技能分類內容：**

| Tab | 工具清單 |
|-----|---------|
| Frontend | HTML、CSS、JavaScript、React、Vue |
| Motion | After Effects、Premiere、Cinema 4D、Procreate Dreams |
| Interactive | TouchDesigner、Unity、Arduino、Mediapipe、p5.js |
| Design | Illustrator、Photoshop、Procreate、Figma |

**互動功能：**
- **打字機效果（Bio）：** IntersectionObserver 觸發，每字 55ms 逐字顯示，段落間停頓 280ms
- **Tab 切換：** 點擊分頁切換右頁內容，搭配 GSAP 淡入動畫
- **箭頭動畫：** 三個箭頭圖示無限重複垂直跳動，引導使用者往下捲動

**動畫特效：**

| 動畫 | 觸發 | 技術 | 持續時間 |
|-----|------|-----|---------|
| 書本進場 | ScrollTrigger（書本進入視窗） | GSAP（opacity + y 28 + scale 0.985）| 1.1s，expo.out |
| 標題橫條展開 | ScrollTrigger | CSS scaleX(0→1) | 0.6s |
| Tab 內容切換 | 點擊 Tab | GSAP（opacity + translateX 10px）| 0.3s |
| 技能項目 Stagger | Tab 切換後 | GSAP stagger 0.05s | 每項 0.2s |
| 打字機游標閃爍 | 打字進行中 | CSS keyframe（blink）| 0.7s infinite |
| 箭頭跳動 | 頁面載入後 | GSAP timeline，repeat: -1 | 每循環 ~1.5s |

---

#### 4.5 Recent Updates Section（Posts Timeline）

**功能描述：**  
顯示最新 3 則創作動態（精簡卡片式），並提供「展開全部」功能以 Modal 方式呈現完整時間軸。資料來源：`posts.json`。

**按鈕清單：**

| 按鈕 | 樣式 | 行為 |
|-----|------|-----|
| 每張 Post 卡片 | 含縮圖、日期、標題、Tag | 點擊開啟 Post Overlay Modal |
| 展開全部 / 時間軸按鈕 | 底部連結樣式 | 開啟全部文章的 Modal 時間軸 |
| Modal 關閉按鈕 (×) | 右上角絕對定位 | 關閉 Modal |

**互動功能：**
- **Post Overlay Modal：** 動態生成 Modal，顯示完整標題、Hero 圖、日期、Tag、Caption、連結
- **ESC 鍵關閉：** 按 Escape 關閉 Modal
- **點擊外部關閉：** 點擊 Overlay 背景關閉 Modal
- **動態渲染：** 從 `posts.json` 讀取資料，`renderPostsTimeline()` 函數渲染 HTML

**Post 卡片資料欄位：**

| 欄位 | 類型 | 說明 |
|-----|------|-----|
| `id` | string | 唯一識別碼 |
| `title` | string | 文章標題 |
| `caption` | string | 簡短描述 |
| `image` | string | 縮圖路徑 |
| `date` | string (YYYY-MM-DD) | 發布日期 |
| `tag` | string | 分類標籤（如 `#互動裝置`）|
| `link` | string | 連結至對應作品頁 |

---

#### 4.6 Gallery Section（Works）

**功能描述：**  
展示全部 12 件作品，依三大類別切換顯示。桌面版使用水平分頁導覽（Horizontal Nav），手機版改為下拉選單（Dropdown）。

**分類與作品清單：**

| 分類 | ID | 作品列表 |
|-----|-----|---------|
| Interaction Design | `installation` | 孔外狂徒、艟Tong、Stamped、HOLOGACHA（Coming Soon）|
| Animation & Digital Art | `animation` | Weekender Girl、愛拼才會營、有料沒料?、Walker、The Rose |
| Static Artwork | `painting` | Summer Week、Kiss |

**按鈕清單（桌面版 Nav）：**

| 按鈕 | 樣式 | 行為 |
|-----|------|-----|
| Interaction Design | Nav item，active 狀態色塊背景 | 切換顯示 installation 類別 Gallery |
| Animation & Digital Art | 同上 | 切換顯示 animation 類別 Gallery |
| Static Artwork | 同上 | 切換顯示 painting 類別 Gallery |

**按鈕清單（手機版 Dropdown）：**

| 按鈕 | 樣式 | 行為 |
|-----|------|-----|
| 目前選中類別（Trigger）| 帶箭頭的選單觸發器 | 展開 / 收合 Dropdown |
| 各分類選項 | 列表項目，active 高亮 | 點擊切換類別並關閉 Dropdown |

**Gallery 項目互動：**

| 行為 | 描述 |
|-----|------|
| 點擊 Gallery Card | 導覽至該作品詳情頁（`link` 欄位）|
| Hover | 疊層顯示、圖片輕微縮放、文字出現 |
| Coming Soon Badge | HOLOGACHA 卡片疊加半透明遮罩 + 文字 |

**互動功能：**
- **類別切換：** 點擊 Nav 或 Dropdown 選項觸發內容切換（opacity 0.3s transition）
- **Dropdown 動畫：** GSAP 控制開合（translateY + opacity，0.15s）
- **點擊外部關閉 Dropdown：** 全域 click 事件偵測
- **ESC 關閉 Dropdown：** keydown 事件偵測

**動畫特效：**

| 動畫 | 觸發 | 技術 | 持續時間 |
|-----|------|-----|---------|
| Nav Hover scale | Hover | GSAP `to` | 0.2s |
| Nav Hover bg color | Hover | GSAP `to` | 0.2s |
| Nav Hover box-shadow | Hover | GSAP `to` | 0.2s |
| Dropdown 展開 | 點擊觸發器 | GSAP opacity + translateY | 0.15s |
| Dropdown 收合 | 點擊選項 / 外部 / ESC | GSAP opacity + translateY | 0.15s |
| Gallery 類別切換 | 點擊 Nav/Dropdown | CSS opacity transition | 0.3s |
| Gallery Card Hover | Hover | CSS transform + overlay | 0.25s |

---

#### 4.7 Footer

**功能描述：**  
頁面底部，展示社群媒體連結圖示。手機版背景為青色（`--sk-cyan`），桌面版融入整體背景。

**按鈕清單：**

| 按鈕 | 圖示檔名 | 行為 | 目的地 |
|-----|---------|------|-------|
| Instagram | `icon_instagram_.png` | 新分頁開啟 | Instagram 個人頁 |
| Medium | `icon_medium_.png` | 新分頁開啟 | Medium 個人頁 |
| YouTube | `icon_Youtube_.png` | 新分頁開啟 | YouTube 頻道 |
| Linktree | `icon_inktree_.png` | 新分頁開啟 | Linktree 頁面 |

**動畫特效：** Hover 輕微 scale 放大（CSS transition）

---

### 頁面：作品詳情頁（通用模板）

**路由：** `/projects/{project-name}/{project-name}.html` 或 `/project-page.html?id={id}`

#### 4.8 區塊結構

1. 返回導覽列
2. 作品 Hero（標題 + 主視覺）
3. 作品說明區（文字敘述、技術標籤）
4. 媒體展示區（圖片、影片、互動截圖）
5. 相關作品推薦
6. Footer

**共用樣式：** `projects/project-common.css`  
**共用腳本：** `projects/project-script.js`、`projects/modal-navigation.js`

**互動功能：**
- 圖片 Modal（部分作品）：點擊圖片放大，`modal-navigation.js` 處理前後張導覽
- 影片嵌入（YouTube / 本地影片）
- 返回按鈕：`history.back()` 或導覽回 `/#gallery`

---

### 頁面：後台管理面板

**路由：** `/admin` → `/admin.html`

#### 4.9 區塊結構

1. 登入表單
2. Posts 管理（新增 / 編輯最新動態）
3. Projects 管理（新增 / 編輯作品）
4. 圖片上傳

**驗證流程：**
- POST `/auth`，帳號密碼對應環境變數 `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- 成功回傳 HMAC-SHA256 Token，存於 `sessionStorage`
- 後續請求 Header 帶入 Token 驗證身份
- Token 失效自動跳回登入畫面

---

## 五、共用元件 (Shared Components)

### PostCard

**用途：** Recent Updates 區塊的單一文章卡片

| Prop | 類型 | 說明 |
|-----|------|-----|
| `id` | string | 文章唯一識別碼 |
| `title` | string | 文章標題 |
| `caption` | string | 簡短描述 |
| `image` | string | 縮圖路徑 |
| `date` | string | 日期（YYYY-MM-DD）|
| `tag` | string | 分類標籤 |
| `link` | string | 連結目的地 |

**使用情境：** 首頁 Recent Updates 區塊（精簡版 × 3）、Posts Modal 時間軸

---

### PostOverlay（Modal）

**用途：** 點擊 Post Card 後展開的詳情 Modal

| Prop | 類型 | 說明 |
|-----|------|-----|
| `post` | object | 完整 Post 資料物件 |

**關閉方式：** 點擊 × 按鈕、點擊背景、按 ESC  
**使用情境：** Recent Updates 區塊、全部文章時間軸 Modal

---

### GalleryCard

**用途：** Gallery 區塊的單一作品卡片

| Prop | 類型 | 說明 |
|-----|------|-----|
| `title` | string | 作品名稱 |
| `date` | string | 製作年份 |
| `image` | string | 縮圖路徑 |
| `link` | string | 作品頁連結 |
| `order` | number | 排序順序 |
| `hasModal` | boolean | 是否開啟 Modal 而非導覽 |
| `tags` | string[] | 分類標籤陣列 |
| `comingSoon` | boolean | 是否顯示 Coming Soon 遮罩 |

**使用情境：** Gallery 區塊三個分類的作品列表

---

### SkillTab

**用途：** Skills 書本右頁的分類分頁

| Prop | 類型 | 說明 |
|-----|------|-----|
| `label` | string | Tab 標籤文字 |
| `tools` | string[] | 工具名稱陣列 |
| `isActive` | boolean | 是否為目前啟用分頁 |

**使用情境：** Skills 區塊右頁（Frontend / Motion / Interactive / Design）

---

### GalleryNav

**用途：** Gallery 分類導覽，桌面版 Horizontal Nav，手機版 Dropdown

| Prop | 類型 | 說明 |
|-----|------|-----|
| `categories` | `{id, label}[]` | 分類清單 |
| `activeId` | string | 目前選中類別 ID |
| `onChange` | function | 切換類別的回呼函數 |

**使用情境：** Gallery 區塊頂部導覽列

---

### SocialIconLink

**用途：** Footer 社群連結圖示

| Prop | 類型 | 說明 |
|-----|------|-----|
| `icon` | string | 圖示圖片路徑 |
| `href` | string | 外部連結 URL |
| `label` | string | aria-label 無障礙標籤 |

**使用情境：** Footer 區塊

---

## 六、動畫與互動效果彙整表

| 動畫名稱 | 使用頁面 / 區塊 | 觸發條件 | 技術 | 持續時間 |
|---------|--------------|---------|-----|---------|
| Hero 圖片淡出 | 首頁 / Intro | 計時器（5s）或點擊圓點 | GSAP `gsap.to` | 0.4s |
| Hero 圖片淡入（Ken Burns）| 首頁 / Intro | 接續淡出完成 | GSAP timeline（opacity + scale）| 0.5s + 4.5s |
| 書本進場 | 首頁 / Skills | ScrollTrigger 進入視窗 | GSAP（y 28 + scale 0.985 + opacity）| 1.1s，expo.out |
| 標題橫條展開 | 首頁 / Skills | ScrollTrigger | CSS `scaleX` transform | 0.6s |
| Tab 內容淡入 | 首頁 / Skills | 點擊 Tab | GSAP（opacity + translateX 10px）| 0.3s |
| 技能項目 Stagger | 首頁 / Skills | Tab 切換後 | GSAP stagger | 每項 0.2s，stagger 0.05s |
| 打字機效果（Bio）| 首頁 / Skills | IntersectionObserver | Vanilla JS setTimeout | 55ms / 字 |
| 游標閃爍 | 首頁 / Skills（打字中）| 打字機進行中 | CSS keyframe（blink）| 0.7s infinite |
| 箭頭垂直跳動 | 首頁 / Skills | 頁面載入後即啟動 | GSAP timeline，repeat: -1 | ~1.5s / 循環 |
| Nav Hover 放大 | 首頁 / Gallery Nav | Hover enter | GSAP `to`（scale 1.08）| 0.2s |
| Nav Hover 背景色 | 首頁 / Gallery Nav | Hover enter | GSAP `to`（backgroundColor）| 0.2s |
| Nav Hover 陰影 | 首頁 / Gallery Nav | Hover enter | GSAP `to`（boxShadow）| 0.2s |
| Nav Hover 還原 | 首頁 / Gallery Nav | Hover leave | GSAP `to`（全部還原）| 0.2s |
| Dropdown 展開 | 首頁 / Gallery（手機）| 點擊觸發器 | GSAP（opacity 0→1 + translateY）| 0.15s |
| Dropdown 收合 | 首頁 / Gallery（手機）| 選項點擊 / ESC / 外部點擊 | GSAP（opacity 1→0 + translateY）| 0.15s |
| Gallery 類別切換 | 首頁 / Gallery | 點擊 Nav / Dropdown 選項 | CSS opacity transition | 0.3s |
| Gallery Card Hover | 首頁 / Gallery | Hover enter | CSS transform + overlay | 0.25s |
| 作品頁進場 | 所有作品詳情頁 | 頁面載入 DOMContentLoaded | GSAP（project-script.js）| ~0.8s |
| 圖片 Modal 開啟 | 作品詳情頁（有 Modal 者）| 點擊圖片 | CSS opacity + modal-navigation.js | 0.3s |
| Lenis 平滑捲動 | 全站 | 所有捲動操作 | Lenis 1.0.29（自訂 easing）| 持續 |

---

## 七、開發優先順序建議

### P0 — 核心功能，立即修復 / 建置

| 任務 | 原因 |
|-----|------|
| 所有作品詳情頁樣式統一（`project-common.css`）| 各頁面樣式不一致，影響品牌形象 |
| Mobile 響應式修復（手機版 Skills 書本高度 1600px 偏大）| 手機體驗不佳 |
| HOLOGACHA 作品頁建置 | 目前佔位 Coming Soon，作品應儘速上線 |
| `netlify.toml` 確認 SPA 路由正確（避免 404）| 部署後直接訪問子頁面可能 404 |
| 環境變數設定文件（`ADMIN_USERNAME`、`ADMIN_PASSWORD`、`JWT_SECRET`）| Admin 功能依賴此設定 |

### P1 — 重要改善，近期規劃

| 任務 | 原因 |
|-----|------|
| 加入 `prefers-reduced-motion` 媒體查詢 | 無障礙合規，對運動敏感使用者重要 |
| 圖片 WebP 轉換 + Netlify Image CDN | 縮短載入時間，目前仍有 `.png/.jfif` 原圖 |
| 錯誤監控整合（Sentry 免費版）| 目前無法得知生產環境錯誤 |
| Gallery 分頁（Pagination）或無限滾動 | 作品數量增加後頁面過長 |
| `og:image` / `twitter:card` Meta 標籤 | 社群分享時無預覽圖，影響傳播效果 |
| Admin 面板 Token 過期機制 | 目前 HMAC Token 無過期時間 |

### P2 — 長期優化，未來規劃

| 任務 | 原因 |
|-----|------|
| 遷移至 Headless CMS（如 Sanity 或 Notion API）| JSON 直接版控不適合頻繁更新 |
| 加入 Umami Analytics | 了解訪客來源、熱門作品 |
| 加入 RSS Feed | 支援訂閱 Recent Updates |
| 作品搜尋 / 標籤篩選功能 | 作品數量增加後提升可探索性 |
| CI/CD 自動化測試（Playwright E2E）| 確保動畫與互動功能部署後正常運作 |
| PWA 支援（Service Worker + Manifest）| 支援離線瀏覽 / 加入主畫面 |
| 多語言支援（中 / 英 切換）| 拓展國際曝光 |

---

> 本文件依據 `ZhiYing5/` 目錄下的原始碼自動分析生成，反映 2026-04-23 當下的實際技術狀態。如有架構變動請同步更新本文件。
