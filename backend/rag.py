import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
from langchain.schema import Document
from settings import settings

# RAGの一連処理を関数化
# 引数: テキストデータ, 検索クエリ
def rag_process_from_text(content: str, query_text: str):
    # ドキュメント化 #配列で処理
    doc = Document[page_content=content]
    
    # テキスト分割
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    split_docs = text_splitter.split_documents(doc)

    # 埋め込み生成(ベクトル化)
    

    # 永続化先ディレクトリを作成
    

    # コレクション名を一意に生成して保存
    
    # クエリで類似検索
    top_k = 5
    hits = vectordb.similarity_search(query_text, k=top_k)

    
    return { "hits": hits}