import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Package, RefreshCw } from 'lucide-react';
import { ProductService } from '../../../services/api';
import { Product } from '../../../types';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await ProductService.getAll();
            if (response.success && response.data) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (id: string, newQuantity: number) => {
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, stockQuantity: newQuantity } : p));
        // Note: Real API would need a specific 'updateStock' endpoint or use the full update
        const product = products.find(p => p.id === id);
        if (product) {
            const formData = new FormData();
            formData.append('stockQuantity', newQuantity.toString());
            // In a real scenario we'd append all other required fields or use PATCH
            await ProductService.update(id, formData);
        }
    };

    const lowStockThreshold = 10;
    const lowStockItems = products.filter(p => p.stockQuantity <= lowStockThreshold);
    const outOfStockItems = products.filter(p => p.stockQuantity === 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Inventory Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Low Stock Alerts</p>
                        <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <XCircleIcon />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Stock Levels</h2>
                    <button onClick={fetchInventory} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Quick Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{product.stockQuantity}</span>
                                            <span className="text-xs text-gray-500">{product.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.stockQuantity === 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>
                                        ) : product.stockQuantity <= lowStockThreshold ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Low Stock</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleStockUpdate(product.id, Math.max(0, product.stockQuantity - 1))}
                                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                                            >-</button>
                                            <button
                                                onClick={() => handleStockUpdate(product.id, product.stockQuantity + 1)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-500 flex items-center justify-center transition-colors"
                                            >+</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);

export default Inventory;
