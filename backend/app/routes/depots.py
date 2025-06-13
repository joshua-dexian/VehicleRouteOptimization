from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Depot
from ..schemas import DepotCreate, DepotResponse, DepotUpdate

router = APIRouter(
    prefix="/depots",
    tags=["Depots"]
)

@router.post("/", response_model=DepotResponse, status_code=status.HTTP_201_CREATED)
def create_depot(depot: DepotCreate, db: Session = Depends(get_db)):
    db_depot = Depot(**depot.dict())
    db.add(db_depot)
    db.commit()
    db.refresh(db_depot)
    return db_depot

@router.get("/", response_model=List[DepotResponse])
def get_depots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    depots = db.query(Depot).offset(skip).limit(limit).all()
    return depots

@router.get("/{depot_id}", response_model=DepotResponse)
def get_depot(depot_id: int, db: Session = Depends(get_db)):
    depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if depot is None:
        raise HTTPException(status_code=404, detail="Depot not found")
    return depot

@router.put("/{depot_id}", response_model=DepotResponse)
def update_depot(depot_id: int, depot: DepotUpdate, db: Session = Depends(get_db)):
    db_depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if db_depot is None:
        raise HTTPException(status_code=404, detail="Depot not found")
    
    update_data = depot.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_depot, key, value)
    
    db.commit()
    db.refresh(db_depot)
    return db_depot

@router.delete("/{depot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_depot(depot_id: int, db: Session = Depends(get_db)):
    db_depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if db_depot is None:
        raise HTTPException(status_code=404, detail="Depot not found")
    
    db.delete(db_depot)
    db.commit()
    return None 