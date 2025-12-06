# INSTRUCTIONS.md

## Team Members

| Real Name       | GitHub Username |
|-----------------|-----------------|
| [Jan Campalans] | @Campalans03    |
| [Adam Benitez]  | @adamblin   |
| [Miguel Ramos]  | @mramosmar   |
| [Aina Barnet]   | @AinaBarnet   |


---

## Project Management Tool

We use **trello** for managing our project tasks and sprints.

- **Link:** [Trello Board](https://trello.com/b/FSkRwkcH/trello)

---

## How to Set Up and Run the Project

### Prerequisites

- **Node.js** v22.x or higher
- **Java** JDK 21 (Amazon Corretto recommended)
- **Maven** 3.9.x or higher
- **Git**

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[organization]/LS2-protube.git
   cd LS2-protube
   ```

2. **Set environment variables** (see [Environment Variables](#environment-variables) section below)

3. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

4. **Run the backend:**
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:5173`

### Running Tests

**Backend tests with coverage:**
```bash
cd backend
mvn clean verify -Pcoverage
```

**Frontend tests with coverage:**
```bash
cd frontend
npm run test -- --coverage
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Sample Value |
|----------|-------------|--------------|
| `ENV_PROTUBE_STORE_DIR` | Absolute path to the directory containing video files and metadata | `C:/lab_2_protube/LS2-protube/store` or `/home/user/protube/store` |
| `ENV_PROTUBE_GOOGLE_CLIENT_ID` | Google OAuth2 Client ID for authentication | `123456789-abc123.apps.googleusercontent.com` |
| `ENV_PROTUBE_GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret for authentication | `GOCSPX-abcdefgh123456` |

---

## Improvements Applied

### 1. New Features (Beyond Initial Requirements)

#### 1.1 Video Upload Feature
- **Description:** Users can upload their own videos with custom thumbnails, titles, and descriptions.
- **How to use:** 
  1. Login to your account
  2. Click the "Upload" button in the header
  3. Fill in the video details (title, description)
  4. Select a video file and thumbnail image
  5. Click "Upload"
- **Code Design:**
  - Frontend: `UploadVideoModal.tsx` component handles the upload form
  - Backend: `VideosController.uploadVideo()` endpoint processes multipart form data
  - Files are stored in the `store/` directory with auto-generated IDs
  - JSON metadata files are created alongside video files

#### 1.2 Like/Dislike System
- **Description:** Authenticated users can like or dislike videos, with reaction toggling support.
- **How to use:**
  1. Navigate to any video
  2. Click the thumbs up (like) or thumbs down (dislike) button
  3. Click again to remove your reaction
- **Code Design:**
  - Frontend: `viewService.ts` contains `likeVideo()` and `dislikeVideo()` methods
  - Backend: `VideoReaction` entity stores user reactions
  - `VideoService.handleReaction()` manages toggle logic (like → neutral → dislike)
  - Reactions are persisted per user-video combination

#### 1.3 Comment System
- **Description:** Authenticated users can comment on videos.
- **How to use:**
  1. Login to your account
  2. Navigate to a video
  3. Type your comment in the comment box
  4. Submit the comment
- **Code Design:**
  - Frontend: `commentService.ts` handles API calls
  - Backend: `Comment` entity linked to `User` and `Video`
  - Comments are displayed in real-time after submission

#### 1.4 View Counter
- **Description:** Automatic view counting when users watch videos.
- **How to use:** Views are automatically incremented when a video is played.
- **Code Design:**
  - Frontend: `viewService.incrementView()` called on video play
  - Backend: `VideosController.incrementViews()` updates the count
  - View count displayed on video thumbnails and player

#### 1.5 Google OAuth2 Authentication
- **Description:** Users can login using their Google account.
- **How to use:**
  1. Click "Login" button
  2. Select "Login with Google"
  3. Authorize with your Google account
- **Code Design:**
  - Backend: `OAuth2UserService` handles Google authentication
  - JWT tokens generated via `JwtTokenProvider`
  - `JwtAuthenticationFilter` validates tokens on requests
  - User data synced/created from Google profile

#### 1.6 Video Search and Filtering
- **Description:** Search videos by title and filter by categories.
- **How to use:**
  1. Use the search bar in the header to search by title
  2. Use the sidebar to filter by category
- **Code Design:**
  - Frontend: `App.tsx` contains `filteredVideos` computed with regex matching
  - Word-boundary matching for precise search results
  - Category filtering combined with search

#### 1.7 Related Videos Recommendations
- **Description:** Shows related videos based on categories and tags.
- **How to use:** When viewing a video, related videos appear in the sidebar.
- **Code Design:**
  - Frontend: `videoRecommendations.ts` utility calculates relevance scores
  - Scoring based on shared categories, tags, and user

---

### 2. Changes in the Environment
No changes made
### 3. Changes in the Process

#### 3.1 Pull Request Reviews
- **Improvement:** All changes require PR review and approval before merging.
- **How it improves methodology:**
  - Code quality assurance
  - Knowledge sharing among team members
  - Reduced bugs in production

#### 3.2 Agile Ceremonies
- **Sprint Planning:** Define sprint goals and task allocation
- **Daily Standups:** Quick status updates and blocker identification
- **Sprint Reviews/Demos:** Showcase completed features to stakeholders
- **Retrospectives:** Continuous process improvement

---

## Architecture Overview

```
LS2-protube/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/tecnocampus/LS2/protube_back/
│   │       ├── api/            # REST Controllers
│   │       ├── application/    # Services
│   │       ├── domain/         # Entities
│   │       ├── Persistance/    # Repositories
│   │       ├── security/       # JWT & OAuth2
│   │       └── configuration/  # Spring Config
│   └── src/test/               # Backend Tests
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   ├── pages/              # Page Components (Modals)
│   │   ├── hooks/              # Custom React Hooks
│   │   └── utils/              # Utility Functions
│   ├── services/               # API Service Layer
│   └── __tests__/              # Frontend Tests
│
├── store/                      # Video Storage
│   ├── *.mp4                   # Video Files
│   ├── *.webp/*.png            # Thumbnails
│   └── *.json                  # Video Metadata
│
├── .github/workflows/          # CI/CD Pipelines
└── docs/                       # Documentation
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Spring Boot 3.4, Java 21 |
| Database | H2 (dev)|
| Authentication | JWT, Google OAuth2 |
| Testing | Jest, JUnit 5, Mockito |
| CI/CD | GitHub Actions |

---

## Additional Notes

- The project uses H2 in-memory database for development (auto-configured)
- Video files are stored in the filesystem, not in the database
- JWT tokens expire after 1 hour


