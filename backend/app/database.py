"""
Creates and exports a single Supabase client instance.
All routers and services import `db` from here.
Never creates a new client — always reuses the singleton.
"""
from supabase import create_client, Client
from app.config import settings

db: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)