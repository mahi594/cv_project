from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from cv_pipeline import process_image

app = FastAPI(title="Interactive CV Tool Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process")
async def process_endpoint(
    file: UploadFile = File(...), 
    category: str = Form("edge_detection"),
    params: str = Form(...)
):
    try:
        image_bytes = await file.read()
        parameters = json.loads(params)
        
        result = process_image(image_bytes, category, parameters)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
