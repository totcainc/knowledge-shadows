# Knowledge Shadows

> Transform expert walkthroughs into reusable, searchable learning modules — without extra work.

Knowledge Shadows is a passive session capture tool that records screen-share sessions, uses AI to extract decision points and reasoning, and packages everything into chapter-based video modules.

## 🎯 Features

- **One-Click Capture**: Start/End Shadow recording with a single button
- **AI Processing**: Automatic transcription, chapter detection, and decision point extraction
- **Rich Video Player**: Custom player with chapter markers and decision point overlays
- **Search & Discovery**: Find relevant Shadows across your knowledge library
- **Analytics**: Track views, completion rates, and impact

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** with eduBITES design system
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **Celery** for background tasks
- **Redis** for task queue

### AI Services
- **OpenAI Whisper** for transcription
- **Anthropic Claude** for analysis

## 📁 Project Structure

```
knowledge-shadows/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Storybook components
│   │   │   ├── ShadowCapture.tsx
│   │   │   ├── ChapterList.tsx
│   │   │   └── DecisionPointCard.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   └── ShadowDetail.tsx
│   │   └── App.tsx
│   └── package.json
│
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/endpoints/
│   │   ├── db/models.py
│   │   ├── schemas/
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for background tasks)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run the server
uvicorn app.main:app --reload
```

Backend API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Database Setup

```bash
# Create database
createdb knowledge_shadows

# Run migrations (coming soon)
# alembic upgrade head
```

## 📖 Usage

### Capturing a Shadow

1. Click **"Start Shadow"** button
2. Perform your walkthrough or demo
3. Click **"End Shadow"** when done
4. AI processing begins automatically

### Viewing Shadows

1. Browse Shadows on the Dashboard
2. Click on a Shadow to view details
3. Watch video with chapter navigation
4. Explore decision points and reasoning

## 🔧 Configuration

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/knowledge_shadows
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 📝 API Endpoints

### Shadows
- `POST /api/shadows/start` - Start capture
- `POST /api/shadows/{id}/end` - End capture
- `GET /api/shadows` - List all Shadows
- `GET /api/shadows/{id}` - Get Shadow details
- `PATCH /api/shadows/{id}` - Update Shadow
- `DELETE /api/shadows/{id}` - Delete Shadow

### Chapters
- `GET /api/chapters/shadows/{id}/chapters` - Get chapters
- `PATCH /api/chapters/{id}` - Update chapter

### Decision Points
- `GET /api/decision-points/shadows/{id}/decision-points` - Get decision points
- `POST /api/decision-points/{id}/verify` - Verify decision point

## 🎨 Design System

This project uses the **eduBITES Storybook** design system with:
- 28 pre-built React components
- Consistent color palette (Primary: #5845BA)
- Tailwind CSS configuration
- Heroicons for icons

## 🛠️ Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload  # Start with hot reload
```

## 📦 Deployment

(Coming soon)

## 🤝 Contributing

This is a personal project. Contributions welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with the eduBITES design system
- Inspired by the need to capture and share procedural knowledge effortlessly

---

**Built with ❤️ for knowledge sharing**
