#!/usr/bin/env python3
"""Check what breeds are in MongoDB"""
import sys
sys.path.insert(0, '.')

from app import create_app
from extensions import mongo

app = create_app()
with app.app_context():
    breeds = list(mongo.db.breeds.find({}, {"name": 1, "_id": 0}))
    print(f"Total breeds in database: {len(breeds)}")
    for breed in breeds[:20]:  # Print first 20
        print(f"  - {breed}")
