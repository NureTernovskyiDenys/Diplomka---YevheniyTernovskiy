# Fitness App API Documentation (Postman CRUD Examples)

This document contains examples of the basic CRUD (Create, Read, Update, Delete) operations available in the Fitness App API, as featured in the Postman collection.

**Base URL**: `http://localhost:3000`

---

## 1. Authentication

Before testing protected routes, you must authenticate and obtain a Bearer token.

### Register a User
- **Method**: `POST`
- **URL**: `/auth/register`
- **Body** (JSON):
```json
{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "Jane",
    "lastName": "Doe"
}
```

### Login
- **Method**: `POST`
- **URL**: `/auth/login`
- **Body** (JSON):
```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```
*Note: Copy the `access_token` returned from this request and use it as a Bearer Token in the authorization header for all subsequent protected requests.*

---

## 2. Workouts (CRUD Examples)

These endpoints require authentication.

### CREATE a Workout
- **Method**: `POST`
- **URL**: `/workouts`
- **Headers**: Authorization: Bearer `<token>`
- **Body** (JSON):
```json
{
    "name": "Full Body Day",
    "exercises": [
        {
            "exerciseId": "0001", 
            "sets": 4,
            "reps": 12,
            "weight": 50
        }
    ]
}
```

### READ All Workouts (For Current User)
- **Method**: `GET`
- **URL**: `/workouts`
- **Headers**: Authorization: Bearer `<token>`
- **Response** (Example):
```json
[
  {
    "_id": "65b...",
    "name": "Full Body Day",
    "exercises": [ ... ],
    "user": "userId..."
  }
]
```

### UPDATE a Workout
*Note: Replace `:id` with the `_id` received from the GET request.*
- **Method**: `PUT`
- **URL**: `/workouts/:id`
- **Headers**: Authorization: Bearer `<token>`
- **Body** (JSON):
```json
{
    "name": "Full Body Day - Updated"
}
```

### DELETE a Workout
- **Method**: `DELETE`
- **URL**: `/workouts/:id`
- **Headers**: Authorization: Bearer `<token>`

---

## 3. Users (CRUD Examples)

Users can manage their own profiles, while Admins have full access.

### READ All Users (Admin Only)
- **Method**: `GET`
- **URL**: `/users`
- **Headers**: Authorization: Bearer `<admin_token>`

### READ Specific User Profile
- **Method**: `GET`
- **URL**: `/users/:id`
- **Headers**: Authorization: Bearer `<token>`

### UPDATE User Profile
- **Method**: `PUT`
- **URL**: `/users/:id`
- **Headers**: Authorization: Bearer `<token>`
- **Body** (JSON):
```json
{
    "firstName": "Jane (Updated)"
}
```

### DELETE User (Admin Only)
- **Method**: `DELETE`
- **URL**: `/users/:id`
- **Headers**: Authorization: Bearer `<admin_token>`

---

## 4. Subscriptions (CRUD Examples)

Plans are globally viewable, but creation/editing is restricted to Admins.

### CREATE a Subscription Plan (Admin Only)
- **Method**: `POST`
- **URL**: `/subscriptions`
- **Headers**: Authorization: Bearer `<admin_token>`
- **Body** (JSON):
```json
{
    "name": "Pro Tier",
    "price": 29.99,
    "features": ["Feature A", "Feature B"],
    "durationInDays": 30
}
```

### READ All Subscription Plans (Public/Authenticated)
- **Method**: `GET`
- **URL**: `/subscriptions`

### SUBSCRIBE to a Plan (Authenticated User)
- **Method**: `POST`
- **URL**: `/subscriptions/:id/subscribe`
- **Headers**: Authorization: Bearer `<token>`
- **Response**: The updated user object with active subscription state and expiration date.

### UPDATE a Subscription Plan (Admin Only)
- **Method**: `PUT`
- **URL**: `/subscriptions/:id`
- **Headers**: Authorization: Bearer `<admin_token>`
- **Body** (JSON):
```json
{
    "price": 34.99
}
```

### DELETE a Subscription Plan (Admin Only)
- **Method**: `DELETE`
- **URL**: `/subscriptions/:id`
- **Headers**: Authorization: Bearer `<admin_token>`

---

## 5. Analytics (CR Examples)

Track session history based on workouts performed.

### CREATE (Record) a Session
- **Method**: `POST`
- **URL**: `/analytics/sessions`
- **Headers**: Authorization: Bearer `<token>`
- **Body** (JSON):
```json
{
    "workoutId": "65b...",
    "durationInMinutes": 60,
    "caloriesBurned": 450,
    "totalVolume": 3200
}
```
*Note: If `totalVolume` is not provided, the server attempts to calculate it based on the `workoutId` provided.*

### READ (Get) All Sessions
- **Method**: `GET`
- **URL**: `/analytics/sessions`
- **Headers**: Authorization: Bearer `<token>`

---

## 6. Exercises (Read-Only Integration)

Fetches exercise data directly from RapidAPI and caches it in Redis.

### READ via Target Muscle
- **Method**: `GET`
- **URL**: `/exercises/target/pectorals`
- **Headers**: Authorization: Bearer `<token>`

### READ via Equipment
- **Method**: `GET`
- **URL**: `/exercises/equipment/dumbbell`
- **Headers**: Authorization: Bearer `<token>`

---

## 7. Live Analysis (Python Vercel Serverless)

These endpoints hit the Python Computer Vision module running via Vercel Edge routing on `/live/*`.

### READ Health Check
- **Method**: `GET`
- **URL**: `/live/health`
- **Response**:
```json
{
  "status": "ok",
  "message": "Live Analysis Python Serverless Module is running via FastAPI."
}
```

### CREATE (Analyze) Video Chunk
- **Method**: `POST`
- **URL**: `/live/analyze/chunk`
- **Headers**: Authorization: Bearer `<token>`, Content-Type: `multipart/form-data`
- **Body** (Form Data):
  - `video_chunk`: `(File - .mp4, .webm, or .mov)`
- **Response**:
```json
{
  "status": "success",
  "frames_analyzed": 90,
  "reps_detected_in_chunk": 1,
  "feedback": "Analysis complete for chunk."
}
```
