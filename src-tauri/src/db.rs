use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Item {
    pub id: Option<i32>,
    pub title: String,
    pub category: String,
    pub expiration_date: Option<String>,
    pub cost: Option<f64>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

pub fn init_db(app_dir: &PathBuf) -> Result<Connection> {
    if !app_dir.exists() {
        fs::create_dir_all(app_dir).expect("Failed to create app data directory");
    }
    
    let db_path = app_dir.join("openadmin.sqlite");
    let conn = Connection::open(db_path)?;

    // Create the base table for Life Ops (warranties, subscriptions, documents)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            expiration_date TEXT,
            cost REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(conn)
}

pub fn insert_item(conn: &Connection, item: Item) -> Result<i32> {
    conn.execute(
        "INSERT INTO items (title, category, expiration_date, cost, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![item.title, item.category, item.expiration_date, item.cost, item.notes],
    )?;
    
    let id = conn.last_insert_rowid();
    Ok(id as i32)
}

pub fn get_items(conn: &Connection) -> Result<Vec<Item>> {
    let mut stmt = conn.prepare("SELECT id, title, category, expiration_date, cost, notes, created_at FROM items ORDER BY created_at DESC")?;
    
    let item_iter = stmt.query_map([], |row| {
        Ok(Item {
            id: row.get(0)?,
            title: row.get(1)?,
            category: row.get(2)?,
            expiration_date: row.get(3)?,
            cost: row.get(4)?,
            notes: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;

    let mut items = Vec::new();
    for item in item_iter {
        items.push(item?);
    }
    
    Ok(items)
}

pub fn update_item(conn: &Connection, item: Item) -> Result<()> {
    conn.execute(
        "UPDATE items SET title = ?1, category = ?2, expiration_date = ?3, cost = ?4, notes = ?5 WHERE id = ?6",
        rusqlite::params![item.title, item.category, item.expiration_date, item.cost, item.notes, item.id],
    )?;
    Ok(())
}

pub fn delete_item(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM items WHERE id = ?1", rusqlite::params![id])?;
    Ok(())
}
