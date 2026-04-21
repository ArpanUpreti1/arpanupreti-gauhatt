import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, MoreVertical, X, Upload } from 'lucide-react';
import { ProductService } from '../../../../services/api';
import { Product } from '../../../../types';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Mock data for initial UI dev if API fails or is empty
    const mockProducts: Product[] = [
        { id: '1', name: 'Organic Tomatoes', description: 'Fresh farm tomatoes', price: 40, stockQuantity: 100, category: 'Vegetables', unit: 'kg', isActive: true, imageUrl: '' },
        { id: '2', name: 'Fresh Milk', description: 'Pure cow milk', price: 60, stockQuantity: 50, category: 'Dairy', unit: 'liter', isActive: true, imageUrl: '' },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await ProductService.getMyProducts();
            if (response.success && response.data) {
                setProducts(response.data.products ?? []);
            } else {
                // Fallback to mock data for demonstration if API is not ready
                console.warn("API returned no data, using mock data");
                setProducts(mockProducts);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts(mockProducts); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', currentProduct.name || '');
        formData.append('description', currentProduct.description || '');
        formData.append('price', (currentProduct.price || 0).toString());
        formData.append('stockQuantity', (currentProduct.stockQuantity || 0).toString());
        formData.append('category', currentProduct.category || '');
        formData.append('unit', currentProduct.unit || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (currentProduct.id) {
                await ProductService.update(currentProduct.id, formData);
            } else {
                await ProductService.create(formData);
            }
            setIsModalOpen(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await ProductService.delete(id);
                if (!response.success) {
                    alert(response.message || 'Failed to delete product. Please try again.');
                    return;
                }
                await fetchProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setCurrentProduct({});
        setImageFile(null);
    };

    const openEditModal = (product: Product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Product Management</h1>
                    <p className="text-sm text-gray-500">Manage your farm's produce and inventory.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400 text-gray-700"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                    <Filter size={18} />
                    <span>Filter</span>
                </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img src={`https://localhost:7216${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🥕'
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">Rs. {product.price}/{product.unit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 w-20 bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${product.stockQuantity < 10 ? 'bg-red-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: '45%' }} // Dynamic width mocked for now
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">{product.stockQuantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.isActive
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {loading && (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading products...</td></tr>
                            )}
                            {!loading && products.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No products found. Add your first product!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900 font-serif">
                                {currentProduct.id ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentProduct.name || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                            placeholder="e.g. Organic Tomatoes"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={currentProduct.category || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Fruits">Fruits</option>
                                            <option value="Dairy">Dairy</option>
                                            <option value="Grains">Grains</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    {/* Price & Unit */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs. )</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={currentProduct.price || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <input
                                                type="text"
                                                required
                                                value={currentProduct.unit || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                                placeholder="e.g. kg, liter"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={currentProduct.stockQuantity || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, stockQuantity: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            value={currentProduct.description || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all resize-none"
                                            placeholder="Describe your product..."
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-orange-300 transition-colors bg-gray-50/50">
                                            <input
                                                type="file"
                                                id="product-image"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                            />
                                            <label htmlFor="product-image" className="cursor-pointer flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                                                    <Upload size={20} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {imageFile ? imageFile.name : 'Click to upload image'}
                                                </p>
                                                <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-95"
                                >
                                    {currentProduct.id ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
