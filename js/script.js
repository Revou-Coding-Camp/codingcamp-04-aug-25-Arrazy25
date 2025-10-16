// Warehouse Management System
class WarehouseManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('warehouseItems')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderItems();
        this.updateStats();
    }

    bindEvents() {
        // Form submission
        document.getElementById('item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem();
        });

        // Reset form
        document.getElementById('reset-form').addEventListener('click', () => {
            this.resetForm();
        });

        // Search and filter
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.renderItems(e.target.value);
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.renderItems();
        });

        document.getElementById('stock-filter').addEventListener('change', (e) => {
            this.renderItems();
        });

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            this.importData();
        });

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateItem();
        });

        // Close modal when clicking outside
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeModal();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addItem() {
        const formData = new FormData(document.getElementById('item-form'));
        
        const item = {
            id: this.generateId(),
            name: document.getElementById('item-name').value.trim(),
            sku: document.getElementById('item-sku').value.trim() || `SKU-${Date.now()}`,
            category: document.getElementById('item-category').value,
            stock: parseInt(document.getElementById('item-stock').value),
            price: parseInt(document.getElementById('item-price').value),
            minStock: parseInt(document.getElementById('item-minstock').value),
            description: document.getElementById('item-description').value.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!item.name || isNaN(item.stock) || isNaN(item.price)) {
            this.showNotification('Harap isi semua field yang diperlukan!', 'error');
            return;
        }

        this.items.unshift(item);
        this.saveToLocalStorage();
        this.renderItems();
        this.updateStats();
        this.resetForm();
        this.showNotification('Barang berhasil ditambahkan!', 'success');
    }

    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;

        this.currentEditId = id;
        
        // Fill form with item data
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-form').querySelector('[name="name"]').value = item.name;
        document.getElementById('edit-form').querySelector('[name="sku"]').value = item.sku;
        document.getElementById('edit-form').querySelector('[name="category"]').value = item.category;
        document.getElementById('edit-form').querySelector('[name="stock"]').value = item.stock;
        document.getElementById('edit-form').querySelector('[name="price"]').value = item.price;
        document.getElementById('edit-form').querySelector('[name="minstock"]').value = item.minStock;
        document.getElementById('edit-form').querySelector('[name="description"]').value = item.description;

        this.openModal();
    }

    updateItem() {
        const formData = new FormData(document.getElementById('edit-form'));
        
        const updatedItem = {
            name: formData.get('name').trim(),
            sku: formData.get('sku').trim(),
            category: formData.get('category'),
            stock: parseInt(formData.get('stock')),
            price: parseInt(formData.get('price')),
            minStock: parseInt(formData.get('minstock')),
            description: formData.get('description').trim(),
            updatedAt: new Date().toISOString()
        };

        const index = this.items.findIndex(item => item.id === this.currentEditId);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updatedItem };
            this.saveToLocalStorage();
            this.renderItems();
            this.updateStats();
            this.closeModal();
            this.showNotification('Barang berhasil diupdate!', 'success');
        }
    }

    deleteItem(id) {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveToLocalStorage();
            this.renderItems();
            this.updateStats();
            this.showNotification('Barang berhasil dihapus!', 'success');
        }
    }

    getStockStatus(stock, minStock) {
        if (stock === 0) return 'out';
        if (stock <= minStock) return 'low';
        return 'available';
    }

    getStockStatusText(stock, minStock) {
        if (stock === 0) return 'Stok Habis';
        if (stock <= minStock) return 'Stok Rendah';
        return 'Stok Tersedia';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    formatCategory(category) {
        const categories = {
            elektronik: 'Elektronik',
            pakaian: 'Pakaian',
            makanan: 'Makanan',
            perabotan: 'Perabotan',
            lainnya: 'Lainnya'
        };
        return categories[category] || category;
    }

    renderItems(searchTerm = '') {
        const itemsList = document.getElementById('items-list');
        const noItems = document.getElementById('no-items');
        const itemsCount = document.getElementById('items-count');
        
        const categoryFilter = document.getElementById('category-filter').value;
        const stockFilter = document.getElementById('stock-filter').value;
        
        let filteredItems = this.items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            
            const stockStatus = this.getStockStatus(item.stock, item.minStock);
            const matchesStock = !stockFilter || stockStatus === stockFilter;
            
            return matchesSearch && matchesCategory && matchesStock;
        });

        if (filteredItems.length === 0) {
            itemsList.style.display = 'none';
            noItems.style.display = 'block';
        } else {
            itemsList.style.display = 'grid';
            noItems.style.display = 'none';
            
            itemsList.innerHTML = filteredItems.map(item => {
                const stockStatus = this.getStockStatus(item.stock, item.minStock);
                const stockStatusText = this.getStockStatusText(item.stock, item.minStock);
                const totalValue = item.stock * item.price;
                
                return `
                    <div class="item-card ${stockStatus === 'low' ? 'low-stock' : ''} ${stockStatus === 'out' ? 'out-of-stock' : ''}">
                        <div class="item-header">
                            <div>
                                <div class="item-name">${item.name}</div>
                                <div class="item-sku">${item.sku}</div>
                            </div>
                            <span class="item-category">${this.formatCategory(item.category)}</span>
                        </div>
                        
                        <div class="item-details">
                            <div class="item-stock">
                                <span class="stock-amount">${item.stock} unit</span>
                                <span class="stock-status ${stockStatus}">${stockStatusText}</span>
                            </div>
                            <div class="item-price">${this.formatPrice(item.price)}</div>
                            <div class="item-total-value">Total: ${this.formatPrice(totalValue)}</div>
                            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                            <div class="item-updated">Terakhir update: ${new Date(item.updatedAt).toLocaleDateString('id-ID')}</div>
                        </div>
                        
                        <div class="item-actions">
                            <button class="action-btn edit-btn" onclick="warehouseManager.editItem('${item.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" onclick="warehouseManager.deleteItem('${item.id}')">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        itemsCount.textContent = `${filteredItems.length} barang`;
    }

    updateStats() {
        const totalItems = this.items.length;
        const lowStockItems = this.items.filter(item => 
            this.getStockStatus(item.stock, item.minStock) === 'low' || 
            this.getStockStatus(item.stock, item.minStock) === 'out'
        ).length;
        const totalValue = this.items.reduce((sum, item) => sum + (item.stock * item.price), 0);

        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('low-stock').textContent = lowStockItems;
        document.getElementById('total-value').textContent = this.formatPrice(totalValue);
    }

    resetForm() {
        document.getElementById('item-form').reset();
        document.getElementById('item-minstock').value = 5;
    }

    openModal() {
        document.getElementById('edit-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEditId = null;
        document.getElementById('edit-form').reset();
    }

    saveToLocalStorage() {
        localStorage.setItem('warehouseItems', JSON.stringify(this.items));
    }

    exportData() {
        const dataStr = JSON.stringify(this.items, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `warehouse-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Data berhasil diexport!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedItems = JSON.parse(event.target.result);
                    
                    if (Array.isArray(importedItems)) {
                        // Validate imported items structure
                        const validItems = importedItems.filter(item => 
                            item.name && typeof item.stock === 'number' && typeof item.price === 'number'
                        );
                        
                        if (validItems.length > 0) {
                            this.items = [...validItems, ...this.items];
                            this.saveToLocalStorage();
                            this.renderItems();
                            this.updateStats();
                            this.showNotification(`${validItems.length} barang berhasil diimport!`, 'success');
                        } else {
                            this.showNotification('File tidak berisi data barang yang valid!', 'error');
                        }
                    } else {
                        this.showNotification('Format file tidak valid!', 'error');
                    }
                } catch (error) {
                    this.showNotification('Error membaca file!', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the warehouse manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.warehouseManager = new WarehouseManager();
});

// Add some sample data for demonstration
function addSampleData() {
    const sampleItems = [
        {
            id: 'sample1',
            name: 'Laptop ASUS ROG',
            sku: 'ELEC-LAP-001',
            category: 'elektronik',
            stock: 15,
            price: 15000000,
            minStock: 5,
            description: 'Laptop gaming high-end',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'sample2',
            name: 'Kaos Polo Shirt',
            sku: 'CLOTH-POL-001',
            category: 'pakaian',
            stock: 2,
            price: 150000,
            minStock: 10,
            description: 'Kaos polo cotton premium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'sample3',
            name: 'Meja Kerja Minimalis',
            sku: 'FURN-DSK-001',
            category: 'perabotan',
            stock: 0,
            price: 800000,
            minStock: 3,
            description: 'Meja kerja modern minimal