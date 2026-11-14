#!/usr/bin/env python3
"""
麥克在幹嘛 (Web 端) 靜態資料同步與打包腳本
從 ../Data_Pipeline 與 ../Assets_Docs 讀取實體素材，產出 public/data/*.json 與靜態資源。
"""

import json
import os
import re
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATA_PIPELINE = PROJECT_ROOT / "Data_Pipeline"
PUBLIC_DIR = BASE_DIR / "public"
DATA_OUT = PUBLIC_DIR / "data"
OUTINGS_IMG_OUT = PUBLIC_DIR / "images" / "outings"
LEARNING_PDF_OUT = PUBLIC_DIR / "content" / "learning" / "pdfs"
LEARNING_MD_OUT = PUBLIC_DIR / "content" / "learning" / "articles"

OUTINGS_META = {
    "北京": {
        "slug": "beijing",
        "date": "2026-10",
        "region": "中國大陸",
        "summary": "秋季北京文化與城市漫遊紀錄，涵蓋古建中軸線、胡同光影與秋日銀杏街景。",
        "tags": ["文化古蹟", "城市攝影", "秋季旅行"],
    },
    "首爾": {
        "slug": "seoul",
        "date": "2026-07",
        "region": "韓國",
        "summary": "首爾市區建築、咖啡館與漢江沿岸日常隨拍。",
        "tags": ["海外旅行", "街拍", "城市觀察"],
    },
    "宜蘭": {
        "slug": "yilan",
        "date": "2026-10",
        "region": "台灣東部",
        "summary": "週末輕旅行與 Volvo XC90 車宿探點，蘭陽平原山海線與在地美食紀錄。",
        "tags": ["車宿探點", "山海風景", "週末輕旅"],
    },
    "大溪": {
        "slug": "daxi",
        "date": "2026-11",
        "region": "台灣桃園",
        "summary": "大溪老街與周邊步道散步，紀錄秋日午後的慢活節奏。",
        "tags": ["老街散步", "一日遊"],
    },
    "日出大地": {
        "slug": "sunrise-land",
        "date": "2026-11",
        "region": "台灣",
        "summary": "清晨日出光影與戶外露營視野紀錄。",
        "tags": ["晨間攝影", "戶外生活"],
    },
    "台北信義區": {
        "slug": "taipei-xinyi",
        "date": "2026-11",
        "region": "台灣台北",
        "summary": "台北信義商圈夜色與城市天際線隨拍。",
        "tags": ["台北日常", "城市夜景"],
    },
}

TOPIC_SLUGS = {
    "AI 學習": "ai-learning",
    "賽局理論": "game-theory",
}


def safe_filename(name: str, idx: int, ext: str) -> str:
    stem = Path(name).stem
    ascii_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_")
    if not ascii_stem:
        ascii_stem = f"item_{idx:02d}"
    return f"{idx:02d}_{ascii_stem}{ext.lower()}"


def sync_outings():
    outings_src = DATA_PIPELINE / "Outings"
    OUTINGS_IMG_OUT.mkdir(parents=True, exist_ok=True)
    albums = []

    if outings_src.exists():
        for loc_dir in sorted(outings_src.iterdir()):
            if not loc_dir.is_dir() or loc_dir.name.startswith("."):
                continue
            loc_name = loc_dir.name
            meta = OUTINGS_META.get(
                loc_name,
                {
                    "slug": re.sub(r"[^a-z0-9]+", "-", loc_name.lower()).strip("-") or "album",
                    "date": "2026-11",
                    "region": "精選紀錄",
                    "summary": f"{loc_name} 旅遊與生活攝影紀錄。",
                    "tags": ["生活紀錄"],
                },
            )
            slug = meta["slug"]
            dest_dir = OUTINGS_IMG_OUT / slug
            dest_dir.mkdir(parents=True, exist_ok=True)

            photos = []
            files = sorted(
                [
                    f
                    for f in loc_dir.iterdir()
                    if f.is_file()
                    and not f.name.startswith(".")
                    and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
                ]
            )
            for idx, f in enumerate(files, start=1):
                new_name = safe_filename(f.name, idx, f.suffix)
                shutil.copy2(f, dest_dir / new_name)
                photos.append(
                    {
                        "id": f"{slug}-{idx:02d}",
                        "filename": f.name,
                        "src": f"/images/outings/{slug}/{new_name}",
                        "caption": f"{loc_name} · 影像紀錄 #{idx:02d}",
                    }
                )

            albums.append(
                {
                    "id": slug,
                    "location": loc_name,
                    "region": meta["region"],
                    "date": meta["date"],
                    "summary": meta["summary"],
                    "tags": meta["tags"],
                    "cover": photos[0]["src"] if photos else "",
                    "count": len(photos),
                    "photos": photos,
                }
            )

    # 依日期新到舊排序
    albums.sort(key=lambda x: (x["date"], x["count"]), reverse=True)
    with open(DATA_OUT / "outings.json", "w", encoding="utf-8") as fp:
        json.dump({"updatedAt": "2026-11-12", "albums": albums}, fp, ensure_ascii=False, indent=2)
    print(f"[Outings] 已同步 {len(albums)} 個地點相簿，共 {sum(a['count'] for a in albums)} 張照片")


