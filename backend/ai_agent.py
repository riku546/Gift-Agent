from openai import OpenAI
from settings import settings
import requests
import json

def search_rakuten(keyword: str):
    # 楽天市場商品検索APIを実行する共通処理を分離
    base_url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    req_body = {
        "applicationId": settings.RAKUTEN_APPLICATION_ID,
        "format": "json",
        "formatVersion": 2,
        "keyword": keyword,
        "hits": 2,
    }
  

    r = requests.get(base_url, params=req_body, timeout=15)
    r.raise_for_status()
    data = r.json()
    items = data.get("Items", data.get("items", []))
    
    return {
        "items": items,
    }

tools = [{
        "type": "function",
        "function": {
            "name": "search_rakuten",
            "description": "楽天市場 商品検索APIのパラメータを決定する。",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {"type": "string", "description": "UTF-8日本語の検索キーワード"},
                },
                "required": ["keyword"]
            }
        }
    }]




def search_rakuten_with_openai(hits, user_input: str):
    """
    入力:
      - hits: RAG の類似検索で返された Document のリスト（チャンク）
      - user_input: フロントからのリクエストに含まれる自由文

    目的:
      - hits を元に context を作成し、LLM に楽天APIの検索条件を生成してもらう
      - 生成された条件を使用して楽天APIを呼び出す
    """

    # 1) OpenAI クライアントを初期化
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    # 2) hits からコンテキストを作成（抜粋）
    context = "\n\n".join(getattr(d, "page_content", "")[:400] for d in (hits or []))

    # 4) context と user_input を組み合わせて、LLM に条件生成を依頼する
    messages = [
        {"role": "system", "content": "あなたは日本語のEC検索アシスタントです。"},
        {"role": "user", "content": f"以下の会話文チャンクとリクエスト文から、楽天市場で探すべき『プレゼント商品』の検索条件を決めてください。\n\nリクエスト文:\n{user_input}\n\n会話文チャンク(抜粋):\n{context}\n\n価格帯や並び順も適切に決めてください。"}
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

    # 6) Rakuten API 呼び出しは、LLMが function calling で指示した場合にのみ実行する
    if is_function_calling:
        return search_rakuten(keyword)
    else:
        return {"items": [], "count": 0, "rakuten_params": {}}
