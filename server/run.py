from dotenv import load_dotenv
load_dotenv()

import base64
import tempfile
import os
from PIL import Image
import io

from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

from openai import OpenAI
client = OpenAI()

app = FastAPI()

@app.post("/image-gen")
async def image_gen(request: Request):
    data = await request.json()
    image_base64 = data.get("image")
    image_bytes = base64.b64decode(image_base64)

    # Convert to PNG using PIL
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        image.save(tmp, format="PNG")
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as img_file:
            result = client.images.edit(
                model="gpt-image-1",
                image=img_file,
                prompt="Recreate this image in animated style with elements from ghibli studio but keeping the original color grading. Pay special attention to not breaking the physics of the environment and really try to preserve the essence of the subject(s) of the photo.",
                size="1536x1024",
                quality="high"
            )
        image_base64 = result.data[0].b64_json
        os.remove(tmp_path)
        return JSONResponse(content={"image": image_base64})
    except Exception as e:
        print(e)
        os.remove(tmp_path)
        return JSONResponse(content={"image": image_base64})