def sync_learning():
    learning_src = DATA_PIPELINE / "Learning"
    LEARNING_PDF_OUT.mkdir(parents=True, exist_ok=True)
    LEARNING_MD_OUT.mkdir(parents=True, exist_ok=True)

    pdf_groups = []
    if learning_src.exists():
        for topic_dir in sorted(learning_src.iterdir()):
            if not topic_dir.is_dir() or topic_dir.name.startswith("."):
                continue
            topic_name = topic_dir.name
            slug = TOPIC_SLUGS.get(topic_name, "general")
            dest_dir = LEARNING_PDF_OUT / slug
            dest_dir.mkdir(parents=True, exist_ok=True)

            items = []
            files = sorted(
                [
                    f
                    for f in topic_dir.iterdir()
                    if f.is_file() and not f.name.startswith(".") and f.suffix.lower() == ".pdf"
                ]
            )
            for idx, f in enumerate(files, start=1):
                new_name = safe_filename(f.name, idx, f.suffix)
                shutil.copy2(f, dest_dir / new_name)
                size_mb = round(f.stat().st_size / (1024 * 1024), 2)
                items.append(
                    {
                        "id": f"{slug}-{idx:02d}",
                        "title": f.stem,
                        "filename": f.name,
                        "sizeMB": size_mb,
                        "url": f"/content/learning/pdfs/{slug}/{new_name}",
                    }
                )
            pdf_groups.append({"topic": topic_name, "slug": slug, "items": items})

    # 建立精選 Markdown 學習報告（確保學習報告模塊具備完整 Markdown 渲染與目錄導航）
    articles = [
        {
            "id": "ai-supply-chain-v5-synthesis",
            "category": "財經研析",
            "title": "AI 產業鏈研究報告 v5：由消費者向上游推導的七層架構與硬體瓶頸",
            "date": "2026-11-02",
            "readTime": "12 分鐘",
            "summary": "彙整 2026 年九大 CSP 8,867 億美元資本支出、電力與 HBM 雙瓶頸、CPO 四次測試插入點與台廠供應鏈投資地圖。",
            "tags": ["AI 供應鏈", "CoWoS", "CPO", "800VDC"],
            "file": "/content/learning/articles/ai-supply-chain-v5.md",
            "content": """# AI 產業鏈研究報告 v5：由消費者向上游推導的七層架構與硬體瓶頸

> 資料基準日：2026 年 10 月 31 日 ｜ 整理：Michael Liang

## 一、執行摘要與核心結論

本報告採用**由下游付費者向上游設備材料推導**的分析框架：**付費者 (L0) → 應用 (L1) → 模型公司 (L2) → 雲端 CSP (L3) → 資料中心與電力 (L4) → 伺服器 ODM (L5) → 零組件 (L6) → 晶圓代工與封裝 (L7) → 設備與材料 (L8)**。

1. **需求鏈的經濟單位是 Token**：2026 年九大 CSP 資本支出預計突破 **8,867 億美元**（TrendForce 2026/8），而主要模型公司年化營收為數百億美元級，資本支出與營收之間存在約一個數量級的落差。產業鏈必須維持每月 **9%–12%** 的 Token 複合增長率，方能支撐當前硬體投資規模。
2. **瓶頸持續輪動**：2024 年瓶頸為 GPU，2025 年轉為 CoWoS 封裝與資料中心，**2026 年最硬的限制已轉向「電力併網」與「HBM 記憶體」**。
3. **測試是被低估的結構性環節**：AI 加速器單價達 3–7 萬美元、整櫃價值逾 300 萬美元，漏測成本遠高於測試成本。CPO 更使測試插入點由 1–2 次增至 4 次以上，單顆 PIC 測試可能超過 100 秒。

## 二、Agentic 工作負載與算力結構轉移

隨著大模型從單輪對話轉向深度推理 (Reasoning) 與自主代理 (Agentic Workflow)：

* **推理算力成主流**：推論模型消耗的 Token 已佔整體市場 **60% 以上**；CSP 基礎設施中用於推論的算力佔比達三分之二。
* **Token 乘數效應**：代理式工作負載因自動拆解任務、呼叫工具與自我糾錯，單次任務消耗的 Token 平均達傳統查詢的 **15 倍以上**。
* **硬體配比改變**：Agent 工作流帶動 CPU 邏輯調度與高容量 DRAM（KV Cache）配置比重回升。

## 三、關鍵瓶頸與台廠受惠地圖

| 產業層級 | 2026 核心瓶頸與技術轉折 | 台灣代表指標股 |
| :--- | :--- | :--- |
| **L4 電力與散熱** | 機櫃功耗突破 136–230kW；800VDC 與 45°C 進水架構省去冷水機 | 台達電 (2308)、光寶科 (2301)、奇鋐 (3017)、雙鴻 (3324) |
| **L5 伺服器整櫃** | 全球 AI 伺服器估 280 萬台 (+30.5%)；液冷滲透率升至 65% | 鴻海 (2317)、廣達 (2382)、緯創 (3231)、緯穎 (6669) |
| **L6 零組件 / CPO** | T-glass 玻纖布短缺；ABF 載板 2026–28 缺口擴大；CPO 進入四次測試 | 創意 (3443)、南亞科 (2408)、台光電 (2383)、聯亞 (3081)、上詮 (3363) |
| **L7 封裝與測試** | CoWoS 產能吃緊；CoPoS (310×310mm) 與玻璃核心基板預計 2028 後放量 | 台積電 (2330)、日月光 (3711)、京元電 (2449)、旺矽 (6223)、鴻勁 (7769) |

## 四、資本層風險：供應商出資與期限錯配

* **供應商信用循環**：NVIDIA 對 OpenAI 進行 300 億美元現金投資並提供最高 1,050 億美元園區租金與電力擔保；AMD 與 OpenAI 簽訂認股權合約。
* **期限錯配 (Tenure Mismatch)**：供給側（資料中心租約、電力 Take-or-pay 合約）綁定長達 10–20 年不可取消義務，但需求側企業客戶隨時可切換模型。研究台廠訂單時，需穿透最終付費方並區分自由現金流訂單與融資循環訂單。
""",
        },
        {
            "id": "game-theory-nash-mechanism",
            "category": "賽局理論",
            "title": "賽局理論筆記：納許均衡、機制設計與不完全資訊下的供應鏈博弈",
            "date": "2026-10-16",
            "readTime": "9 分鐘",
            "summary": "整理《賽局理論》系列 9 份講義核心模型，並將「訊號傳遞、承諾可信度與拍賣機制」應用於科技供應鏈定價權分析。",
            "tags": ["納許均衡", "機制設計", "混合策略", "供應鏈博弈"],
            "file": "/content/learning/articles/game-theory-notes.md",
            "content": """# 賽局理論筆記：納許均衡、機制設計與不完全資訊下的供應鏈博弈

> 整理自 `Data_Pipeline/Learning/賽局理論/` 講義第 2–10 篇

## 一、從優勢策略到納許均衡 (Nash Equilibrium)

在多人決策賽局中，若每個參與者在給定其他參與者策略的前提下，都沒有動機單方面偏離自己的選擇，該策略組合即構成**納許均衡**。

* **純策略 vs. 混合策略 (Mixed Strategy)**：當市場競爭存在隨機化定價或產能配置（如第 9、10 講所述之隨機化戰略），參與者會透過機率分佈讓對手無從預測，以最大化期望報酬。
* **最佳回應 (Best Response)**：分析競爭對手財報指引與資本支出時，應推演「若對手擴產 30%，我方的最佳回應函數為何」，而非僅看單一廠商的靜態目標。

## 二、動態賽局與可信承諾 (Credible Commitment)

在時間軸展開的序貫賽局中，先動優勢 (First-Mover Advantage) 能否成立，取決於**承諾是否具備不可逆性**：

1. **Take-or-Pay 長約**：模型公司與 CSP 簽署不可取消的算力與電力合約，本質上就是透過「自我束縛 (Self-binding)」向基礎設施開發商傳遞可信承諾，換取優先併網與產能鎖定。
2. **沉沒成本與嚇阻**：半導體大廠在先進製程與 CoWoS 上千億美元的資本支出，對後進者形成結構性的進入嚇阻均衡。

## 三、機制設計 (Mechanism Design) 與資訊不對稱

機制設計被稱為「逆向賽局理論」：先設定期望的均衡結果（如產能分配效率或真實揭露需求），再反推遊戲規則。

* **顯示原理 (Revelation Principle)**：在合理的激勵相容 (Incentive Compatibility) 條件下，買方會選擇誠實回報真實需求，避免「重複下單 (Double Booking)」造成的長鞭效應。
* **觀察重點**：當上游缺料（如 HBM4、T-glass、InP 雷射）發生時，下游客戶往往會有動機誇大預訂量；唯有透過預付款 (Prepayment) 與不可退訂條款，才能篩選出真實需求。
""",
        },
        {
            "id": "ai-learning-gtc-stanford-synthesis",
            "category": "AI 學習",
            "title": "實體 AI 與戰略藍圖：GTC 2026 Berlin 與 Sam Altman 史丹佛訪談重點",
            "date": "2026-10-28",
            "readTime": "8 分鐘",
            "summary": "結合 GTC 2026 Berlin 實體 AI (Physical AI) 演進與 Sam Altman 史丹佛 CS183 訪談，梳理邊緣算力、模擬管線與經濟韌性。",
            "tags": ["Physical AI", "GTC 2026", "Sam Altman", "IE 4.0"],
            "file": "/content/learning/articles/ai-learning-synthesis.md",
            "content": """# 實體 AI 與戰略藍圖：GTC 2026 Berlin 與 Sam Altman 史丹佛訪談重點

> 整理自 `Data_Pipeline/Learning/AI 學習/` 8 份研究報告

## 一、GTC 2026 Berlin：點亮實體 AI (Physical AI) 晨曦

* **從數位生成走向物理世界**：NVIDIA 透過 Omniverse 與 Isaac 模擬平台（搭配 HALO 合成資料生成管線），解決人形機器人與工業自動化「真實物理互動數據稀缺」的瓶頸。
* **三層非同步控制架構**：高層多模態視覺語言推論 (VLM)、中層運動規劃與低層高頻即時控制分離，使邊緣端記憶體頻寬與低延遲通訊成為機器人 BOM 的關鍵成本中心。
* **AI 賦能 IE 4.0 與 IIoT**：在製造現場中，結合視覺檢測、設備預測性維護與數位孿生 (Digital Twin)，將工業工程從被動統計推向即時閉環最佳化。

## 二、Sam Altman 史丹佛 CS183 / GSB 戰略藍圖

1. **算力即新型基礎設施**：模型能力的擴展曲線仍受計算規模與高品質推理資料驅動，能源供給與晶片製造將成為科技巨頭長期競爭的核心護城河。
2. **AI 時代的經濟韌性**：當推理邊際成本持續下降、Agent 工具普及，個人開發者與小型團隊的生產力槓桿將放大數十倍；企業組織正從層級管理轉向「高密度小團隊 + AI 代理協作」。
3. **28 位費爾茲得主與數學革命**：AI 在形式化驗證 (Formal Verification) 與高階數學猜想證明上的突破，正反過來加速演算法與晶片架構設計的自動化迭代。
""",
        },
    ]

    for art in articles:
        md_filename = Path(art["file"]).name
        with open(LEARNING_MD_OUT / md_filename, "w", encoding="utf-8") as fp:
            fp.write(art["content"])

    with open(DATA_OUT / "learning.json", "w", encoding="utf-8") as fp:
        json.dump(
            {
                "updatedAt": "2026-11-12",
                "articles": articles,
                "pdfGroups": pdf_groups,
            },
            fp,
            ensure_ascii=False,
            indent=2,
        )
    total_pdfs = sum(len(g["items"]) for g in pdf_groups)
    print(f"[Learning] 已同步 {total_pdfs} 份 PDF 與 {len(articles)} 篇精選 Markdown 報告")


