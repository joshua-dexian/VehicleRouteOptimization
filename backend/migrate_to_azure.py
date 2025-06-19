"""
Script to migrate data from local PostgreSQL to Azure PostgreSQL
"""

import os
import sys
import logging
import subprocess
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env.azure for Azure PostgreSQL settings
load_dotenv('.env')

def export_local_data():
    """Export data from local PostgreSQL database"""
    logger.info("Exporting data from local PostgreSQL...")
    
    # Get database credentials from environment variables or use defaults
    db_name = os.getenv("POSTGRES_DB", "log_db")
    db_user = os.getenv("POSTGRES_USER", "postgres").split('@')[0]  # Remove Azure server suffix if present
    db_password = os.getenv("POSTGRES_PASSWORD", "admin")
    db_host = "localhost"  # Use local host for export
    
    # Set environment variable for password
    os.environ["PGPASSWORD"] = db_password
    
    # Output file for the dump
    dump_file = "database_dump.sql"
    
    # pg_dump command
    command = f'pg_dump -h {db_host} -U {db_user} -d {db_name} -f {dump_file}'
    
    try:
        subprocess.run(command, shell=True, check=True)
        logger.info(f"✓ Database export successful. Dump saved to {dump_file}")
        return dump_file
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ Database export failed: {str(e)}")
        return None

def import_to_azure(dump_file):
    """Import data to Azure PostgreSQL database"""
    logger.info("Importing data to Azure PostgreSQL...")
    
    if not dump_file or not os.path.exists(dump_file):
        logger.error("Dump file not found. Export failed or file doesn't exist.")
        return False
    
    # Get Azure database credentials from environment variables
    db_name = os.getenv("POSTGRES_DB", "scm_tracker_db")
    db_user = os.getenv("POSTGRES_USER", "postgres@scm_app_user")
    db_password = os.getenv("POSTGRES_PASSWORD", "S3cur3Tr@ckP@ss")
    db_host = os.getenv("POSTGRES_HOST", "yourserver.postgres.database.azure.com")
    
    # Set environment variable for password
    os.environ["PGPASSWORD"] = db_password
    
    # psql command to import
    command = f'psql "host={db_host} user={db_user} dbname={db_name} sslmode=require" -f {dump_file}'
    
    try:
        subprocess.run(command, shell=True, check=True)
        logger.info("✓ Database import to Azure successful")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ Database import to Azure failed: {str(e)}")
        return False

def main():
    """Main function"""
    logger.info("Starting database migration to Azure...")
    
    # Export data from local PostgreSQL
    dump_file = export_local_data()
    
    if dump_file:
        # Import data to Azure PostgreSQL
        import_to_azure(dump_file)
    
    logger.info("Migration process completed.")

if __name__ == "__main__":
    main()