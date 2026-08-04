from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.tools.asset_tools import get_all_assets_tool

router = APIRouter(prefix="/assets", tags=["Infrastructure Assets"])

@router.get("/")
def get_assets(domain_type: Optional[str] = Query(None)):
    """
    Returns all Infrastructure Digital Twin Assets with Health Scores, Trends, and AI Recommendations.
    """
    try:
        assets = get_all_assets_tool(domain_type=domain_type)
        return {"assets": assets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
