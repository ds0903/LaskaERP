from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.warehouse import MovementType


# --- Warehouse ---

class WarehouseCreate(BaseModel):
    name: str
    address: str | None = None
    description: str | None = None


class WarehouseUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    description: str | None = None


class WarehouseRead(BaseModel):
    id: int
    name: str
    address: str | None
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Product ---

class ProductCreate(BaseModel):
    name: str
    sku: str
    unit: str = "шт"
    description: str | None = None
    price: Decimal = Decimal("0")
    category: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    unit: str | None = None
    description: str | None = None
    price: Decimal | None = None
    category: str | None = None


class ProductRead(BaseModel):
    id: int
    name: str
    sku: str
    unit: str
    description: str | None
    price: Decimal
    category: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- StockItem ---

class StockItemRead(BaseModel):
    id: int
    warehouse_id: int
    product_id: int
    quantity: Decimal
    product: ProductRead
    warehouse: WarehouseRead

    model_config = {"from_attributes": True}


# --- StockMovement ---

class StockMovementCreate(BaseModel):
    warehouse_id: int
    product_id: int
    movement_type: MovementType
    quantity: Decimal = Field(gt=0)
    reason: str | None = None


class StockMovementRead(BaseModel):
    id: int
    warehouse_id: int
    product_id: int
    movement_type: MovementType
    quantity: Decimal
    reason: str | None
    created_at: datetime
    product: ProductRead
    warehouse: WarehouseRead

    model_config = {"from_attributes": True}
