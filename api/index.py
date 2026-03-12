from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

# Limit multiprocessing threads to prevent SIGBUS core dumps in Vercel's AWS Lambda /dev/shm 64MB constraint
os.environ['JOBLIB_TEMP_FOLDER'] = '/tmp'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['VECLIB_MAXIMUM_THREADS'] = '1'
os.environ['NUMEXPR_NUM_THREADS'] = '1'

app = FastAPI(title="Fitness App Live Analysis API", description="Computer Vision module for chunked video exercise analysis.", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
_global_rep_state = "extended"

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

        cap = cv2.VideoCapture(temp_video_path)

        global _global_rep_state
        global _extension_frames
        
        # Initialize if not exists (handling first run)
        if '_extension_frames' not in globals():
            _extension_frames = 0
            
        frames_processed = 0
        rep_count_increment = 0
        feedback_messages = []

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
                
                # --- Upper Body Tracking (Webcam Friendly) ---
                # Get coordinates for Left Arm (Shoulder, Elbow, Wrist)
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                
                # Calculate angle of the elbow joint
                angle = calculate_angle(shoulder, elbow, wrist)
                
                # Basic rep counting logic (State machine: Extended -> Flexed)
                # If angle > 150, arm is fully extended. If < 50, arm is fully bent (curl).
                # To prevent jitter, we require the arm to stay extended for at least 5 frames before it can count a flexion.
                if angle > 150:
                    _extension_frames += 1
                    if _extension_frames >= 5:
                        _global_rep_state = "extended"
                else:
                    if angle > 90:
                        _extension_frames = 0 # Reset if they bend early
                    
                if angle < 50 and _global_rep_state == "extended":
                    _global_rep_state = "flexed"
                    _extension_frames = 0
                    rep_count_increment += 1
                    feedback_messages.append("Good curl!")
            
            frames_processed += 1

        cap.release()
        
    except Exception as e:
        import traceback
        traceback.print_exc()
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
