
from fastapi import Body, FastAPI, HTTPException, Request, UploadFile, File, Form
from models import UserModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from settings import SessionLocal
from uuid import uuid4
from map import search_yahoo_with_openai

from rag import rag_process_from_text
from ai_agent import search_rakuten_with_openai
from create_picture import generate_image

app = FastAPI()

#CORSミドルウェアを追加
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


@app.post("/gift_search")
async def gift_search(user_input: str = Body(..., embed=True), text_data: str = Body(..., embed=True), lat:float= Body(..., embed=True), lng:float = Body(..., embed=True)):
    
    # RAG処理を関数化して呼び出す
    rag_result = rag_process_from_text(text_data, user_input)

    # ai agentが楽天検索APIを呼び出す
    result1 = search_rakuten_with_openai(rag_result["hits"], user_input)
    # ai agentが画像生成APIを呼び出す
    result2 = generate_image(user_input)
    

    ## ai agentがやほーAPIを呼び出す
    map_result = search_yahoo_with_openai(rag_result["hits"], user_input, lat, lng)


    return {'items':result1, 'image':result2, "map_items":map_result}



@app.post('/signup')
async def signup(user_name: str = Form(...), password:str = Form(...)):
    db = next(get_db())
    user_id = str(uuid4())
    new_user = UserModel(
        id=user_id,
        name=user_name, password=password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.patch('/login')
async def login(user_name: str = Form(...), password:str = Form(...)):
    db = next(get_db())
    user = db.query(UserModel).filter(UserModel.name == user_name).first()


    if user == None:
        raise HTTPException(status_code=404, detail="ユーザーが存在しません")

    if user.password != password:
        raise HTTPException(status_code=401, detail="パスワードが間違っています")

    #session_tokenを更新する
    user.session_token = str(uuid4())
    db.commit()
    db.refresh(user)

    return user


@app.delete("/logout")
async def logout(user_id:str = Body(..., embed=True)):
    db = next(get_db())
    print(user_id)
 
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    user.session_token = ""
    db.commit()
    db.refresh(user)

    return user


@app.get("/user")
async def get_user(request:Request):
    db = next(get_db())


    session_token = request.headers.get("session_token")
    user = db.query(UserModel).filter(UserModel.session_token == session_token).first()

    if user == None:
         raise HTTPException(status_code=401, detail="ログインしてください")

    return user

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")


