import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'scans.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_type TEXT NOT NULL,
            input_content TEXT NOT NULL,
            claim_text TEXT,
            language TEXT DEFAULT 'English',
            verdict TEXT NOT NULL,
            confidence_score INTEGER NOT NULL,
            reasoning TEXT NOT NULL,
            manipulation_techniques TEXT NOT NULL,
            sources TEXT NOT NULL,
            forensics TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN forensics TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN claim_text TEXT")
    except Exception:
        pass
    conn.commit()
    conn.close()

def save_scan(input_type, input_content, language, verdict, confidence_score, reasoning, manipulation_techniques, sources, forensics=None, claim_text=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN forensics TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE scans ADD COLUMN claim_text TEXT")
    except Exception:
        pass
    
    final_claim_text = claim_text or input_content
    
    # Store JSON strings for lists & dicts
    tech_json = json.dumps(manipulation_techniques) if isinstance(manipulation_techniques, list) else manipulation_techniques
    sources_json = json.dumps(sources) if isinstance(sources, list) else sources
    forensics_json = json.dumps(forensics) if forensics else None
    
    cursor.execute('''
        INSERT INTO scans (input_type, input_content, claim_text, language, verdict, confidence_score, reasoning, manipulation_techniques, sources, forensics, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        input_type,
        input_content,
        final_claim_text,
        language,
        verdict,
        confidence_score,
        reasoning,
        tech_json,
        sources_json,
        forensics_json,
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def get_scans():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scans ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        item = dict(row)
        if not item.get('claim_text'):
            item['claim_text'] = item.get('input_content', '')
        try:
            item['manipulation_techniques'] = json.loads(item['manipulation_techniques'])
        except Exception:
            item['manipulation_techniques'] = []
            
        try:
            item['sources'] = json.loads(item['sources'])
        except Exception:
            item['sources'] = []
            
        if 'forensics' in item and item['forensics']:
            try:
                item['forensics'] = json.loads(item['forensics'])
            except Exception:
                item['forensics'] = None
            
        result.append(item)
    return result

def get_scan(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scans WHERE id = ?', (scan_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    item = dict(row)
    if not item.get('claim_text'):
        item['claim_text'] = item.get('input_content', '')
    try:
        item['manipulation_techniques'] = json.loads(item['manipulation_techniques'])
    except Exception:
        item['manipulation_techniques'] = []
        
    try:
        item['sources'] = json.loads(item['sources'])
    except Exception:
        item['sources'] = []
        
    if 'forensics' in item and item['forensics']:
        try:
            item['forensics'] = json.loads(item['forensics'])
        except Exception:
            item['forensics'] = None
        
    return item

def delete_scan(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans WHERE id = ?', (scan_id,))
    conn.commit()
    conn.close()
    return True

def clear_scans():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans')
    conn.commit()
    conn.close()
    return True

# Initialize database on module load
init_db()
