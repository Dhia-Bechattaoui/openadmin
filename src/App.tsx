import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  Settings, 
  Plus,
  Bell,
  Fingerprint,
  X,
  UploadCloud,
  Pencil,
  Trash
} from "lucide-react";
import Tesseract from "tesseract.js";
import { save, confirm, message } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import "./App.css";

interface SettingsData {
  notifications_enabled: boolean;
}

interface Item {
  id?: number;
  title: string;
  category: string;
  expiration_date: string | null;
  cost: number | null;
  notes: string | null;
  created_at?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  // Form State
  const [category, setCategory] = useState("warranty");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");

  // OCR State
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const fetchItems = async () => {
    try {
      const fetchedItems: Item[] = await invoke("get_items");
      setItems(fetchedItems);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  const [settings, setSettings] = useState<SettingsData>({ notifications_enabled: true });

  useEffect(() => {
    fetchItems();
    invoke<SettingsData>("get_settings").then(setSettings).catch(console.error);
  }, []);

  const toggleNotifications = async () => {
    const newSettings = { notifications_enabled: !settings.notifications_enabled };
    try {
      await invoke("update_settings", { settings: newSettings });
      setSettings(newSettings);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWipeDatabase = async () => {
    const yes = await confirm("Are you sure you want to delete all data? This cannot be undone.", { title: "Wipe Database", kind: "warning" });
    if (yes) {
      try {
        await invoke("wipe_database");
        setItems([]);
        await message("Database wiped successfully.", { title: "Success", kind: "info" });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const jsonStr = await invoke<string>("export_data");
      const filePath = await save({
        title: "Export OpenAdmin Data",
        defaultPath: "openadmin_backup.json",
        filters: [{ name: "JSON", extensions: ["json"] }]
      });
      if (filePath) {
        await writeTextFile(filePath, jsonStr);
        await message("Data exported successfully!", { title: "Success", kind: "info" });
      }
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }}
      );

      const text = result.data.text;
      
      // Basic heuristic extraction
      const priceMatch = text.match(/\$?\s*([0-9]+\.[0-9]{2})/);
      if (priceMatch) {
        setCost(priceMatch[1]);
      }

      setNotes(`Scanned Text:\n${text}`);
    } catch (e) {
      console.error("OCR Failed:", e);
      setNotes("OCR failed to read the receipt.");
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleEdit = (item: Item) => {
    if (item.id === undefined) return;
    setEditingItemId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setCost(item.cost ? item.cost.toString() : "");
    setExpirationDate(item.expiration_date || "");
    setNotes(item.notes || "");
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const yes = await confirm("Are you sure you want to delete this item?", { title: "Delete Item", kind: "warning" });
    if (yes) {
      try {
        await invoke("delete_item", { id });
        fetchItems();
      } catch (e) {
        console.error("Failed to delete item:", e);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setCost("");
    setExpirationDate("");
    setNotes("");
    setEditingItemId(null);
    setIsAddModalOpen(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newItem: Item = {
        title,
        category,
        cost: cost ? parseFloat(cost) : null,
        expiration_date: expirationDate || null,
        notes: notes || null
      };

      if (editingItemId) {
        await invoke("update_item", { item: { ...newItem, id: editingItemId } });
      } else {
        await invoke("insert_item", { item: newItem });
      }
      
      resetForm();
      fetchItems();
    } catch (e) {
      console.error("Failed to save item:", e);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <Fingerprint className="logo-icon" size={32} />
          <h2>OpenAdmin</h2>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <ShieldCheck size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'warranties' ? 'active' : ''}`}
            onClick={() => setActiveTab('warranties')}
          >
            <Receipt size={20} />
            <span>Warranties</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content glass-panel">
        <header className="header">
          <div>
            <h1>
              {activeTab === 'dashboard' && 'Life Ops Overview'}
              {activeTab === 'warranties' && 'Warranties'}
              {activeTab === 'subscriptions' && 'Subscriptions'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Your local-first command center.'}
              {activeTab === 'warranties' && 'Track and manage your product warranties.'}
              {activeTab === 'subscriptions' && 'Keep an eye on your recurring costs.'}
              {activeTab === 'settings' && 'Configure your OpenAdmin preferences.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="nav-item" style={{ padding: '0.75rem', borderRadius: '50%' }}>
              <Bell size={20} />
            </button>
            <button className="btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </header>

        {/* Main Content Render */}
        {activeTab !== 'settings' ? (
          <div className="dashboard-grid">
            {items
              .filter(item => {
                if (activeTab === 'warranties') return item.category === 'warranty';
                if (activeTab === 'subscriptions') return item.category === 'subscription';
                return true; // Dashboard shows all
              })
              .map(item => (
                <div className="card glass-panel" key={item.id}>
                  <div className="card-header">
                    <h3>{item.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div className="card-actions">
                        <button className="action-btn" onClick={() => handleEdit(item)}>
                          <Pencil size={16} />
                        </button>
                        <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => item.id && handleDelete(item.id)}>
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="card-icon" style={{ 
                        color: item.category === 'warranty' ? '#10b981' : 
                               item.category === 'subscription' ? '#6366f1' : '#f59e0b' 
                      }}>
                        {item.category === 'warranty' && <Receipt size={24} />}
                        {item.category === 'subscription' && <CreditCard size={24} />}
                        {item.category === 'document' && <ShieldCheck size={24} />}
                      </div>
                    </div>
                  </div>
                  {item.cost && <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${item.cost.toFixed(2)}</h1>}
                  {item.expiration_date && <p>Expires: {item.expiration_date}</p>}
                  {item.notes && <p style={{fontSize: '0.875rem', opacity: 0.7, marginTop: 'auto'}}>{item.notes.substring(0, 50)}{item.notes.length > 50 ? '...' : ''}</p>}
                </div>
            ))}
            
            {items.filter(item => {
              if (activeTab === 'warranties') return item.category === 'warranty';
              if (activeTab === 'subscriptions') return item.category === 'subscription';
              return true;
            }).length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
                No items found here. Click "Add Item" to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="settings-panel glass-panel" style={{ padding: '2rem', marginTop: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Preferences</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Push Notifications</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Receive desktop alerts for expiring items</p>
              </div>
              <button 
                onClick={toggleNotifications}
                style={{
                  width: '50px', height: '26px', borderRadius: '13px', border: 'none',
                  backgroundColor: settings.notifications_enabled ? '#3b82f6' : '#374151',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                  position: 'absolute', top: '3px', left: settings.notifications_enabled ? '27px' : '3px',
                  transition: 'all 0.3s'
                }} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1.5rem' }}>Data Management</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Export Backup</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Save all your items to a local JSON file</p>
                </div>
                <button onClick={handleExportData} className="primary-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem' }}>
                  Export Data
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ef4444' }}>Danger Zone</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Permanently delete all your local data</p>
                </div>
                <button onClick={handleWipeDatabase} className="primary-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.5rem 1rem' }}>
                  Wipe Database
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Item Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItemId ? "Edit Item" : "Add New Item"}</h2>
              <button className="icon-btn" onClick={resetForm}>
                <X size={24} />
              </button>
            </div>

            {isOcrProcessing ? (
              <div className="ocr-loader">
                <div className="spinner"></div>
                <h3>Scanning Receipt...</h3>
                <p>{ocrProgress}% complete</p>
              </div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSaveItem}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="warranty">Warranty</option>
                    <option value="subscription">Subscription</option>
                    <option value="document">Personal Document</option>
                  </select>
                </div>

                {/* Conditional OCR Dropzone for Warranties */}
                {category === 'warranty' && (
                  <div className="form-group">
                    <label>Quick Scan Receipt (Optional)</label>
                    <label className="file-upload-zone">
                      <UploadCloud size={32} />
                      <span>Click to upload receipt image</span>
                      <span style={{ fontSize: '0.75rem' }}>Auto-extracts cost and details locally</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
                )}

                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. MacBook Pro, Netflix, Passport" 
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Cost / Monthly</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={cost} 
                      onChange={e => setCost(e.target.value)} 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Expiration / Renewal Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={expirationDate} 
                      onChange={e => setExpirationDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3} 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="Add any specific details here..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn-primary">{editingItemId ? "Save Changes" : "Save Item"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
