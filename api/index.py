from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os

app = FastAPI(title="Fitness App Live Analysis API", description="Computer Vision module for chunked video exercise analysis.", version="1.0.0")

# --- Helper Math ---
def calculate_angle(a, b, c):
    """
    Calculates the 2D angle between three coordinate points.
    a = First point [x,y]
    b = Mid point [x,y]
    c = End point [x,y]
    """
    import numpy as np
    a = np.array(a) # First
    b = np.array(b) # Mid
    c = np.array(c) # End
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

# Lazy load MediaPipe Pose to prevent Vercel Serverless SIGBUS core dumps on cold boot
_mp_pose = None
_pose_model = None

def get_pose_model():
    global _mp_pose, _pose_model
    if _pose_model is None:
        import mediapipe as mp
        _mp_pose = mp.solutions.pose
        _pose_model = _mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    return _mp_pose, _pose_model

@app.get("/live/health")
def health_check():
    return {"status": "ok", "message": "Live Analysis Python Serverless Module is running via FastAPI."}

@app.post("/live/analyze/chunk")
async def analyze_chunk(video_chunk: UploadFile = File(...)):
    """
    Receives a 3-5 second video chunk from the client.
    Extracts frames and processes them sequentially via MediaPipe.
    """
    if not video_chunk.filename.endswith(('.mp4', '.webm', '.mov')):
        raise HTTPException(status_code=400, detail="Invalid video format. Use mp4, webm, or mov.")

    import cv2
    import numpy as np

    # Save the chunk temporarily to disk for OpenCV to read
    temp_video_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await video_chunk.read())
            temp_video_path = temp_file.name

        # Initialize VideoCapture with the temp file
        cap = cv2.VideoCapture(temp_video_path)
        
        frames_processed = 0
        rep_count_increment = 0
        feedback_messages = []
        stage = None

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break # Reached end of chunk
            
            # Recolor image to RGB for MediaPipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
          
            # Make detection
            mp_pose, pose = get_pose_model()
            results = pose.process(image)
        
            # Extract landmarks and calculate angles/form
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # --- Example: Detect Squat Depth (Hip, Knee, Ankle) ---
                # Get coordinates
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                # Calculate angle
                angle = calculate_angle(hip, knee, ankle)
                
                # Basic rep counting logic (State machine: Down -> Up)
                # If angle < 90, user is down in squat. If > 160, user is standing.
                # Since this is a chunk, we just track the lowest point and highest point to estimate a rep cycle.
                
                # Extremely simplified demonstration logic for chunk accumulation:
                if angle > 160:
                    stage = "up"
                if angle < 90 and stage == "up":
                    stage = "down"
                    rep_count_increment += 1
                    feedback_messages.append("Good depth on squat!")
            
            frames_processed += 1

        cap.release()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        # Clean up the temp file
        if temp_video_path and os.path.exists(temp_video_path):
            os.remove(temp_video_path)

    return JSONResponse(
        status_code=200, 
        content={
            "status": "success", 
            "frames_analyzed": frames_processed,
            "reps_detected_in_chunk": rep_count_increment, 
            "feedback": "Analysis complete for chunk."
        }
    )

# Required for Vercel
# Vercel's Python builder automatically looks for the entry point `app`
