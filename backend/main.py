
from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from settings import SessionLocal


from rag import rag_process_from_text
from ai_agent import search_rakuten_with_openai

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

    try:
        content = file_bytes.decode("utf-8")
    except Exception:
        content = file_bytes.decode("utf-8", errors="replace")


 
    # RAG処理を関数化して呼び出す
    rag_result = rag_process_from_text(content, user_input)

    # ai agentが楽天検索APIを呼び出す
    result = search_rakuten_with_openai(rag_result["hits"], user_input)

    return result





if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


