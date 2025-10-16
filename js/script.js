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
        
        // Debug: Check if localStorage is working
        console.log('Items loaded:', this.items);
        console.log('LocalStorage available:', typeof(Storage) !== "undefined");
    }

    bindEvents() {
        // Form submission
        const itemForm = document.getElementById('item-form');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addItem();
            });
        }

        // Reset form
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Search and filter
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderItems(e.target.value);
            });
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.renderItems();
            });
        }

        const stockFilter = document.getElementById('stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.renderItems();
            });
        }

        // Export/Import
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateItem();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'edit-modal') {
                    this.closeModal();
                }
            });
        }
    }

    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addItem() {
        console.log('Add item function called');
        
        const itemName = document.getElementById('item-name');
        const itemSku = document.getElementById('item-sku');
        const itemCategory = document.getElementById('item-category');
        const itemStock = document.getElementById('item-stock');
        const itemPrice = document.getElementById('item-price');
        const itemMinstock = document.getElementById('item-minstock');
        const itemDescription = document.getElementById('item-description');

        // Validasi input
        if (!itemName || !itemStock || !itemPrice) {
            this.showNotification('Error: Form elements not found!', 'error');
            return;
        }

        const name = itemName.value.trim();
        const sku = itemSku.value.trim() || `SKU-${Date.now()}`;
        const category = itemCategory.value;
        const stock = parseInt(itemStock.value);
        const price = parseInt(itemPrice.value);
        const minStock = parseInt(itemMinstock.value);
        const description = itemDescription.value.trim();

        console.log('Form data:', { name, sku, category, stock, price, minStock, description });

        // Validasi data
        if (!name) {
            this.showNotification('Nama barang tidak boleh kosong!', 'error');
            itemName.focus();
            return;
        }

        if (isNaN(stock) || stock < 0) {
            this.showNotification('Stok harus berupa angka yang valid!', 'error');
            itemStock.focus();
            return;
        }

        if (isNaN(price) || price < 0) {
            this.showNotification('Harga harus berupa angka yang valid!', 'error');
            itemPrice.focus();
            return;
        }

        const item = {
            id: this.generateId(),
            name: name,
            sku: sku,
            category: category,
            stock: stock,
            price: price,
            minStock: minStock || 5,
            description: description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('New item:', item);

        // Tambahkan item ke array
        this.items.unshift(item);
        
        // Simpan ke localStorage
        const saveResult = this.saveToLocalStorage();
        console.log('Save result:', saveResult);
        
        // Update tampilan
        this.renderItems();
        this.updateStats();
        this.resetForm();
        
        this.showNotification('Barang berhasil ditambahkan!', 'success');
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('warehouseItems', JSON.stringify(this.items));
            console.log('Data saved to localStorage. Items count:', this.items.length);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error menyimpan data!', 'error');
            return false;
        }
    }

    editItem(id) {
        console.log('Editing item:', id);
        const item = this.items.find(item => item.id === id);
        if (!item) {
            this.showNotification('Barang tidak ditemukan!', 'error');
            return;
        }

        this.currentEditId = id;
        
        // Isi form edit dengan data item
        // Buat form edit yang sederhana dulu
        this.openEditModal(item);
    }

    openEditModal(item) {
        const modal = document.getElementById('edit-modal');
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Edit Barang</h3>
                <span class="close-modal">&times;</span>
            </div>
            <form id="edit-form" class="item-form">
                <input type="hidden" id="edit-id" value="${item.id}">
                <div class="form-group">
                    <label for="edit-name">Nama Barang</label>
                    <input type="text" id="edit-name" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-sku">Kode SKU</label>
                    <input type="text" id="edit-sku" value="${item.sku}">
                </div>
                <div class="form-group">
                    <label for="edit-category">Kategori</label>
                    <select id="edit-category">
                        <option value="elektronik" ${item.category === 'elektronik' ? 'selected' : ''}>Elektronik</option>
                        <option value="pakaian" ${item.category === 'pakaian' ? 'selected' : ''}>Pakaian</option>
                        <option value="makanan" ${item.category === 'makanan' ? 'selected' : ''}>Makanan</option>
                        <option value="perabotan" ${item.category === 'perabotan' ? 'selected' : ''}>Perabotan</option>
                        <option value="lainnya" ${item.category === 'lainnya' ? 'selected' : ''}>Lainnya</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-stock">Stok</label>
                        <input type="number" id="edit-stock" value="${item.stock}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-price">Harga (Rp)</label>
                        <input type="number" id="edit-price" value="${item.price}" min="0" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-minstock">Stok Minimum</label>
                    <input type="number" id="edit-minstock" value="${item.minStock}" min="0">
                </div>
                <div class="form-group">
                    <label for="edit-description">Deskripsi</label>
                    <textarea id="edit-description">${item.description || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Update Barang
                    </button>
                    <button type="button" class="btn btn-secondary close-modal">
                        <i class="fas fa-times"></i> Batal
                    </button>
                </div>
            </form>
        `;

        // Re-bind events untuk modal baru
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        modal.querySelector('#edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateItem();
        });

        this.openModal();
    }

    updateItem() {
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value.trim();
        const sku = document.getElementById('edit-sku').value.trim();
        const category = document.getElementById('edit-category').value;
        const stock = parseInt(document.getElementById('edit-stock').value);
        const price = parseInt(document.getElementById('edit-price').value);
        const minStock = parseInt(document.getElementById('edit-minstock').value);
        const description = document.getElementById('edit-description').value.trim();

        // Validasi
        if (!name || isNaN(stock) || isNaN(price)) {
            this.showNotification('Harap isi semua field yang diperlukan!', 'error');
            return;
        }

        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = {
                ...this.items[index],
                name,
                sku,
                category,
                stock,
                price,
                minStock,
                description,
                updatedAt: new Date().toISOString()
            };

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
        
        if (!itemsList || !noItems || !itemsCount) {
            console.error('Required DOM elements not found!');
            return;
        }
        
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const stockFilter = document.getElementById('stock-filter')?.value || '';
        
        let filteredItems = this.items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            
            const stockStatus = this.getStockStatus(item.stock, item.minStock);
            const matchesStock = !stockFilter || stockStatus === stockFilter;
            
            return matchesSearch && matchesCategory && matchesStock;
        });

        console.log('Filtered items:', filteredItems);

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
                                <div class="item-name">${this.escapeHtml(item.name)}</div>
                                <div class="item-sku">${this.escapeHtml(item.sku)}</div>
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
                            ${item.description ? `<div class="item-description">${this.escapeHtml(item.description)}</div>` : ''}
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const totalItems = this.items.length;
        const lowStockItems = this.items.filter(item => 
            this.getStockStatus(item.stock, item.minStock) === 'low' || 
            this.getStockStatus(item.stock, item.minStock) === 'out'
        ).length;
        const totalValue = this.items.reduce((sum, item) => sum + (item.stock * item.price), 0);

        const totalItemsEl = document.getElementById('total-items');
        const lowStockEl = document.getElementById('low-stock');
        const totalValueEl = document.getElementById('total-value');

        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (lowStockEl) lowStockEl.textContent = lowStockItems;
        if (totalValueEl) totalValueEl.textContent = this.formatPrice(totalValue);
    }

    resetForm() {
        const form = document.getElementById('item-form');
        if (form) {
            form.reset();
            const minStock = document.getElementById('item-minstock');
            if (minStock) minStock.value = 5;
        }
    }

    openModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentEditId = null;
        }
    }

    exportData() {
        try {
            const dataStr = JSON.stringify(this.items, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `warehouse-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Data berhasil diexport!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error mengexport data!', 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedItems = JSON.parse(event.target.result);
                    
                    if (Array.isArray(importedItems)) {
                        // Validasi struktur item
                        const validItems = importedItems.filter(item => 
                            item && item.name && typeof item.stock === 'number' && typeof item.price === 'number'
                        );
                        
                        if (validItems.length > 0) {
                            // Generate new IDs untuk menghindari duplikasi
                            const newItems = validItems.map(item => ({
                                ...item,
                                id: this.generateId(),
                                createdAt: item.createdAt || new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }));
                            
                            this.items = [...newItems, ...this.items];
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
                    console.error('Import error:', error);
                    this.showNotification('Error membaca file! Pastikan file format JSON valid.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        if (!notification || !notificationText) {
            console.log(`Notification [${type}]: ${message}`);
            alert(message); // Fallback ke alert
            return;
        }
        
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Test function untuk menambah sample data
function addSampleData() {
    if (typeof warehouseManager !== 'undefined') {
        const sampleItems = [
            {
                id: warehouseManager.generateId(),
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
                id: warehouseManager.generateId(),
                name: 'Kaos Polo Shirt',
                sku: 'CLOTH-POL-001',
                category: 'pakaian',
                stock: 2,
                price: 150000,
                minStock: 10,
                description: 'Kaos polo cotton premium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        sampleItems.forEach(item => {
            warehouseManager.items.unshift(item);
        });

        warehouseManager.saveToLocalStorage();
        warehouseManager.renderItems();
        warehouseManager.updateStats();
        warehouseManager.showNotification('Sample data berhasil ditambahkan!', 'success');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.warehouseManager = new WarehouseManager();
    
    // Untuk testing: tambah tombol sample data
    const controlsCard = document.querySelector('.controls-card');
    if (controlsCard) {
        const sampleBtn = document.createElement('button');
        sampleBtn.className = 'btn btn-outline';
        sampleBtn.innerHTML = '<i class="fas fa-vial"></i> Tambah Sample Data';
        sampleBtn.onclick = addSampleData;
        controlsCard.appendChild(sampleBtn);
    }
});

// Fallback jika ada error
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});