from decimal import Decimal

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.warehouse import Warehouse, Product, StockItem, StockMovement, MovementType
from app.schemas.warehouse import (
    WarehouseCreate, WarehouseUpdate,
    ProductCreate, ProductUpdate,
    StockMovementCreate,
)


# --- Warehouses ---

async def get_warehouses(db: AsyncSession) -> list[Warehouse]:
    result = await db.execute(select(Warehouse).order_by(Warehouse.id))
    return result.scalars().all()


async def get_warehouse(db: AsyncSession, warehouse_id: int) -> Warehouse | None:
    return await db.get(Warehouse, warehouse_id)


async def create_warehouse(db: AsyncSession, data: WarehouseCreate) -> Warehouse:
    warehouse = Warehouse(**data.model_dump())
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    return warehouse


async def update_warehouse(db: AsyncSession, warehouse_id: int, data: WarehouseUpdate) -> Warehouse | None:
    warehouse = await db.get(Warehouse, warehouse_id)
    if not warehouse:
        return None
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(warehouse, key, value)
    await db.commit()
    await db.refresh(warehouse)
    return warehouse


async def delete_warehouse(db: AsyncSession, warehouse_id: int) -> bool:
    warehouse = await db.get(Warehouse, warehouse_id)
    if not warehouse:
        return False
    await db.delete(warehouse)
    await db.commit()
    return True


# --- Products ---

async def get_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).order_by(Product.id))
    return result.scalars().all()


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product | None:
    product = await db.get(Product, product_id)
    if not product:
        return None
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await db.get(Product, product_id)
    if not product:
        return False
    await db.delete(product)
    await db.commit()
    return True


# --- Stock ---

async def get_stock(db: AsyncSession, warehouse_id: int | None = None) -> list[StockItem]:
    query = select(StockItem).options(
        selectinload(StockItem.product),
        selectinload(StockItem.warehouse),
    )
    if warehouse_id:
        query = query.where(StockItem.warehouse_id == warehouse_id)
    result = await db.execute(query)
    return result.scalars().all()


async def create_movement(db: AsyncSession, data: StockMovementCreate) -> StockMovement:
    movement = StockMovement(**data.model_dump())
    db.add(movement)

    result = await db.execute(
        select(StockItem).where(
            StockItem.warehouse_id == data.warehouse_id,
            StockItem.product_id == data.product_id,
        )
    )
    stock_item = result.scalar_one_or_none()

    if stock_item is None:
        stock_item = StockItem(
            warehouse_id=data.warehouse_id,
            product_id=data.product_id,
            quantity=Decimal("0"),
        )
        db.add(stock_item)

    if data.movement_type == MovementType.IN:
        stock_item.quantity += data.quantity
    elif data.movement_type == MovementType.OUT:
        if stock_item.quantity < data.quantity:
            raise ValueError("Недостатньо товару на складі")
        stock_item.quantity -= data.quantity
    else:
        stock_item.quantity = data.quantity

    await db.commit()
    await db.refresh(movement)

    result = await db.execute(
        select(StockMovement)
        .options(
            selectinload(StockMovement.product),
            selectinload(StockMovement.warehouse),
        )
        .where(StockMovement.id == movement.id)
    )
    return result.scalar_one()


async def get_movements(
    db: AsyncSession,
    warehouse_id: int | None = None,
    product_id: int | None = None,
) -> list[StockMovement]:
    query = select(StockMovement).options(
        selectinload(StockMovement.product),
        selectinload(StockMovement.warehouse),
    ).order_by(StockMovement.created_at.desc())

    if warehouse_id:
        query = query.where(StockMovement.warehouse_id == warehouse_id)
    if product_id:
        query = query.where(StockMovement.product_id == product_id)

    result = await db.execute(query)
    return result.scalars().all()
