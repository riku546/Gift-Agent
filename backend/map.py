from openai import OpenAI
from settings import settings
import requests
import json

#yahoo地図ローカルサーチAPIで店舗検索を行う関数
def search_map(keyword: str, lat:float, lng:float):
    base_url = "https://map.yahooapis.jp/search/local/V1/localSearch"
    req_body = {
        "appid": settings.YAHOO_API_KEY,
        "query": keyword,
        "results": 10,
        "output": "json",
    }
    #現在地があれば追加
    if lat is not None and lon is not None:
        req_body["lat"] = lat
        req_body["lon"] = lon
        req_body["dist"] = 5  # 半径5km以内など指定可能

  

    r = requests.get(base_url, params=req_body, timeout=15)
    r.raise_for_status()
    data = r.json()
    stores = data.get("Feature", [])
    return {
        "stores": stores,
        "count": len(stores)
    }

tools = [{
        "type": "function",
        "function": {
            "name": "search_map",
            "description": "Yahoo!map 店舗検索APIのパラメータを決定する。",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {"type": "string", "description": "UTF-8日本語の検索キーワード"},
                    "lat": {"type": "number", "description": "現在地の緯度"},
                    "lon": {"type": "number", "description": "現在地の経度"},
                },
                "required": ["keyword"]
            }
        }
    }]




def search_yahoo_with_openai(hits, user_input: str, float = None, lat: float = None, lng:float = None):
    """
    入力:
      - hits: RAG の類似検索で返された Document のリスト（チャンク）
      - user_input: フロントからのリクエストに含まれる自由文

    目的:
      - hits を元に context を作成し、LLM にYahoo!mapAPIの検索条件を生成してもらう
      - 生成された条件を使用してyahoomapAPIを呼び出す
    """

    # 1) OpenAI クライアントを初期化
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    # 2) hits からコンテキストを作成（抜粋）
    context = "\n\n".join(getattr(d, "page_content", "")[:400] for d in (hits or []))

    # 4) context と user_input を組み合わせて、LLM に条件生成を依頼する
    messages = [
        {"role": "system", "content": "あなたは日本語のEC検索アシスタントです。"},
        {"role": "user", "content": f"以下の会話文チャンクとリクエスト文から、Yahoo!マップで探すべき『プレゼント商品を買うことができる店』の検索条件を決めてください。\n\nリクエスト文:\n{user_input}\n\n会話文チャンク(抜粋):\n{context}\n\n価格帯や距離や並び順も適切に決めてください。"}
    ]

    #gptにメッセージを送信
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    # gptがfunction callingを呼び出すかどうか
    choice = resp.choices[0]
    is_function_calling = choice.finish_reason == "tool_calls" and choice.message.tool_calls

    if is_function_calling:
    # function callingを呼び出す場合
        args = choice.message.tool_calls[0].function.arguments
        params = json.loads(args)
    else:
        # tool_call が発生しなかった場合はフォールバックのパラメータを設定
        params = {"keyword": user_input}

    # 5) 抽出したパラメータを使って Rakuten API を呼ぶ
    keyword = params.get("keyword", user_input)

    # 6) Yahoomap API 呼び出しは、LLMが function calling で指示した場合にのみ実行する
    if is_function_calling:
        return search_map(keyword, lat, lng)
    else:
        return {"stores": [], "count": 0, "map_params": {}}