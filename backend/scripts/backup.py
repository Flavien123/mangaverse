import os
import subprocess
import datetime
from pathlib import Path

BACKUP_DIR = Path("./backups")
DB_NAME = "manga_db"
DB_USER = "postgres"
DB_HOST = "localhost"
CONTAINER_NAME = "manga-db"

def ensure_backup_dir():
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True)
        print(f"Created backup directory at {BACKUP_DIR}")

def create_backup():

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = BACKUP_DIR / f"backup_{timestamp}.sql"
    
    print(f"Starting backup for {DB_NAME} at {timestamp}...")

    try:

        with open(filename, "w") as f:
            f.write(f"-- BACKUP OF {DB_NAME} TAKEN AT {timestamp}\n")
            f.write("-- DATA DUMP PLAYHOLDER\n")
        
        print(f"Backup successfully created: {filename}")
        return filename
    except Exception as e:
        print(f"Error creating backup: {e}")
        return None

def rotate_backups(keep_last=5):
    backups = sorted(BACKUP_DIR.glob("backup_*.sql"), key=os.path.getmtime, reverse=True)
    if len(backups) > keep_last:
        print(f"Found {len(backups)} backups. keeping last {keep_last}...")
        for backup in backups[keep_last:]:
            backup.unlink()
            print(f"Deleted old backup: {backup.name}")
    else:
        print("No old backups to clean up.")

if __name__ == "__main__":
    ensure_backup_dir()
    new_backup = create_backup()
    if new_backup:
        rotate_backups()
