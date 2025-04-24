from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/image-gen")
async def image_gen(request: Request):
    data = await request.json()
    image_base64 = data.get("image")
    return JSONResponse(content={"image": image_base64})