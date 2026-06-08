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
  UploadCloud
} from "lucide-react";
import Tesseract from "tesseract.js";
import "./App.css";

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

  useEffect(() => {
    fetchItems();
  }, []);

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

      await invoke("insert_item", { item: newItem });
      
      setTitle("");
      setCost("");
      setExpirationDate("");
      setNotes("");
      setIsAddModalOpen(false);
      
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
            <h1>Life Ops Overview</h1>
            <p>Your local-first command center.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="nav-item" style={{ padding: '0.75rem', borderRadius: '50%' }}>
              <Bell size={20} />
            </button>
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {items.map(item => (
            <div className="card glass-panel" key={item.id}>
              <div className="card-header">
                <h3>{item.title}</h3>
                <div className="card-icon" style={{ 
                  color: item.category === 'warranty' ? '#10b981' : 
                         item.category === 'subscription' ? '#6366f1' : '#f59e0b' 
                }}>
                  {item.category === 'warranty' && <Receipt size={24} />}
                  {item.category === 'subscription' && <CreditCard size={24} />}
                  {item.category === 'document' && <ShieldCheck size={24} />}
                </div>
              </div>
              {item.cost && <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${item.cost.toFixed(2)}</h1>}
              {item.expiration_date && <p>Expires: {item.expiration_date}</p>}
              {item.notes && <p style={{fontSize: '0.875rem', opacity: 0.7, marginTop: 'auto'}}>{item.notes.substring(0, 50)}{item.notes.length > 50 ? '...' : ''}</p>}
            </div>
          ))}
          
          {items.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
              No items yet. Click "Add Item" to get started!
            </p>
          )}
        </div>
      </main>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="icon-btn" onClick={() => setIsAddModalOpen(false)}>
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
                  <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Item</button>
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