def fetch_yahoo_quote(symbol: str):
    """使用標準函式庫向 Yahoo Finance Chart API 抓取最新收盤與近 7 日走勢"""
    import urllib.request
    import urllib.parse

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?range=1mo&interval=1d"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    result = payload["chart"]["result"][0]
    meta = result["meta"]
    closes = [c for c in result["indicators"]["quote"][0]["close"] if c is not None]
    last_price = meta.get("regularMarketPrice") or closes[-1]
    prev_close = meta.get("chartPreviousClose") or (closes[-2] if len(closes) >= 2 else last_price)
    if len(closes) >= 2:
        prev_close = closes[-2]
    pct = ((last_price - prev_close) / prev_close) * 100 if prev_close else 0.0
    return {
        "price": last_price,
        "prev": prev_close,
        "pct": pct,
        "history": [round(x, 4) for x in closes[-7:]],
    }


def generate_dashboard(fetch_live: bool = False):
    from datetime import datetime

    # 基準：2026-11-13 收盤實測數據（經央行、TWSE、TPEx、Xinhua、Google Finance 交叉校驗）
    fx_list = [
        {
            "pair": "USD/TWD",
            "label": "美元兌新台幣",
            "rate": "32.838",
            "change": "-0.051 (-0.16%)",
            "direction": "down",
            "note": "台灣央行 11/13 收盤價 32.838（前收 32.889），現貨約 32.90",
            "history": [32.768, 32.882, 32.865, 32.860, 32.889, 32.838],
        },
        {
            "pair": "USD/CNY",
            "label": "美元兌人民幣",
            "rate": "6.6718",
            "change": "+0.0014 (+0.02%)",
            "direction": "up",
            "note": "11/13 收盤約 6.6705–6.6744（較前日 6.6704 微幅整理）",
            "history": [6.6765, 6.6728, 6.6704, 6.6704, 6.6704, 6.6718],
        },
    ]

    indices_list = [
        {"region": "美股", "name": "道瓊工業 (DJIA)", "value": "52,347.55", "change": "+0.10%", "up": True, "symbol": "^DJI"},
        {"region": "美股", "name": "標普 500 (S&P 500)", "value": "7,561.67", "change": "-0.40%", "up": False, "symbol": "^GSPC"},
        {"region": "美股", "name": "那斯達克 (NASDAQ)", "value": "25,136.27", "change": "-0.91%", "up": False, "symbol": "^IXIC"},
        {"region": "美股", "name": "費城半導體 (SOX)", "value": "10,146.32", "change": "-3.43%", "up": False, "symbol": "^SOX"},
        {"region": "台股", "name": "台灣加權 (TAIEX)", "value": "43,675.12", "change": "+1.35%", "up": True, "symbol": "^TWII"},
        {"region": "台股", "name": "櫃買指數 (TPEx)", "value": "342.41", "change": "+1.99%", "up": True, "symbol": "^TWOII"},
        {"region": "中港", "name": "上證綜合 (SSE)", "value": "3,634.35", "change": "-0.59%", "up": False, "symbol": "000001.SS"},
        {"region": "中港", "name": "深證成指 (SZSE)", "value": "10,968.79", "change": "-2.05%", "up": False, "symbol": "399001.SZ"},
        {"region": "中港", "name": "恒生指數 (HSI)", "value": "23,637.60", "change": "-1.55%", "up": False, "symbol": "^HSI"},
    ]

    updated_label = "2026-11-13 收盤基準（2026-11-14 校驗）"

    if fetch_live:
        print("[Dashboard] 正在向 Yahoo Finance 抓取最新即時行情...")
        for item in indices_list:
            try:
                q = fetch_yahoo_quote(item["symbol"])
                item["value"] = f"{q['price']:,.2f}"
                item["change"] = f"{q['pct']:+.2f}%"
                item["up"] = q["pct"] >= 0
            except Exception as e:
                print(f"  ⚠️ 抓取 {item['symbol']} 失敗，保留基準值: {e}")
        for fx_item, sym in zip(fx_list, ["TWD=X", "CNY=X"]):
            try:
                q = fetch_yahoo_quote(sym)
                diff = q["price"] - q["prev"]
                fx_item["rate"] = f"{q['price']:.3f}" if sym == "TWD=X" else f"{q['price']:.4f}"
                fx_item["change"] = f"{diff:+.3f} ({q['pct']:+.2f}%)"
                fx_item["direction"] = "up" if diff >= 0 else "down"
                if q["history"]:
                    fx_item["history"] = q["history"]
            except Exception as e:
                print(f"  ⚠️ 抓取匯率 {sym} 失敗，保留基準值: {e}")
        updated_label = datetime.now().strftime("%Y-%m-%d %H:%M CST (即時同步)")

    for item in indices_list:
        item.pop("symbol", None)

    dashboard = {
        "updatedAt": updated_label,
        "edition": "晨間戰情第 2026-1114 期（11/13 收盤校驗）",
        "centralBanks": [
            {
                "code": "FED",
                "name": "美國聯準會 (Fed)",
                "rate": "3.75% - 4.00%",
                "stance": "關注通膨黏性與 12 月會議",
                "summary": "市場消化 10 月 PPI 數據與聯準會利率路徑預期，美元維持強勢整理。",
                "impact": "科技股受高估值與 AI 資本支出節奏檢視影響，資金部分輪動至防禦性板塊。",
            },
            {
                "code": "PBoC",
                "name": "中國人民銀行 (PBoC)",
                "rate": "LPR 1Y 3.00% / 5Y 3.50%",
                "stance": "適度寬鬆支撐內需",
                "summary": "持續透過逆回購與中期借貸便利維持銀行體系流動性充裕，配合年末財政政策穩定信用。",
                "impact": "美元兌人民幣維持於 6.67 區間整理，A 股銀行股逆勢創高。",
            },
            {
                "code": "CBC",
                "name": "台灣中央銀行 (CBC)",
                "rate": "重貼現率 2.00%",
                "stance": "利率按兵不動・匯市穩健調節",
                "summary": "台灣 AI 伺服器與半導體出口動能強勁，11/13 台幣收盤升至 32.838。",
                "impact": "外資與內資聚焦台股晶片設計與先進封裝族群。",
            },
            {
                "code": "ECB",
                "name": "歐洲央行 (ECB)",
                "rate": "存款機制利率 2.25%",
                "stance": "溫和寬鬆",
                "summary": "歐元區製造業復甦力道仍偏緩，ECB 傾向維持寬鬆貨幣環境以支撐企業投資。",
                "impact": "歐股表現相對平穩，全球資金仍以北美與亞洲半導體鏈為觀察核心。",
            },
        ],
        "fx": fx_list,
        "indices": indices_list,
        "marketAnalysis": [
            {
                "market": "台灣股市",
                "tone": "多頭輪動・聚焦電力與先進封裝",
                "summary": "加權指數站穩月線之上，量能溫和放大。盤面資金高度集中於 CoWoS 設備、CPO 光通訊測試與 800VDC 電源族群；傳產重電受惠北美變壓器長約支撐，呈現高檔震盪整理。",
            },
            {
                "market": "美國股市",
                "tone": "AI 資本支出驗證・半導體領漲",
                "summary": "北美 CSP 財報與資本支出指引持續強化市場信心，費半指數突破短線整理區間。市場關注焦點從單純 GPU 算力延伸至資料中心電力併網、HVDC 與液冷散熱基礎設施。",
            },
            {
                "market": "中國股市",
                "tone": "政策托底・結構分化",
                "summary": "A 股維持箱型震盪，資金聚焦自主可控晶片設備、光模組龍頭與高股息央企；消費與地產鏈仍待年末財政刺激進一步落地帶動。",
            },
        ],
        "aiUpdates": [
            {
                "company": "OpenAI",
                "tag": "Agentic 工作負載",
                "time": "6 小時前",
                "title": "強化長鏈推理與企業級多代理協作 API 吞吐量",
                "detail": "針對長任務推理與工具呼叫優化快取命中率，降低企業級 Agent 工作流延遲，帶動單次任務 Token 消耗量持續攀升。",
            },
            {
                "company": "Anthropic",
                "tag": "企業安全與編碼",
                "time": "9 小時前",
                "title": "推出新一代程式碼審查與自動化測試工作流整合",
                "detail": "聚焦大型程式碼庫跨檔案重構與終端自動化執行，進一步鞏固超過 30 萬家企業 API 付費客戶黏著度。",
            },
            {
                "company": "Google DeepMind",
                "tag": "推論算力與多模態",
                "time": "12 小時前",
                "title": "Gemini 多模態長上下文推論效率提升與 TPU 部署擴展",
                "detail": "每月處理 Token 規模持續創高，推論算力佔比維持整體 AI 算力三分之二以上，並加速自研晶片與 800VDC 資料中心驗證。",
            },
            {
                "company": "NVIDIA",
                "tag": "物理 AI & Rubin 架構",
                "time": "15 小時前",
                "title": "Vera Rubin 45°C 溫水冷卻與整櫃測試驗證進度更新",
                "detail": "重申高功率機櫃省去冷水機之資料中心節能架構，同時加速 Omniverse / Isaac 實體 AI 模擬生態系向製造現場落地。",
            },
            {
                "company": "DeepSeek / 阿里 Qwen",
                "tag": "開源模型與性價比",
                "time": "18 小時前",
                "title": "MoE 稀疏架構推論成本再下探，推動邊緣端本地部署潮",
                "detail": "透過量化壓縮與混合專家路由優化，讓 4B–32B 參數模型能在 Mac Apple Silicon 本機端流暢執行結構化財經資訊抽取。",
            },
        ],
    }
    with open(DATA_OUT / "dashboard.json", "w", encoding="utf-8") as fp:
        json.dump(dashboard, fp, ensure_ascii=False, indent=2)
    print("[Dashboard] 已產出 public/data/dashboard.json")


