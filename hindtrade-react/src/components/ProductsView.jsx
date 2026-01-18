import { useState, useEffect } from 'react'
import { htAPI } from '../config/supabase'

export default function ProductsView({ exporterId }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newProduct, setNewProduct] = useState({ name: '', description: '', image_url: '' })

    useEffect(() => {
        loadProducts()
    }, [exporterId])

    const loadProducts = async () => {
        if (!exporterId) return
        setLoading(true)
        const result = await htAPI.getProducts(exporterId)
        if (result.success) {
            setProducts(result.products)
        }
        setLoading(false)
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        if (!exporterId) return

        const result = await htAPI.createProduct({
            exporter_id: exporterId,
            ...newProduct,
            enhancement_status: 'none'
        })

        if (result.success) {
            setProducts([result.product, ...products])
            setIsAdding(false)
            setNewProduct({ name: '', description: '', image_url: '' })
        } else {
            alert('Failed to add product: ' + result.error)
        }
    }

    const handleRequestEnhancement = async (product) => {
        if (!confirm(`Request Student Enhancement for "${product.name}"?\n\nThis will notify our student creator network to build a professional page for this product.`)) return

        const result = await htAPI.updateProduct(product.id, {
            enhancement_status: 'requested'
        })

        if (result.success) {
            setProducts(products.map(p => p.id === product.id ? result.product : p))
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Product Portfolio</h2>
                <p className="text-slate-400">Manage your products attached to your Trade Card.</p>
            </div>

            {/* Add Product Button */}
            {!isAdding && (
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                    >
                        <span>+</span> Add New Product
                    </button>
                </div>
            )}

            {/* Add Product Form */}
            {isAdding && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 max-w-2xl mx-auto mb-8 animate-fade-in-down">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Product</h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Product Name</label>
                            <input
                                type="text"
                                required
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="e.g. Organic Cotton Shirts"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                required
                                value={newProduct.description}
                                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                rows="3"
                                placeholder="Brief description of the product..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Image URL (Optional)</label>
                            <input
                                type="url"
                                value={newProduct.image_url}
                                onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List */}
            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="text-center text-slate-500 py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <p>No products added yet. Add your first product to showcase on your Trade Card.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onRequestEnhancement={handleRequestEnhancement} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ProductCard({ product, onRequestEnhancement }) {
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all group">
            {/* Image Placeholder */}
            <div className="h-40 bg-slate-900 relative group overflow-hidden">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-4xl font-bold bg-gradient-to-br from-slate-800 to-slate-900">
                        {product.name.substring(0, 2).toUpperCase()}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    {product.external_link ? (
                        <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-bold rounded shadow-lg backdrop-blur-sm">
                            Enhanced
                        </span>
                    ) : product.enhancement_status === 'requested' ? (
                        <span className="px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded shadow-lg backdrop-blur-sm">
                            Enhancement Requested
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-semibold text-white mb-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">{product.description}</p>

                {/* Actions */}
                <div className="space-y-3">
                    {product.external_link ? (
                        <a
                            href={product.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                        >
                            View Live Page ↗
                        </a>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Basic Card</span>
                                {product.enhancement_status === 'none' && <span className="text-amber-400">Upgrade Available</span>}
                            </div>

                            {product.enhancement_status === 'none' ? (
                                <button
                                    onClick={() => onRequestEnhancement(product)}
                                    className="w-full py-2 bg-slate-700 text-slate-300 rounded-lg border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <span>✨</span> Enhance (Student Assisted)
                                </button>
                            ) : (
                                <button disabled className="w-full py-2 bg-amber-500/10 text-amber-500/50 rounded-lg border border-amber-500/10 cursor-not-allowed text-sm font-medium">
                                    ⏳ Enhancement In Progress
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
