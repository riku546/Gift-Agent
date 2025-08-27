# 初期設定

### venv作成

```
python3 -m venv venv
```

### venv有効化
#### windows
```
venv/Script/activate
```

#### wsl or linux
```
source venv/bin/activate
```

### dependencies install

```
 pip install -r requirements.txt
```



### サーバー立ち上げ
uvicorn main:app --reload

- uvicorn サーバー
- main:app main.py で作成された app オブジェクト
- --reload 立ち上げ後一旦リロードする

alembic revision --autogenerate -m "create todo table"
