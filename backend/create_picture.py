import openai
import base64
from settings import settings  # APIキーを安全に管理する場合

openai.api_key = settings.OPENAI_API_KEY  # または直接 "sk-XXXXX"

#メッセージからDALL·E 2を使って画像生成をする

def generate_image(prompt: str, size="512x512") -> bytes:
    """
    生成した画像をバイナリで返す
    """
    response = openai.images.generate(
        model="gpt-image-1",  # DALL·E 2 相当
        prompt=prompt,
        size=size
    )
    # 画像は base64 で返ってくる
    image_b64 = response.data[0].b64_json
    image_bytes = base64.b64decode(image_b64)
    return image_bytes