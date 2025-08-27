import os
import shutil
from fastapi import FastAPI, Depends, UploadFile, File, Form
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import requests
from urllib.parse import quote
from openai import OpenAI
from schemas import PostTodo
from models import TodoModel
from settings import SessionLocal, settings
from sqlalchemy.orm import Session
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
from langchain.schema import Document

app = FastAPI()

# CORSミドルウェアを追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのオリジン
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/uploadfile")
async def upload_file(user_input: str = Form(...), file: UploadFile = File(...)):
    # ファイルをディスクに保存せず、メモリ上で処理
    file_bytes = await file.read()

    print(file_bytes)
    try:
        content = file_bytes.decode("utf-8")
    except Exception:
        content = file_bytes.decode("utf-8", errors="replace")

    print(content)

 
    # RAG処理を関数化して呼び出す
    rag_result = rag_process_from_text(content, user_input)

    # ai agentが楽天検索APIを呼び出す
    result = search_rakuten_with_openai(rag_result["hits"], user_input)

    return result


# RAGの一連処理を関数化
def rag_process_from_text(content: str, query_text: str):
    # ドキュメント化
    docs = [Document(page_content=content, metadata={"source": "upload_in_memory"})]

    # テキスト分割
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    split_docs = splitter.split_documents(docs)

    # 埋め込み生成
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)

    # 永続化先ディレクトリを作成
    persist_dir = "chroma_db"
    os.makedirs(persist_dir, exist_ok=True)

    # コレクション名を一意に生成して保存
    collection_name = f"col_{uuid4().hex}"
    vectordb = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_name=collection_name,
    )

    # クエリで類似検索
    top_k = 5
    hits = vectordb.similarity_search(query_text, k=top_k)

    # 必要ならここでOpenAIのfunction-callingで楽天検索等を呼び出す（別関数）
    return { "hits": hits}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


def search_rakuten_with_openai(hits, user_input: str):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    context = "\n\n".join(getattr(d, "page_content", "")[:400] for d in (hits or []))

    tools = [{
        "type": "function",
        "function": {
            "name": "search_rakuten",
            "description": "楽天市場 商品検索APIのパラメータ（キーワード、並び順、価格帯、件数など）を決める。プレゼントに適した商品を探す。",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {"type": "string", "description": "UTF-8日本語の検索キーワード"},
                    "minPrice": {"type": "integer", "minimum": 0},
                    "maxPrice": {"type": "integer", "minimum": 0},
                    "hits": {"type": "integer", "minimum": 1, "maximum": 30, "default": 10},
                },
                "required": ["keyword"]
            }
        }
    }]

    messages = [
        {"role": "system", "content": "あなたは日本語のEC検索アシスタントです。"},
        {"role": "user", "content": f"以下の会話文チャンクとリクエスト文から、楽天市場で探すべき『プレゼント商品』の検索条件を決めてください。\n\nリクエスト文:\n{user_input}\n\n会話文チャンク(抜粋):\n{context}\n\n価格帯や並び順も適切に決めてください。"}
    ]

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    choice = resp.choices[0]
    if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
        import json
        args = choice.message.tool_calls[0].function.arguments
        params = json.loads(args)
    else:
        params = {"keyword": user_input, "sort": "standard", "hits": 10, "page": 1}

    base_url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    req_body = {
        "applicationId": settings.RAKUTEN_APPLICATION_ID,
        "format": "json",
        "formatVersion": 2,
        "keyword": params.get("keyword", ""),
    }

    if "minPrice" in params: req_body["minPrice"] = params["minPrice"]
    if "maxPrice" in params: req_body["maxPrice"] = params["maxPrice"]

    r = requests.get(base_url, params=req_body, timeout=15)
    r.raise_for_status()
    data = r.json()

    return {
        "request_params": params,
        "rakuten_params": req_body,
        "items": data.get("Items", []),
        "count": len(data.get("Items", [])),
    }
