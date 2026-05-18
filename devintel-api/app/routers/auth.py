from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    UserResponse,
    TokenPairResponse,
    AccessTokenResponse,
)
from services.auth_service import (
    register_user,
    authenticate_user,
    create_token_pair,
    create_access_token,
    get_user_from_refresh_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, payload.full_name, payload.email, payload.password)
        return _serialize_user(user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/token", response_model=TokenPairResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await authenticate_user(db, payload.email, payload.password)
        return create_token_pair(user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_access_token(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await get_user_from_refresh_token(db, payload.refresh_token)
        return create_access_token(user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)
