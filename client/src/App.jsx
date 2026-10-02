import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, RefreshCw, Trash2, Edit2, X, Search, Filter, DollarSign, AlertTriangle, Download, Sun, Moon } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    purchasePrice: '',
    stockQuantity: '',
    lowStockLimit: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      price: '',
      purchasePrice: '',
      stockQuantity: '',
      lowStockLimit: ''
    });
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price || product.sellingPrice,
      purchasePrice: product.purchasePrice,
      stockQuantity: product.stockQuantity,
      lowStockLimit: product.lowStockLimit
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        sellingPrice: Number(form.price),
        purchasePrice: Number(form.purchasePrice),
        stockQuantity: Number(form.stockQuantity),
        lowStockLimit: Number(form.lowStockLimit)
      };

      const url = editingId 
        ? `http://localhost:5000/api/products/${editingId}`
        : 'http://localhost:5000/api/products';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (res.ok) {
        resetForm();
        fetchProducts();
      } else {
        alert('Action failed. Check console.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Export Inventory to CSV
  const exportToCSV = () => {
    if (filteredProducts.length === 0) {
      alert('No products to export!');
      return;
    }

    const headers = ['Name,Category,Selling Price ($),Purchase Price ($),Stock Quantity,Low Stock Limit'];
    const rows = filteredProducts.map(p => 
      `"${p.name}","${p.category}",${p.price || p.sellingPrice || 0},${p.purchasePrice || 0},${p.stockQuantity},${p.lowStockLimit}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizmanager_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric Calculations
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * (p.price || p.sellingPrice || 0)), 0);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockLimit);
  const lowStockCount = lowStockItems.length;

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return searchTerm.trim() !== '' ? matchesSearch : matchesCategory;
  });

  // Dynamic Dark Mode Colors
  const theme = {
    bg: darkMode ? '#0f172a' : '#f4f6f8',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    subText: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#cbd5e1',
    tableHeaderBg: darkMode ? '#334155' : '#f1f5f9',
    tableBorder: darkMode ? '#334155' : '#e2e8f0',
    inputBg: darkMode ? '#0f172a' : '#ffffff',
  };

  const dynamicInputStyle = { ...inputStyle, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', transition: 'all 0.3s ease' }}>
      
      {/* Header Bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard size={32} color="#2563eb" />
          <h1 style={{ margin: 0, color: theme.text }}>BizManager Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ ...btnStyle, backgroundColor: darkMode ? '#334155' : '#e2e8f0', color: theme.text }}
          >
            {darkMode ? <Sun size={18} color="#eab308" /> : <Moon size={18} color="#475569" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button onClick={exportToCSV} style={{ ...btnStyle, backgroundColor: '#16a34a' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </header>

      {/* Prominent Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderLeft: '6px solid #dc2626',
          padding: '12px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <AlertTriangle size={24} color="#dc2626" />
          <div>
            <strong style={{ color: '#991b1b', fontSize: '15px' }}>
              Warning: {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} running low on stock!
            </strong>
            <p style={{ margin: '2px 0 0 0', color: '#b91c1c', fontSize: '13px' }}>
              {lowStockItems.map(item => `${item.name} (${item.stockQuantity} left)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
        <div style={{ ...cardStyle, backgroundColor: theme.cardBg }}>
          <div>
            <p style={cardLabelStyle}>Total Items</p>
            <h3 style={{ ...cardValueStyle, color: theme.text }}>{totalProducts}</h3>
          </div>
          <Package size={36} color="#2563eb" />
        </div>

        <div style={{ ...cardStyle, backgroundColor: theme.cardBg }}>
          <div>
            <p style={cardLabelStyle}>Total Stock Value</p>
            <h3 style={{ ...cardValueStyle, color: theme.text }}>${totalStockValue.toLocaleString()}</h3>
          </div>
          <DollarSign size={36} color="#16a34a" />
        </div>

        <div style={{ ...cardStyle, backgroundColor: theme.cardBg }}>
          <div>
            <p style={cardLabelStyle}>Low Stock Alerts</p>
            <h3 style={{ ...cardValueStyle, color: lowStockCount > 0 ? '#dc2626' : theme.text }}>{lowStockCount}</h3>
          </div>
          <AlertTriangle size={36} color={lowStockCount > 0 ? '#dc2626' : '#94a3b8'} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Form Panel */}
        <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: theme.text }}>
              {editingId ? <Edit2 size={20} /> : <Plus size={20} />} 
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            {editingId && (
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.subText }}>
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={dynamicInputStyle} />
            <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={dynamicInputStyle} />
            <input type="number" placeholder="Selling Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={dynamicInputStyle} />
            <input type="number" placeholder="Purchase Price" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required style={dynamicInputStyle} />
            <input type="number" placeholder="Stock Quantity" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required style={dynamicInputStyle} />
            <input type="number" placeholder="Low Stock Limit" value={form.lowStockLimit} onChange={(e) => setForm({ ...form, lowStockLimit: e.target.value })} required style={dynamicInputStyle} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ ...btnStyle, flex: 1, backgroundColor: editingId ? '#eab308' : '#2563eb' }}>
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ ...btnStyle, backgroundColor: '#94a3b8' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Panel */}
        <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: theme.text }}>
              <Package size={20} /> Inventory List
            </h2>
            <button onClick={fetchProducts} style={{ ...btnStyle, backgroundColor: '#64748b' }}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...dynamicInputStyle, paddingLeft: '35px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Filter size={18} color={theme.subText} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ ...dynamicInputStyle, cursor: 'pointer' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: theme.cardBg, color: theme.text }}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? <p>Loading...</p> : filteredProducts.length === 0 ? <p style={{ color: theme.subText }}>No products found.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: theme.tableHeaderBg, textAlign: 'left', color: theme.text }}>
                  <th style={{ ...thStyle, borderColor: theme.border }}>Name</th>
                  <th style={{ ...thStyle, borderColor: theme.border }}>Category</th>
                  <th style={{ ...thStyle, borderColor: theme.border }}>Price</th>
                  <th style={{ ...thStyle, borderColor: theme.border }}>Stock</th>
                  <th style={{ ...thStyle, borderColor: theme.border }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.category}</td>
                    <td style={tdStyle}>${p.price || p.sellingPrice}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: p.stockQuantity <= p.lowStockLimit ? '#fef2f2' : '#f0fdf4',
                        color: p.stockQuantity <= p.lowStockLimit ? '#dc2626' : '#16a34a',
                        fontWeight: 'bold'
                      }}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditClick(p)} style={{ ...actionBtnStyle, backgroundColor: '#f59e0b' }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' };
const btnStyle = { padding: '10px 15px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' };
const actionBtnStyle = { color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
const thStyle = { padding: '10px', borderBottom: '2px solid #cbd5e1' };
const tdStyle = { padding: '10px' };

const cardStyle = {
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};
const cardLabelStyle = { margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 'bold' };
const cardValueStyle = { margin: '5px 0 0 0', fontSize: '24px' };