import sys
import os
import base64
import tempfile
from PIL import Image
import io
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

client = OpenAI()

def main():
    if len(sys.argv) < 2:
        print("Usage: python image_gen_console.py <image_path>")
        sys.exit(1)
    input_path = sys.argv[1]
    if not os.path.isfile(input_path):
        print(f"File not found: {input_path}")
        sys.exit(1)

    # Read and convert image to PNG (RGBA)
    with open(input_path, "rb") as f:
        image_bytes = f.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        image.save(tmp, format="PNG")
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as img_file:
            result = client.images.edit(
                model="gpt-image-1",
                image=img_file,
                prompt="Recreate this image in animated style with elements from ghibli studio but keeping the original color grading. Pay special attention to not breaking the physics of the environment, or of hands, and really try to preserve the essence of the subject(s) of the photo. Also, please NEVER flip the image or subjects on any axis.",
                size="1536x1024",
                quality="high"
            )
        print(result.usage)
        image_base64 = result.data[0].b64_json
        output_bytes = base64.b64decode(image_base64)
        output_path = os.path.splitext(input_path)[0] + "_animated.png"
        with open(output_path, "wb") as out_f:
            out_f.write(output_bytes)
        print(f"Output saved to: {output_path}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        os.remove(tmp_path)

if __name__ == "__main__":
    main()
