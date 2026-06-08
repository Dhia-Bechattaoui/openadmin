import { useState } from "react";
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

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
          <div className="card glass-panel">
            <div className="card-header">
              <h3>Active Warranties</h3>
              <div className="card-icon" style={{ color: '#10b981' }}>
                <Receipt size={24} />
              </div>
            </div>
            <h1>12</h1>
            <p>2 expiring within 30 days</p>
          </div>

          <div className="card glass-panel">
            <div className="card-header">
              <h3>Subscriptions</h3>
              <div className="card-icon" style={{ color: '#6366f1' }}>
                <CreditCard size={24} />
              </div>
            </div>
            <h1>$145<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></h1>
            <p>1 free trial active</p>
          </div>

          <div className="card glass-panel">
            <div className="card-header">
              <h3>Documents</h3>
              <div className="card-icon" style={{ color: '#f59e0b' }}>
                <ShieldCheck size={24} />
              </div>
            </div>
            <h1>4</h1>
            <p>Passport expires in 8 months</p>
          </div>
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
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select">
                  <option value="warranty">Warranty</option>
                  <option value="subscription">Subscription</option>
                  <option value="document">Personal Document</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-input" placeholder="e.g. MacBook Pro, Netflix, Passport" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Cost / Monthly</label>
                  <input type="number" className="form-input" placeholder="0.00" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expiration / Renewal Date</label>
                  <input type="date" className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-textarea" rows={3} placeholder="Add any specific details here..."></textarea>
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
