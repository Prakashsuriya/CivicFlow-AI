import os
from app.database.connection import engine, Base
import app.database.models # ensure models imported
from app.database.init_db import init_db

def main():
    print("Dropping old database tables if any and creating new schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Re-initializing database with full seed data...")
    init_db()
    print("Database reset & initialization complete!")

if __name__ == "__main__":
    main()
