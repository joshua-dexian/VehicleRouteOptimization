# Azure PostgreSQL Migration Guide

This guide explains how to migrate your application from local PostgreSQL to Azure PostgreSQL.

## Prerequisites

- Azure account
- Azure CLI installed (optional, for command-line management)
- PostgreSQL client tools (psql, pg_dump)

## Step 1: Create Azure PostgreSQL Server

1. Log in to the Azure Portal (https://portal.azure.com)
2. Click "Create a resource" > "Databases" > "Azure Database for PostgreSQL"
3. Choose your preferred deployment option (Flexible Server recommended)
4. Configure server settings:
   - Server name: Choose a unique name (e.g., "mylogisticsapp")
   - Region: Select the region closest to your users
   - Version: Choose PostgreSQL 13 or later
   - Admin username: Create an admin user (e.g., "postgres")
   - Password: Create a secure password
5. Review and create the server

## Step 2: Configure Firewall Rules

1. In your Azure PostgreSQL server resource, go to "Networking"
2. Add your client IP address to allow connections from your development machine
3. Enable "Allow public access from any Azure service within Azure to this server"
4. If your app is hosted on Azure, add those IP addresses as well

## Step 3: Update Environment Variables

1. Copy the `.env.azure` file to `.env` or update your existing `.env` file:

```
DATABASE_URL=postgresql://postgres@yourserver:YourPassword@yourserver.postgres.database.azure.com:5432/log_db?sslmode=require
POSTGRES_USER=postgres@yourserver
POSTGRES_PASSWORD=YourPassword
POSTGRES_DB=log_db
POSTGRES_HOST=yourserver.postgres.database.azure.com
POSTGRES_PORT=5432
GOOGLE_MAPS_API_KEY=your_existing_api_key
```

Replace `yourserver` with your actual Azure PostgreSQL server name and `YourPassword` with your actual password.

## Step 4: Migrate Database Schema and Data

### Option 1: Use the Migration Script

Run the provided migration script:

```bash
cd backend
python migrate_to_azure.py
```

### Option 2: Manual Migration

1. Export your local database:
   ```bash
   pg_dump -h localhost -U postgres -d log_db -f database_dump.sql
   ```

2. Create the database in Azure:
   ```bash
   psql "host=disc-post-db.postgres.database.azure.com user=scm_app_user password=S3cur3Tr@ckP@ss dbname=scm_tracker_db sslmode=require" -c "CREATE DATABASE scm_tracker_db;"
   ```

3. Import the data to Azure:
   ```bash
   psql "host=disc-post-db.postgres.database.azure.com user=scm_app_user password=S3cur3Tr@ckP@ss dbname=scm_tracker_db sslmode=require" -f database_dump.sql
   ```

## Step 5: Test the Application

1. Install the updated requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Run the application with Azure PostgreSQL settings:
   ```bash
   cd backend
   python run.py
   ```

3. Verify that the application works correctly with the Azure database

## Step 6: Update Deployment Configuration

If you're using a CI/CD pipeline or deployment service, update your deployment configuration to use the Azure PostgreSQL connection string.

## Troubleshooting

### Connection Issues

- Verify firewall rules are correctly configured
- Ensure SSL mode is set to "require" in the connection string
- Check that you're using the correct server name format (`yourserver.postgres.database.azure.com`)
- Confirm that the username includes the server name (`postgres@yourserver`)

### Performance Issues

- Consider adjusting the Azure PostgreSQL server's performance tier
- Enable caching if not already enabled
- Add appropriate indexes to frequently queried columns

### Data Migration Issues

- If schema errors occur during import, manually create the schema first
- For large databases, consider using Azure Data Migration Service