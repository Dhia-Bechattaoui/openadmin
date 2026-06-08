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
  X
} from "lucide-react";
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

  const fetchItems = async () => {
    try {
      const fetchedItems: Item[] = await invoke("get_items");
      setItems(fetchedItems);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  // Load items on initial mount
  useEffect(() => {
    fetchItems();
  }, []);

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
      
      // Reset form and close modal
      setTitle("");
      setCost("");
      setExpirationDate("");
      setNotes("");
      setIsAddModalOpen(false);
      
      // Refresh the dashboard with the newly saved item
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

        {/* Dashboard Grid rendering real items from SQLite */}
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
              {item.notes && <p style={{fontSize: '0.875rem', opacity: 0.7, marginTop: 'auto'}}>{item.notes}</p>}
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
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSaveItem}>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="warranty">Warranty</option>
                  <option value="subscription">Subscription</option>
                  <option value="document">Personal Document</option>
                </select>
              </div>

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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
