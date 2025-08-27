# 初期設定


## backend

```
cd backend
```

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

### fastapi install
```
pip install fastapi
```

### unicorn install
```
pip install "uvicorn[standard]"
```

### SQLAlchemy install

```
pip install alembic SQLAlchemy
```



### サーバー立ち上げ
venvを有効化してから以下のコマンドを実行
```
uvicorn main:app --reload
```


## frontend
**nodeをインストールしておいてください。**

- [windows](https://nodejs.org/ja/download)
- [wsl](https://learn.microsoft.com/ja-jp/windows/dev-environment/javascript/nodejs-on-ws)




```
cd frontend
```

### 依存関係のインストール
```
npm i
```


サーバー立ち上げ
```
npm run dev
```