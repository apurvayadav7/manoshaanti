import base64
import json
import os
import urllib.request
from typing import Dict, List, Tuple

import cv2
import mediapipe as mp
import numpy as np

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_URL = (
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/'
    'hand_landmarker/float16/1/hand_landmarker.task'
)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'hand_landmarker.task')
TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'asl_templates.json')

# 22 demo signs requested.
TARGET_SIGNS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]


def _ensure_model_file() -> str:
    model_path = os.path.abspath(MODEL_PATH)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    if not os.path.exists(model_path):
        urllib.request.urlretrieve(MODEL_URL, model_path)
    return model_path


def _create_landmarker() -> vision.HandLandmarker:
    base_options = python.BaseOptions(model_asset_path=_ensure_model_file())
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.5,
    )
    return vision.HandLandmarker.create_from_options(options)


hands_detector = _create_landmarker()


def _load_templates() -> Dict[str, List[List[float]]]:
    if not os.path.exists(TEMPLATES_PATH):
        return {sign: [] for sign in TARGET_SIGNS}

    try:
        with open(TEMPLATES_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except Exception:
        return {sign: [] for sign in TARGET_SIGNS}

    merged = {sign: [] for sign in TARGET_SIGNS}
    for sign in TARGET_SIGNS:
        values = data.get(sign, []) if isinstance(data, dict) else []
        merged[sign] = values if isinstance(values, list) else []
    return merged


def _save_templates(templates: Dict[str, List[List[float]]]) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(TEMPLATES_PATH)), exist_ok=True)
    with open(TEMPLATES_PATH, 'w', encoding='utf-8') as file:
        json.dump(templates, file)


templates_store = _load_templates()


def _decode_frame(frame_base64: str) -> np.ndarray:
    if ',' in frame_base64:
        frame_base64 = frame_base64.split(',', 1)[1]

    try:
        image_bytes = base64.b64decode(frame_base64)
    except Exception as exc:
        raise ValueError('Invalid base64 image format') from exc

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if frame_bgr is None:
        raise ValueError('Unable to decode image bytes into a frame')

    return frame_bgr


def _finger_states(landmarks, handedness: str) -> Dict[str, bool]:
    index_up = landmarks[8].y < landmarks[6].y
    middle_up = landmarks[12].y < landmarks[10].y
    ring_up = landmarks[16].y < landmarks[14].y
    pinky_up = landmarks[20].y < landmarks[18].y

    # Thumb direction depends on whether detected hand is left or right.
    # For front-camera mirrored input this is still a useful heuristic for demo use.
    if handedness.lower() == 'right':
        thumb_up = landmarks[4].x < landmarks[3].x
    else:
        thumb_up = landmarks[4].x > landmarks[3].x

    return {
        'thumb': thumb_up,
        'index': index_up,
        'middle': middle_up,
        'ring': ring_up,
        'pinky': pinky_up,
    }


def _classify_demo_gesture(states: Dict[str, bool]) -> Dict[str, object]:
    thumb_up = states['thumb']
    index_up = states['index']
    middle_up = states['middle']
    ring_up = states['ring']
    pinky_up = states['pinky']

    if (not thumb_up) and index_up and middle_up and ring_up and pinky_up:
        return {
            'gesture': 'B',
            'confidence': 0.8,
            'message': 'Detected open-palm pattern (demo ASL B heuristic).',
        }

    if thumb_up and (not index_up) and (not middle_up) and (not ring_up) and (not pinky_up):
        return {
            'gesture': 'A',
            'confidence': 0.78,
            'message': 'Detected closed-fist pattern (demo ASL A heuristic).',
        }

    if (
        thumb_up
        and index_up
        and (not middle_up)
        and (not ring_up)
        and (not pinky_up)
    ):
        return {
            'gesture': 'L',
            'confidence': 0.82,
            'message': 'Detected thumb + index pattern (demo ASL L heuristic).',
        }

    if (not thumb_up) and index_up and (not middle_up) and (not ring_up) and (not pinky_up):
        return {
            'gesture': 'D',
            'confidence': 0.74,
            'message': 'Detected single index-finger-up pattern (demo ASL D heuristic).',
        }

    return {
        'gesture': 'UNKNOWN',
        'confidence': 0.35,
        'message': 'Hand detected, but gesture did not match demo ASL heuristics.',
    }


def _extract_handedness(result) -> Tuple[str, float]:
    if not result.handedness:
        return 'unknown', 0.0

    handed = result.handedness[0]
    if not handed:
        return 'unknown', 0.0

    first = handed[0]
    name = getattr(first, 'category_name', 'unknown')
    score = float(getattr(first, 'score', 0.0))
    return name, score


def _extract_feature_vector(landmarks) -> np.ndarray:
    wrist = landmarks[0]
    middle_mcp = landmarks[9]

    hand_scale = np.sqrt((middle_mcp.x - wrist.x) ** 2 + (middle_mcp.y - wrist.y) ** 2 + (middle_mcp.z - wrist.z) ** 2)
    hand_scale = max(hand_scale, 1e-6)

    features: List[float] = []
    for lm in landmarks:
        features.extend([
            (lm.x - wrist.x) / hand_scale,
            (lm.y - wrist.y) / hand_scale,
            (lm.z - wrist.z) / hand_scale,
        ])

    return np.array(features, dtype=np.float32)


