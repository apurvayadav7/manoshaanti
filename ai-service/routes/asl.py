from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List

from services.aslService import (
    add_calibration_sample,
    get_template_statistics,
    recognize_asl_from_base64,
    reset_templates,
)

router = APIRouter()


class AslRequest(BaseModel):
    frame_base64: str = Field(alias="frameBase64")


class AslResponse(BaseModel):
    hand_detected: bool
    gesture: str
    confidence: float
    message: str
    handedness: str
    fingers: Dict[str, bool]
    calibrated: bool
    requiredSigns: List[str]
    trainedSigns: Dict[str, int]


class AslCalibrateRequest(BaseModel):
    frame_base64: str = Field(alias='frameBase64')
    sign: str


@router.get('/health')
def asl_health():
    return {'status': 'ok', 'feature': 'asl'}


@router.get('/templates')
def get_templates():
    return get_template_statistics()


@router.post('/reset')
def reset_asl_templates():
    return reset_templates()


@router.post('/calibrate')
def calibrate_asl(payload: AslCalibrateRequest):
    if not payload.frame_base64.strip():
        raise HTTPException(status_code=400, detail='frameBase64 cannot be empty')

    if not payload.sign.strip():
        raise HTTPException(status_code=400, detail='sign cannot be empty')

    try:
        return add_calibration_sample(payload.sign, payload.frame_base64)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'ASL calibration failed: {exc}')


@router.post('/predict', response_model=AslResponse)
def predict_asl(payload: AslRequest):
    if not payload.frame_base64.strip():
        raise HTTPException(status_code=400, detail='frameBase64 cannot be empty')

    try:
        return recognize_asl_from_base64(payload.frame_base64)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'ASL processing failed: {exc}')
