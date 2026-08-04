from fastapi import APIRouter
from app.api.v1.complaints import router as complaints_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.rag import router as rag_router
from app.api.v1.assets import router as assets_router
from app.api.v1.copilot import router as copilot_router

api_v1_router = APIRouter()

api_v1_router.include_router(complaints_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(rag_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(copilot_router)