def _template_stats() -> Dict[str, int]:
    return {sign: len(templates_store.get(sign, [])) for sign in TARGET_SIGNS}


def get_template_statistics() -> Dict[str, object]:
    stats = _template_stats()
    trained_signs = sum(1 for _, count in stats.items() if count > 0)
    return {
        'requiredSigns': TARGET_SIGNS,
        'samplesPerSign': stats,
        'trainedSigns': trained_signs,
        'fullyCalibrated': trained_signs == len(TARGET_SIGNS),
    }


def reset_templates() -> Dict[str, object]:
    global templates_store
    templates_store = {sign: [] for sign in TARGET_SIGNS}
    _save_templates(templates_store)
    return {
        'message': 'ASL templates reset successfully.',
        **get_template_statistics(),
    }


def _predict_from_templates(feature_vector: np.ndarray) -> Tuple[str, float, float]:
    best_sign = 'UNKNOWN'
    best_distance = float('inf')

    for sign in TARGET_SIGNS:
        sign_samples = templates_store.get(sign, [])
        if not sign_samples:
            continue

        samples_np = np.array(sign_samples, dtype=np.float32)
        centroid = np.mean(samples_np, axis=0)
        distance = float(np.linalg.norm(feature_vector - centroid))
        if distance < best_distance:
            best_distance = distance
            best_sign = sign

    if best_sign == 'UNKNOWN':
        return 'UNKNOWN', 0.0, best_distance

    # Convert distance to a demo confidence score in [0, 1].
    confidence = float(np.exp(-best_distance * 0.85))
    return best_sign, min(max(confidence, 0.0), 1.0), best_distance


def add_calibration_sample(sign: str, frame_base64: str) -> Dict[str, object]:
    normalized_sign = sign.strip().upper()
    if normalized_sign not in TARGET_SIGNS:
        raise ValueError(f'Unsupported sign: {normalized_sign}. Use one of {TARGET_SIGNS}')

    frame_bgr = _decode_frame(frame_base64)
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    result = hands_detector.detect(mp_image)

    if not result.hand_landmarks:
        raise ValueError('No hand detected. Show a clear hand sign and try again.')

    landmarks = result.hand_landmarks[0]
    feature_vector = _extract_feature_vector(landmarks)

    samples = templates_store.get(normalized_sign, [])
    samples.append(feature_vector.tolist())

    # Keep template file small and responsive for demo use.
    if len(samples) > 40:
        samples[:] = samples[-40:]

    templates_store[normalized_sign] = samples
    _save_templates(templates_store)

    return {
        'message': f'Calibration sample saved for sign {normalized_sign}.',
        'sign': normalized_sign,
        'samplesForSign': len(samples),
        **get_template_statistics(),
    }


def recognize_asl_from_base64(frame_base64: str) -> Dict[str, object]:
    frame_bgr = _decode_frame(frame_base64)
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    result = hands_detector.detect(mp_image)

    if not result.hand_landmarks:
        return {
            'hand_detected': False,
            'gesture': 'NO_HAND',
            'confidence': 0.0,
            'message': 'No hand detected in frame.',
            'handedness': 'unknown',
            'fingers': {
                'thumb': False,
                'index': False,
                'middle': False,
                'ring': False,
                'pinky': False,
            },
            'calibrated': False,
            'requiredSigns': TARGET_SIGNS,
            'trainedSigns': _template_stats(),
        }

    landmarks = result.hand_landmarks[0]
    handedness, handedness_score = _extract_handedness(result)
    states = _finger_states(landmarks, handedness)
    feature_vector = _extract_feature_vector(landmarks)
    predicted_sign, template_conf, distance = _predict_from_templates(feature_vector)

    stats = _template_stats()
    has_any_calibration = any(count > 0 for count in stats.values())

    if has_any_calibration and predicted_sign != 'UNKNOWN':
        message = f'Template match for sign {predicted_sign} (distance={distance:.3f}).'
        confidence = round((template_conf + handedness_score) / 2, 3)
        return {
            'hand_detected': True,
            'gesture': predicted_sign,
            'confidence': confidence,
            'message': message,
            'handedness': handedness,
            'fingers': states,
            'calibrated': True,
            'requiredSigns': TARGET_SIGNS,
            'trainedSigns': stats,
        }

    prediction = _classify_demo_gesture(states)

    return {
        'hand_detected': True,
        'gesture': prediction['gesture'],
        'confidence': round((prediction['confidence'] + handedness_score) / 2, 3),
        'message': prediction['message'] + ' Calibrate signs for improved 22-sign recognition.',
        'handedness': handedness,
        'fingers': states,
        'calibrated': False,
        'requiredSigns': TARGET_SIGNS,
        'trainedSigns': stats,
    }
