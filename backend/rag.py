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

    
    return { "hits": hits}