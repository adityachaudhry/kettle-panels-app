# Kettle Panels

[![Watch the video](https://img.youtube.com/vi/TdLtUyuHQOo/hqdefault.jpg)](https://www.youtube.com/embed/TdLtUyuHQOo)

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   ```
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

## Run Server
cd server
conda activate fastapi-env
python -m uvicorn run:app --reload

## Run App
yarn start