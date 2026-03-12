from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from app.schemas.warehouse import (
    WarehouseCreate, WarehouseUpdate, WarehouseRead,
    ProductCreate, ProductUpdate, ProductRead,
    StockItemRead, StockMovementCreate, StockMovementRead,
)
from app.services import warehouse as svc

router = APIRouter(prefix="/api/warehouse", tags=["warehouse"])


# --- Warehouses ---

@router.get("/warehouses", response_model=list[WarehouseRead])
async def list_warehouses(db: AsyncSession = Depends(get_db)):
    return await svc.get_warehouses(db)


@router.post("/warehouses", response_model=WarehouseRead, status_code=201)
async def create_warehouse(data: WarehouseCreate, db: AsyncSession = Depends(get_db)):
    return await svc.create_warehouse(db, data)


@router.get("/warehouses/{warehouse_id}", response_model=WarehouseRead)
async def get_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    obj = await svc.get_warehouse(db, warehouse_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Склад не знайдено")
    return obj


@router.patch("/warehouses/{warehouse_id}", response_model=WarehouseRead)
async def update_warehouse(warehouse_id: int, data: WarehouseUpdate, db: AsyncSession = Depends(get_db)):
    obj = await svc.update_warehouse(db, warehouse_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Склад не знайдено")
    return obj


@router.delete("/warehouses/{warehouse_id}", status_code=204)
async def delete_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await svc.delete_warehouse(db, warehouse_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Склад не знайдено")


# --- Products ---

@router.get("/products", response_model=list[ProductRead])
async def list_products(db: AsyncSession = Depends(get_db)):
    return await svc.get_products(db)


@router.post("/products", response_model=ProductRead, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await svc.create_product(db, data)


@router.get("/products/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    obj = await svc.get_product(db, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Товар не знайдено")
    return obj


@router.patch("/products/{product_id}", response_model=ProductRead)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    obj = await svc.update_product(db, product_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Товар не знайдено")
    return obj


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await svc.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Товар не знайдено")


# --- Stock ---

@router.get("/stock", response_model=list[StockItemRead])
async def get_stock(warehouse_id: int | None = None, db: AsyncSession = Depends(get_db)):
    return await svc.get_stock(db, warehouse_id)


# --- Movements ---

@router.get("/movements", response_model=list[StockMovementRead])
async def list_movements(
    warehouse_id: int | None = None,
    product_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_movements(db, warehouse_id, product_id)


@router.post("/movements", response_model=StockMovementRead, status_code=201)
async def create_movement(data: StockMovementCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await svc.create_movement(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
