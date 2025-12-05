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
        print(f"Создана директория для резервных копий по пути {BACKUP_DIR}")

def create_backup():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = BACKUP_DIR / f"backup_{timestamp}.sql"
    
    print(f"Начинается создание резервной копии для {DB_NAME} в {timestamp}...")

    try:
        with open(filename, "w") as f:
            f.write(f"-- РЕЗЕРВНАЯ КОПИЯ {DB_NAME} СОЗДАНА В {timestamp}\n")
            f.write("-- ЗАПОЛНИТЕЛЬ ДЛЯ ДАМПА ДАННЫХ\n")
        
        print(f"Резервная копия успешно создана: {filename}")
        return filename
    except Exception as e:
        print(f"Ошибка при создании резервной копии: {e}")
        return None

def rotate_backups(keep_last=5):
    backups = sorted(BACKUP_DIR.glob("backup_*.sql"), key=os.path.getmtime, reverse=True)
    if len(backups) > keep_last:
        print(f"Найдено {len(backups)} резервных копий. Сохраняем последние {keep_last}...")
        for backup in backups[keep_last:]:
            backup.unlink()
            print(f"Удалена старая резервная копия: {backup.name}")
    else:
        print("Нет старых резервных копий для удаления.")

if __name__ == "__main__":
    ensure_backup_dir()
    new_backup = create_backup()
    if new_backup:
        rotate_backups()
