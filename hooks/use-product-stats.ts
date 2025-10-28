"use client"

import { useState, useEffect } from 'react'
import { productsService } from '@/lib/api/products'
import { Product } from '@/types'

export interface ProductStats {
  totalProducts: number
  pendingApproval: number
  liveProducts: number
  lowStockProducts: number
  totalRevenue: number
  categories: number
  loading: boolean
}

export function useProductStats(): ProductStats {
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    pendingApproval: 0,
    liveProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    categories: 0,
    loading: true
  })

  const calculateStats = (products: Product[]) => {
    const totalProducts = products.length
    const pendingApproval = products.filter(p => p.status === 'pending').length
    const liveProducts = products.filter(p => p.status === 'approved' && p.isActive).length
    const lowStockProducts = products.filter(p => (p.stockQuantity || p.stock || 0) < 10).length
    
    const totalRevenue = products
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.price * (p.stockQuantity || p.stock || 0)), 0)
    
    const uniqueCategories = new Set(products.map(p => p.categoryName || p.category))
    const categories = uniqueCategories.size

    setStats({
      totalProducts,
      pendingApproval,
      liveProducts,
      lowStockProducts,
      totalRevenue,
      categories,
      loading: false
    })
  }

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }))
      
      // Fetch a large number of products to calculate statistics
      const response = await productsService.getProducts({ page: 1, limit: 1000 })
      calculateStats(response.data)
    } catch (error) {
      console.error('Error fetching product statistics:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return stats
}