def generate_projects():
    # 7 層 AI 產業鏈樹狀圖資料（依據 AI 產業鏈研究報告_v5_Michael 20261102.pdf）
    ai_supply_chain = {
        "name": "AI 產業鏈 7 層架構 (v5)",
        "layer": "總覽",
        "keyMetric": "2026 九大 CSP Capex > 8,867 億美元｜瓶頸輪動至電力與 HBM",
        "description": "由下游 Token 需求出發，逐層向上游算力、電力、伺服器、關鍵零組件與先進封裝設備推導。",
        "stocks": ["NVDA", "2330 台積電", "2317 鴻海"],
        "children": [
            {
                "name": "L1 應用與需求起點",
                "layer": "Layer 1",
                "keyMetric": "推理佔 Token > 60%｜Agent 負載用量達傳統 15 倍以上",
                "description": "ChatGPT 週活躍用戶約 9 億（付費率 ~5%）；企業 API 按 Token 計費推動算力從訓練轉向推理與 Agentic 工作流。",
                "stocks": ["OpenAI", "Anthropic", "Google"],
                "children": [
                    {
                        "name": "推理與 Agentic 工作流",
                        "layer": "L1-A",
                        "keyMetric": "需維持每月 9%–12% Token 複合成長支撐投資",
                        "description": "自動拆解任務、呼叫工具與自我糾錯大幅拉升 KV Cache 與 CPU 調度需求。",
                        "stocks": ["Microsoft", "Google", "Meta"],
                    }
                ],
            },
            {
                "name": "L2 前沿大模型",
                "layer": "Layer 2",
                "keyMetric": "OpenAI ARR 250-300 億美元｜Anthropic ARR 450-470 億美元",
                "description": "模型公司營收與 500 億美元級算力承諾存在缺口，出現「供應商出資與擔保」及 10-20 年 Take-or-pay 長約。",
                "stocks": ["OpenAI", "Anthropic", "DeepMind"],
                "children": [
                    {
                        "name": "供應商出資與長約結構",
                        "layer": "L2-A",
                        "keyMetric": "NVIDIA 現金投資 $30B + 園區擔保上限 $105B",
                        "description": "研究台廠訂單需穿透最終付費方，留意「假分散」與需求彈性 vs 供給剛性的期限錯配。",
                        "stocks": ["NVDA", "AMD", "Oracle"],
                    }
                ],
            },
            {
                "name": "L3 CSP 與資料中心",
                "layer": "Layer 3",
                "keyMetric": "北美五大 CSP 佔總 Capex 90%（Amazon ~$200B, MSFT ~$190B）",
                "description": "雲端服務商資本支出指引為最直接領先指標；Google 每月處理 3.2 千兆 Token（年增 7 倍）。",
                "stocks": ["AMZN", "MSFT", "GOOGL", "META"],
                "children": [
                    {
                        "name": "九大 CSP 資本支出",
                        "layer": "L3-A",
                        "keyMetric": "2026 估 $8,867B（較 2025/11 的 $6,000B 連續上修）",
                        "description": "Dell'Oro 預估至 2030 年全球資料中心累計資本支出將突破 3 兆美元。",
                        "stocks": ["是方電訊 (6561)"],
                    }
                ],
            },
            {
                "name": "L4 電力與物理基建",
                "layer": "Layer 4",
                "keyMetric": "IEA 估 2026 用電 1,100 TWh｜單機櫃功耗攀至 136–230kW",
                "description": "電力併網排隊與高壓變壓器交期（逾 2 年）成為 2026 最硬限制，推動 800VDC/HVDC 架構加速。",
                "stocks": ["華城 (1519)", "士電 (1503)", "中興電 (1513)", "台達電 (2308)"],
                "children": [
                    {
                        "name": "重電與併網設備",
                        "layer": "L4-A",
                        "keyMetric": "華城 AIDC 訂單約 220 億｜士電在手逾 600 億",
                        "description": "台電強韌電網與美國基建雙支撐，高壓變壓器產能長期吃緊。",
                        "stocks": ["華城 (1519)", "士電 (1503)", "中興電 (1513)", "亞力 (1514)"],
                    },
                    {
                        "name": "800VDC / HVDC 電源",
                        "layer": "L4-B",
                        "keyMetric": "台達電 Q3 營收 1,970.6 億 (YoY +31%)｜AI 佔比 >25%",
                        "description": "Barclays 預估 800VDC 2029 年佔新增資料中心容量 30%；光寶科 1.32MW Power Rack 放量。",
                        "stocks": ["台達電 (2308)", "光寶科 (2301)", "Vertiv"],
                    },
                ],
            },
            {
                "name": "L5 伺服器與整櫃 ODM",
                "layer": "Layer 5",
                "keyMetric": "2026 AI 伺服器 280 萬台 (+30.5%)｜液冷滲透率 65%",
                "description": "台灣 ODM 掌握 L6–L12 整櫃組裝主導權，鴻海垂直整合最深（市佔 >44%）。",
                "stocks": ["鴻海 (2317)", "廣達 (2382)", "緯創 (3231)", "緯穎 (6669)"],
                "children": [
                    {
                        "name": "整櫃組裝 (L10-L12)",
                        "layer": "L5-A",
                        "keyMetric": "鴻海週產能 ~1,000 櫃｜廣達 2.1k 櫃/月",
                        "description": "高功率整櫃驗證向第三方高功率實驗室（1.2MW+）外包。",
                        "stocks": ["鴻海 (2317)", "廣達 (2382)", "緯創 (3231)", "東研信超 (6840)"],
                    },
                    {
                        "name": "機殼與導軌機構件",
                        "layer": "L5-B",
                        "keyMetric": "川湖 8 月營收 YoY +344%｜液冷機櫃標準化",
                        "description": "高承重滑軌與 Compute Tray 帶動單價與毛利率跳升。",
                        "stocks": ["川湖 (2059)", "勤誠 (8210)", "營邦 (3693)", "晟銘電 (3013)"],
                    },
                ],
            },
            {
                "name": "L6 關鍵零組件 (6A-6I)",
                "layer": "Layer 6",
                "keyMetric": "HBM 擠壓 DRAM、T-glass 短缺、45°C 液冷與 CPO 轉型",
                "description": "涵蓋運算晶片、記憶體、載板/CCL、散熱、光通訊/CPO 與連接器，各自具有不同稀缺性。",
                "stocks": ["創意 (3443)", "南亞科 (2408)", "台光電 (2383)", "奇鋐 (3017)", "聯亞 (3081)"],
                "children": [
                    {
                        "name": "6A 運算晶片與 ASIC",
                        "layer": "L6-A",
                        "keyMetric": "NVIDIA Q2 FY27 $96.2B｜Broadcom AI 半導體 +221%",
                        "description": "客製化 XPU 擴張帶動台廠 3nm/2nm 設計服務業績爆發。",
                        "stocks": ["NVDA", "AVGO", "創意 (3443)", "世芯-KY (3661)", "智原 (3035)"],
                    },
                    {
                        "name": "6B 記憶體 (HBM/DRAM)",
                        "layer": "L6-B",
                        "keyMetric": "SK 海力士營業利益率 ~79%｜南亞科 Q3 YoY +373%",
                        "description": "HBM4 佔用大量晶圓產能，嚴重擠壓傳統 DRAM 供給並推升利基型報價。",
                        "stocks": ["南亞科 (2408)", "華邦電 (2344)", "旺宏 (2337)", "群聯 (8299)"],
                    },
                    {
                        "name": "6C 載板與高階 CCL",
                        "layer": "L6-C",
                        "keyMetric": "ABF 2028 缺口估達 42%｜T-glass 玻纖布僅日東紡認證",
                        "description": "AI 佔 ABF 需求將由 24% 升至 46%，高速 CCL 與高層數板規格持續升級。",
                        "stocks": ["台光電 (2383)", "台燿 (6274)", "欣興 (3037)", "南電 (8046)", "金像電 (2368)"],
                    },
                    {
                        "name": "6E 散熱 (45°C 進水分化)",
                        "layer": "L6-E",
                        "keyMetric": "奇鋐水冷板擴至 60 萬套/月｜冷板/歧管/CDU 高度受惠",
                        "description": "Rubin 可接受 45°C 進水省去冷水機，冷板、快接頭與 CDU 成剛性需求。",
                        "stocks": ["奇鋐 (3017)", "雙鴻 (3324)", "台達電 (2308)"],
                    },
                    {
                        "name": "6F 光通訊與 CPO",
                        "layer": "L6-F",
                        "keyMetric": "測試插入點由 1-2 次增至 4 次以上｜2027 架構收斂",
                        "description": "涵蓋 CW 雷射光源、PIC 矽光子、微光學、FAU 對位封裝與 1.6T 收發模組。",
                        "stocks": ["聯亞 (3081)", "全新 (2455)", "上詮 (3363)", "波若威 (3163)", "智邦 (2345)"],
                    },
                ],
            },
            {
                "name": "L7 晶圓代工・封測・設備",
                "layer": "Layer 7",
                "keyMetric": "台積電 Q3 毛利率 66.4%｜CoWoS 2027 底估達 17 萬片/月",
                "description": "先進製程、CoWoS/CoPoS 封裝、測試介面與濕製程設備決定最終良率與交期。",
                "stocks": ["台積電 (2330)", "日月光 (3711)", "京元電 (2449)", "弘塑 (3131)"],
                "children": [
                    {
                        "name": "先進封裝 (CoWoS/CoPoS)",
                        "layer": "L7-A",
                        "keyMetric": "NVDA 佔 CoWoS ~60%｜CoPoS 310×310mm 2028 下半年量產",
                        "description": "玻璃核心基板夾於兩層 ABF 預計 2028Q4-2029Q1 量產，採互補升級模式。",
                        "stocks": ["台積電 (2330)", "日月光投控 (3711)", "弘塑 (3131)", "辛耘 (3583)", "萬潤 (6187)"],
                    },
                    {
                        "name": "AI 測試與驗證設備",
                        "layer": "L7-B",
                        "keyMetric": "測試時間 +100-200%｜京元電 Capex 上調至 500 億",
                        "description": "涵蓋 ATE 雙寡占、分選機主動溫控 (ATC)、探針卡、測試座與高功率實驗室。",
                        "stocks": ["京元電 (2449)", "致茂 (2360)", "鴻勁 (7769)", "旺矽 (6223)", "穎崴 (6515)"],
                    },
                    {
                        "name": "廠務工程與特化材料",
                        "layer": "L7-C",
                        "keyMetric": "亞翔在手訂單 4,400 億｜漢唐 1,939 億能見度達 2028",
                        "description": "建廠潮帶動無塵室統包、EUV 光罩盒、CMP 鑽石碟與 N2 特化材料需求。",
                        "stocks": ["亞翔 (6139)", "漢唐 (2404)", "帆宣 (6196)", "家登 (3680)", "中砂 (1560)"],
                    },
                ],
            },
        ],
    }

    watchlist = [
        {
            "ticker": "2330",
            "name": "台積電",
            "sector": "L7 晶圓代工與先進封裝",
            "price": "1,085",
            "change": "+2.36%",
            "up": True,
            "technical": "股價站穩所有均線之上，日 KD 黃金交叉向上，外資回補帶動量能溫和放大，短線支撐觀察 10 日線。",
            "chips": "外資連續三日買超，投信維持長線核心持股水位，千張大戶持股比例穩定集中於 86% 以上。",
            "fundamental": "Q3 2026 毛利率達 66.4%，HPC 佔營收 68%。CoWoS 產能全線滿載且持續外包部分 CoW 至日月光，2nm 製程與 COUPE 矽光子為 2027-28 關鍵動能。",
        },
        {
            "ticker": "2317",
            "name": "鴻海",
            "sector": "L5 伺服器整櫃 ODM",
            "price": "218.5",
            "change": "+1.63%",
            "up": True,
            "technical": "沿上升軌道墊高，季線提供強勁支撐，MACD 柱狀體翻紅，呈多頭緩步攻堅格局。",
            "chips": "三大法人同步站在買方，借券賣出餘額持續下降，籌碼面由凌亂轉趨穩定。",
            "fundamental": "涵蓋 L6–L12 垂直整合最深，機櫃單月出貨市佔逾 44%、週產能約 1,000 櫃，關鍵零組件自製率約 40%，並延伸至模組化資料中心 (L12+)。",
        },
        {
            "ticker": "2308",
            "name": "台達電",
            "sector": "L4/L6H 800VDC 電源與 CDU",
            "price": "412.0",
            "change": "+1.98%",
            "up": True,
            "technical": "跳空突破前波整理平台上緣，成交量放大至 20 日均量 1.5 倍，均線呈多頭排列。",
            "chips": "投信連續買超佈局高壓直流電源題材，外資持股比重穩步回升。",
            "fundamental": "2026 Q3 營收 1,970.6 億元 (YoY +31.09%)，AI 相關營收佔比預估逾 25%、液冷約 12%。±400V/800V HVDC 與 2.5MW 液冷 CDU 搶佔次世代機櫃商機。",
        },
        {
            "ticker": "3017",
            "name": "奇鋐",
            "sector": "L6E 液冷散熱模組",
            "price": "695.0",
            "change": "+3.12%",
            "up": True,
            "technical": "帶量長紅突破月線反壓，RSI 指標進入強勢區但尚未過熱，短線動能強勁。",
            "chips": "投信與自營商同步加碼，融資餘額維持低檔，籌碼結構乾淨。",
            "fundamental": "受惠 Rubin 45°C 進水架構省去冷水機，水冷板、歧管與快接頭成為剛性需求。水冷板月產能由 20 萬套擴至 60 萬套，歧管由 1,000 台擴至 7,000 台。",
        },
        {
            "ticker": "2449",
            "name": "京元電",
            "sector": "L7B AI 晶片測試服務",
            "price": "136.5",
            "change": "+1.11%",
            "up": True,
            "technical": "股價於高檔箱型區間震盪整理，下檔半年線具強力買盤承接。",
            "chips": "法人關注資本支出折舊與 AI 營收佔比變化，外資呈區間來回操作。",
            "fundamental": "資本支出大幅上調至 500 億新台幣，AI 加速器測試時間增加 100-200%、單價提升 50-100%，並具備自製高功率老化爐 (Burn-in) 優勢。",
        },
        {
            "ticker": "3443",
            "name": "創意",
            "sector": "L6A 客製化 ASIC 設計服務",
            "price": "1,480",
            "change": "+2.78%",
            "up": True,
            "technical": "均線糾結後向上發散，站穩所有中短期均線，多方控盤力道明顯。",
            "chips": "外資與投信連日買超，高價股千金族群比價效應升溫。",
            "fundamental": "台積電轉投資，直接受惠北美 CSP 自研 XPU 擴張。2026 Q3 營收 187.5 億元 (QoQ +34.9%)，預估 Q4 季增 35-40%。",
        },
        {
            "ticker": "3081",
            "name": "聯亞",
            "sector": "L6F 矽光子 CW 雷射光源",
            "price": "388.0",
            "change": "-0.77%",
            "up": False,
            "technical": "前波急漲後出現良性量縮回測 5 日線，中長期上升趨勢尚未破壞。",
            "chips": "短線當沖比偏高，須留意高檔獲利了結賣壓與投信動向。",
            "fundamental": "1.6T CW 雷射量產出貨，9 月營收 5.40 億元 (YoY +190%)。因矽光子本身無法發光，外掛 InP 雷射晶片為 CPO 架構下稀缺關鍵環節。",
        },
        {
            "ticker": "2408",
            "name": "南亞科",
            "sector": "L6B 利基型 DRAM 記憶體",
            "price": "74.2",
            "change": "+0.95%",
            "up": True,
            "technical": "底部打底完成後溫和放量上攻，挑戰前波頸線壓力區。",
            "chips": "外資買盤回補記憶體週期反轉標的，官股行庫逢高調節。",
            "fundamental": "HBM 消耗大量晶圓產能並擠壓傳統 DRAM 供給，推升合約價上行；Q3 營收 889.58 億元 (YoY +373.71%)，並規劃屏東 3D TSV 封測廠。",
        },
    ]

    dev_logs = [
        {
            "id": "log-web-architecture",
            "category": "網站開發",
            "date": "2026-11-12",
            "title": "「麥克在幹嘛」Web 端 Next.js 靜態匯出與 GitHub Pages 部署管線",
            "status": "進行中",
            "highlights": [
                "採用 Next.js 15 App Router + `output: 'export'` 純靜態架構，設定 `basePath: '/michael-doing-what-web'` 對應 GitHub Pages 專案路徑。",
                "實作 `scripts/sync_data.py` 無代碼 CMS 管線：自動掃描 `Data_Pipeline/Outings/` 與 `Learning/`，將照片、PDF 與研究報告打包為 `public/data/*.json`。",
                "整合 Apache ECharts 繪製《AI 產業鏈研究報告 v5》7 層互動式樹狀圖，支援節點展開收合與點擊聯動詳細財報/台廠卡片。",
            ],
        },
        {
            "id": "log-local-llm-fastapi",
            "category": "本機 AI 引擎",
            "date": "2026-11-11",
            "title": "Mac mini Apple Silicon 本機 Ollama + FastAPI (Port 8765) 推論後端",
            "status": "已上線",
            "highlights": [
                "於 Mac mini 上掛載 `stock-research:4b-shadow` 與 `stock-research:0.6b-v6-seed42-20261007-shadow-r3` 微調模型，透過 `AsyncClient` 提供低延遲 JSON 結構化輸出。",
                "完成 iOS App 與 Web 端共用資料契約設計，確保晨間戰情與個股三面向卡片（技術、籌碼、AI 基本面）可離線快取與靜態同步。",
                "將大型模型權重、Docker 容器與金融資料庫卸載至外接硬碟 `Michael Workspace`，釋放本機 SSD 空間。",
            ],
        },
        {
            "id": "log-strategy-game-ai",
            "category": "遊戲開發日誌",
            "date": "2026-10-29",
            "title": "即時戰略遊戲 (AoE / 神話世紀：重述) 經濟平衡與 AI 腳本策略筆記",
            "status": "持續紀錄",
            "highlights": [
                "拆解前期村民資源分配模型（食物/木材/黃金動態權重）與升級時代的最佳時間窗，類比製造業產能爬坡的瓶頸管理。",
                "測試多線騷擾 (Multi-tasking) 與防禦塔推進的 Nash 混合策略配比，記錄高難度 AI 對戰中的兵種克制與地圖控制邏輯。",
                "探索將戰略資源調度狀態機視覺化，作為未來發想專案互動小工具的原型靈感。",
            ],
        },
    ]

    with open(DATA_OUT / "projects.json", "w", encoding="utf-8") as fp:
        json.dump(
            {
                "updatedAt": "2026-11-12",
                "aiSupplyChain": ai_supply_chain,
                "watchlist": watchlist,
                "devLogs": dev_logs,
            },
            fp,
            ensure_ascii=False,
            indent=2,
        )
    print(f"[Projects] 已產出 7 層 AI 產業鏈、{len(watchlist)} 檔自選股與 {len(dev_logs)} 篇開發日誌")


if __name__ == "__main__":
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    sync_outings()
    sync_learning()
    generate_dashboard()
    generate_projects()
    print("✅ 所有靜態資料同步完成！")
