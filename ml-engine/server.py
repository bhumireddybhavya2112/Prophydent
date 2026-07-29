from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import base64
import io
import os
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_API_KEY_HERE":
    genai.configure(api_key=GEMINI_API_KEY)
    # Using the Gemini 2.5 Flash multimodal model (Free Tier Compatible)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    gemini_model = None
    print("⚠️ Warning: Gemini API Key not found in .env! Medical Reports will be disabled.")

app = Flask(__name__)
CORS(app) # Allow React to talk to this server

# Load ALL 5 models!
MODEL_PATHS = ['best (1).pt', 'best (2).pt', 'best (3).pt', 'best (4).pt', 'best (5).pt']
models = []
for path in MODEL_PATHS:
    try:
        model = YOLO(path)
        models.append(model)
        print(f"✅ Successfully loaded {path}")
    except Exception as e:
        print(f"⚠️ Warning: Could not load {path}. Make sure it is inside the ml-engine folder! Error: {e}")

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if not models:
        return jsonify({"error": "No models loaded on the server. Please check the terminal!"}), 500

    try:
        # Get JSON from React
        data_payload = request.get_json(force=True)
        base64_data = data_payload.get("image", "")
        role = data_payload.get("role", "doctor")
        
        # Decode the image
        image_data = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        width, height = image.size
        
        # Format results exactly how the React app expects them
        predictions = []
        
        # Run YOLO inference for EVERY model and combine the results!
        for model in models:
            results = model(image)
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # get box coordinates in center x, center y, width, height format
                    xywh = box.xywh[0].tolist() 
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    class_name = model.names[cls]
                    
                    predictions.append({
                        "class": class_name,
                        "confidence": conf,
                        "x": xywh[0],
                        "y": xywh[1],
                        "width": xywh[2],
                        "height": xywh[3]
                    })
                    
        # --- GEMINI PRIMARY ANALYSIS ---
        gemini_report = None
        if gemini_model:
            try:
                print(f"🧠 Asking Gemini to analyze the image for a {role}...")
                if role == 'patient':
                    prompt = f"""
                    You are a friendly, reassuring, and highly skilled dentist speaking directly to a patient.
                    Please analyze the attached dental photograph. 
                    (Note: Our internal system flagged these areas: {predictions}, but use your judgment.)
                    
                    Provide a VERY simple, brief, and easy-to-understand summary of what you see.
                    Use plain English. DO NOT use scary medical jargon or complex formatting.
                    Provide a few simple, reassuring next steps for the patient to take under the explicit heading "**Preventive Plan**". Do not use the words "Treatment Plan".
                    Keep the entire response short and concise.
                    """
                else:
                    prompt = f"""
                    You are a world-class Chief Dental Officer. 
                    Please analyze the attached clinical dental photograph. 
                    (Note: Our internal diagnostic system flagged the following potential areas of interest: {predictions}, but you should make your own independent clinical assessment.)
                    
                    Provide a highly professional, comprehensive clinical summary of what you see in the image. 
                    Then, you MUST provide the next steps under the explicit heading "**Preventive Plan**". Do not use the words "Treatment Plan" or "Recommended Treatment Plan" anywhere.
                    Format your response clearly. Speak directly to the attending dentist. Be confident and precise.
                    CRITICAL INSTRUCTION: You MUST end your response immediately after the preventive plan. DO NOT include ANY sign-offs, signatures, or closing remarks whatsoever (e.g. absolutely no "Sincerely," or "Chief Dental Officer").
                    """
                # Pass BOTH the text prompt AND the raw image to Gemini!
                response = gemini_model.generate_content([prompt, image])
                gemini_report = response.text
                
                # Forcefully remove any signatures the AI might have accidentally added
                if "Sincerely," in gemini_report:
                    gemini_report = gemini_report.split("Sincerely,")[0].strip()
                if "Chief Dental Officer" in gemini_report:
                    gemini_report = gemini_report.replace("Chief Dental Officer", "").strip()
                
                print("✅ Gemini report generated!")
            except Exception as e:
                print(f"❌ Gemini Error: {e}")
                gemini_report = f"Could not generate report. Error: {e}"

        return jsonify({
            "image": {"width": width, "height": height},
            "predictions": predictions,
            "gemini_report": gemini_report
        })

    except Exception as e:
        print("Error during inference:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting ProphyDent AI Server on port {port}...")
    app.run(host='0.0.0.0', port=port)
