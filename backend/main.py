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


#


@app.post("/uploadfile")
async def upload_file(text: str = Form(...), file: UploadFile = File(...)):
    upload_dir = "uploaded_files"
    os.makedirs(upload_dir, exist_ok=True)

  

    # 保存パス
    file_path = f"{upload_dir}/{file.filename}"

    try:
        # ファイルをローカルに保存
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1) ドキュメント読み込み（TXT）
        loader = TextLoader(file_path, encoding="utf-8")
        docs = loader.load()  # List[Document]

      

        # 2) テキスト分割（チャンク化）
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
        )
        split_docs = splitter.split_documents(docs)

        # 3) ベクトル化（埋め込み）
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)

        # 4) Chroma に保存（永続化）
        persist_dir = "chroma_db"
        collection_name = "default"
        os.makedirs(persist_dir, exist_ok=True)

        collection_name = f"col_{uuid4().hex}"

        vectordb = Chroma.from_documents(
            documents=split_docs,
            embedding=embeddings,
            persist_directory=persist_dir,
            collection_name=collection_name,
        )

        # フォームtextで類似検索
        top_k = 5
        hits = vectordb.similarity_search(text, k=top_k)

        # OpenAI function calling で楽天API検索
        rakuten = search_rakuten_with_openai(hits, text)

        return {
            "filename": file.filename,
            "file_path": file_path,
            "collection": collection_name,
            "hits_count": len(hits),
            "rakuten": rakuten,
        }

    finally:
        # 処理が完了したら、ファイルハンドルを閉じる
        file.file.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


def search_rakuten_with_openai(hits, free_text: str):
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
                    "sort": {"type": "string", "enum": ["standard","+itemPrice","-itemPrice","+reviewAverage","-reviewAverage","+reviewCount","-reviewCount"], "default": "standard"},
                    "minPrice": {"type": "integer", "minimum": 0},
                    "maxPrice": {"type": "integer", "minimum": 0},
                    "hits": {"type": "integer", "minimum": 1, "maximum": 30, "default": 10},
                    "page": {"type": "integer", "minimum": 1, "maximum": 100, "default": 1}
                },
                "required": ["keyword"]
            }
        }
    }]

    messages = [
        {"role": "system", "content": "あなたは日本語のEC検索アシスタントです。"},
        {"role": "user", "content": f"以下の会話文チャンクとリクエスト文から、楽天市場で探すべき『プレゼント商品』の検索条件を決めてください。\n\nリクエスト文:\n{free_text}\n\n会話文チャンク(抜粋):\n{context}\n\n価格帯や並び順も適切に決めてください。"}
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
        params = {"keyword": free_text, "sort": "standard", "hits": 10, "page": 1}

    base = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    q = {
        "applicationId": settings.RAKUTEN_APPLICATION_ID,
        "format": "json",
        "formatVersion": 2,
        "keyword": params.get("keyword", ""),
       
    }
    if "minPrice" in params: q["minPrice"] = params["minPrice"]
    if "maxPrice" in params: q["maxPrice"] = params["maxPrice"]

    


    r = requests.get(base, params=q, timeout=15)
    r.raise_for_status()
    data = r.json()

    return {
        "request_params": params,
        "rakuten_params": q,
        "items": data.get("Items", []),
        "count": len(data.get("Items", [])),
    }
