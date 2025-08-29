import openai
import base64
from settings import settings  # APIキーを安全に管理する場合

openai.api_key = settings.OPENAI_API_KEY  

#メッセージからDALL·E 2を使って画像生成をする

def generate_image(prompt: str) -> str:
    """
    生成した画像をバイナリで返す
    """
    response = openai.images.generate(
        model="dall-e-2",  # DALL·E 2 相当
        prompt=f"以下の状況に最適に画像を生成してください。状況：{prompt}",
        size="1024x1024",
    )

    print(response)
    # 画像は base64 で返ってくる
    image_url = f"{response.data[0].url}"
    return image_url    