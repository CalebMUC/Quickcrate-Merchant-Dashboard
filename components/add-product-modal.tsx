"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogLargeContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { productsService, type ProductFormData, type CreateProductDto, type UpdateProductDto, type ProductImageUpload } from "@/lib/api/products"
import { Product } from "@/types"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  X, 
  Plus, 
  Package, 
  Tag, 
  Image as ImageIcon, 
  FileText, 
  Settings,
  AlertCircle,
  Check,
  Loader2,
  Sparkles
} from "lucide-react"
import { categoriesService, Category, SubCategory, SubSubCategory } from "@/lib/api/categories"
import { set } from "date-fns"

// Zod schema for product validation - Updated to match backend CreateProductDto
const productSchema = z.object({
  // Basic Information - Required fields from CreateProductDto
  productName: z.string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(2000, "Description cannot exceed 2000 characters"),
  productDescription: z.string()
    .min(1, "Product description is required")
    .max(2000, "Product description cannot exceed 2000 characters"),
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  discount: z.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .default(0),
  stockQuantity: z.number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  sku: z.string()
    .max(100, "SKU cannot exceed 100 characters")
    .optional(),
  
  // Category Information - More flexible validation
  categoryId: z.string()
    .min(1, "Category is required"),
  categoryName: z.string()
    .optional()
    .default(""),
  subCategoryId: z.string()
    .optional()
    .nullable()
    .default(null),
  subCategoryName: z.string()
    .optional()
    .nullable()
    .default(null),
  subSubCategoryId: z.string()
    .optional()
    .nullable()
    .default(null),
  subSubCategoryName: z.string()
    .optional()
    .nullable()
    .default(null),
  
  // Product Details - More flexible validation
  productSpecification: z.string()
    .default(""),
  features: z.string()
    .default(""),
  boxContents: z.string()
    .default(""),
  productType: z.string()
    .max(100, "Product type cannot exceed 100 characters")
    .default("physical"),
  
  // Status & Features
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.string()
    .max(50, "Status cannot exceed 50 characters")
    .default("pending"),
  
  // Search and Tags - Optional
  searchKeywords: z.string()
    .default(""),
  
  // Images (handled as separate array)
  imageUrls: z.array(z.string()).default([]),
  
  // Merchant ID - Will be populated from auth context
  merchantID: z.string()
    .default("00000000-0000-0000-0000-000000000000")
})

type LocalProductFormData = z.infer<typeof productSchema>

// AI Extraction utility function
function extractProductInfo(productText: string): {
  ProductSpecifications: Record<string, string>;
  ProductFeatures: string[];
} {
  const lines = productText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const specifications: Record<string, string> = {};
  const features: string[] = [];
  
  for (const line of lines) {
    // Check for specification patterns (key: value, key - value, key\t value)
    const specPatterns = [
      /^(.+?):\s*(.+)$/, // Key: Value
      /^(.+?)\s*[-–—]\s*(.+)$/, // Key - Value  
      /^(.+?)\t+(.+)$/, // Key\tValue
      /^(.+?)\s{2,}(.+)$/ // Key  Value (multiple spaces)
    ];
    
    let isSpecification = false;
    
    for (const pattern of specPatterns) {
      const match = line.match(pattern);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Filter out common specification patterns
        const specKeywords = [
          'size', 'weight', 'dimensions', 'resolution', 'capacity', 'speed', 'power', 
          'voltage', 'frequency', 'material', 'color', 'model', 'brand', 'processor',
          'memory', 'storage', 'display', 'battery', 'connectivity', 'ports', 'os',
          'operating system', 'chipset', 'graphics', 'camera', 'sensor', 'interface'
        ];
        
        const isLikelySpec = specKeywords.some(keyword => 
          key.toLowerCase().includes(keyword) || value.toLowerCase().includes(keyword)
        );
        
        if (isLikelySpec && key.length < 50 && value.length < 100) {
          specifications[key] = value;
          isSpecification = true;
          break;
        }
      }
    }
    
    // If not a specification, treat as a feature (skip very short lines)
    if (!isSpecification && line.length > 10) {
      // Clean up feature text
      let feature = line.replace(/^[•\-\*\+]\s*/, ''); // Remove bullet points
      feature = feature.replace(/^\d+\.\s*/, ''); // Remove numbered lists
      
      if (feature.length > 5) {
        features.push(feature);
      }
    }
  }
  
  return {
    ProductSpecifications: specifications,
    ProductFeatures: features
  };
}

// Helper function to format ProductSpecification for backend
function formatProductSpecification(specText: string): string {
  if (!specText.trim()) return "";
  
  // Check if it's in structured JSON format (from AI extraction)
  try {
    const parsed = JSON.parse(specText);
    if (parsed && typeof parsed === 'object') {
      // Handle structured format with metadata
      if (parsed._format === "structured" && parsed.ProductSpecifications) {
        // Convert structured JSON to backend text format
        return Object.entries(parsed.ProductSpecifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
      // Handle direct ProductSpecifications object
      else if (parsed.ProductSpecifications) {
        return Object.entries(parsed.ProductSpecifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
    }
  } catch {
    // Not JSON, treat as regular text
  }
  
  // Return as-is if it's already in text format
  return specText;
}

// Helper function to format ProductFeatures for backend  
function formatProductFeatures(featuresText: string): string {
  if (!featuresText.trim()) return "";
  
  // Check if it's in structured JSON format (from AI extraction)
  try {
    const parsed = JSON.parse(featuresText);
    if (parsed && typeof parsed === 'object') {
      // Handle structured format with metadata
      if (parsed._format === "structured" && Array.isArray(parsed.ProductFeatures)) {
        // Convert structured JSON to backend text format
        return parsed.ProductFeatures
          .map((feature: string) => feature.startsWith('•') ? feature : `• ${feature}`)
          .join('\n');
      }
      // Handle direct ProductFeatures array
      else if (Array.isArray(parsed.ProductFeatures)) {
        return parsed.ProductFeatures
          .map((feature: string) => feature.startsWith('•') ? feature : `• ${feature}`)
          .join('\n');
      }
    }
  } catch {
    // Not JSON, treat as regular text
  }
  
  // Return as-is if it's already in text format
  return featuresText;
}

interface AddProductModalProps {
  trigger?: React.ReactNode
  onProductAdded?: (product: any) => void
  // Edit mode props
  editMode?: boolean
  editProduct?: Product | null
  isOpen?: boolean
  onClose?: () => void
}

interface ImageUpload {
  file: File | null // Allow null for existing images
  preview: string
  id: string
  isExisting?: boolean // Flag for existing images
}

export function AddProductModal({ 
  trigger, 
  onProductAdded, 
  editMode = false, 
  editProduct = null, 
  isOpen = false, 
  onClose 
}: AddProductModalProps) {
  const [open, setOpen] = useState(editMode ? isOpen : false)
  const [images, setImages] = useState<ImageUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync open state with isOpen prop in edit mode
  useEffect(() => {
    if (editMode) {
      setOpen(isOpen)
    }
  }, [editMode, isOpen])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([])

  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubCategories, setLoadingSubCategories] = useState(false)
  const [loadingSubSubCategories, setLoadingSubSubCategories] = useState(false)

  const [refreshing, setRefreshing] = useState(false)
  const [rawText, setRawText] = useState("")

  const form = useForm<LocalProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      description: "",
      productDescription: "",
      price: 0,
      discount: 0,
      stockQuantity: 0,
      sku: "",
      categoryId: "",
      categoryName: "",
      subCategoryId: "",
      subCategoryName: "",
      subSubCategoryId: "",
      subSubCategoryName: "",
      productSpecification: "",
      features: "",
      boxContents: "",
      productType: "physical",
      isActive: true,
      isFeatured: false,
      status: "pending",
      searchKeywords: "",
      imageUrls: [],
      merchantID: "00000000-0000-0000-0000-000000000000" // Default GUID - will be set from auth context
    }
  })

  // Populate form when in edit mode
  useEffect(() => {
    if (editMode && editProduct && open) {
      console.log('🔄 Populating edit form with product data:', editProduct)
      
      // Set form values with proper fallbacks based on Product interface
      form.reset({
        // Basic Information
        productName: editProduct.productName || editProduct.name || "",
        description: editProduct.description || "",
        productDescription: editProduct.productDescription || editProduct.description || "",
        price: editProduct.price || 0,
        discount: editProduct.discount || 0,
        stockQuantity: editProduct.stockQuantity || editProduct.stock || 0,
        sku: editProduct.sku || "",
        
        // Category Information (Product interface now includes all category IDs and names)
        categoryId: editProduct.categoryId || "",
        categoryName: editProduct.categoryName || editProduct.category || "",
        subCategoryId: editProduct.subCategoryId || "",
        subCategoryName: editProduct.subCategoryName || "",
        subSubCategoryId: editProduct.subSubCategoryId || "",
        subSubCategoryName: editProduct.subSubCategoryName || "",
        
        // Product Details (not in Product interface, use fallbacks)
        productSpecification: (editProduct as any).productSpecification || editProduct.description || "",
        features: (editProduct as any).features || "",
        boxContents: (editProduct as any).boxContents || "",
        productType: (editProduct as any).productType || "physical",
        
        // Status and Features
        isActive: editProduct.isActive ?? true,
        isFeatured: editProduct.isFeatured ?? false,
        status: editProduct.status || "pending",
        
        // Search and Images
        searchKeywords: (editProduct as any).searchKeywords || editProduct.productName || editProduct.name || "",
        imageUrls: editProduct.imageUrls || [],
        merchantID: editProduct.merchantID || "00000000-0000-0000-0000-000000000000"
      })

      console.log('✅ Form populated with values:', {
        productName: editProduct.productName || editProduct.name,
        categoryId: editProduct.categoryId,
        categoryName: editProduct.categoryName,
        subCategoryId: editProduct.subCategoryId,
        subCategoryName: editProduct.subCategoryName,
        subSubCategoryId: editProduct.subSubCategoryId,
        subSubCategoryName: editProduct.subSubCategoryName,
        imageCount: editProduct.imageUrls?.length || 0
      })

      // Set images from imageUrls
      if (editProduct.imageUrls && editProduct.imageUrls.length > 0) {
        const imageUploads: ImageUpload[] = editProduct.imageUrls.map((url, index) => ({
          id: `edit-image-${index}`,
          preview: url,
          file: null, // Existing images don't have file objects
          isExisting: true // Mark as existing
        }))
        setImages(imageUploads)
      } else {
        setImages([]) // Clear images if no imageUrls
      }

      // Load categories and subcategories for edit mode
      loadCategories().then(() => {
        // Load subcategories if category exists (to enable dropdown and show options)
        if (editProduct.categoryId) {
          console.log('🔄 Loading subcategories for edit mode - Category ID:', editProduct.categoryId)
          
          loadSubCategories(editProduct.categoryId).then(() => {
            // After subcategories are loaded, try to find and set the correct subCategoryId
            // if we have a subCategoryName but no subCategoryId
            if (editProduct.subCategoryName && !editProduct.subCategoryId) {
              const matchingSubCategory = subCategories.find(sc => 
                sc.name.toLowerCase() === editProduct.subCategoryName?.toLowerCase()
              )
              
              if (matchingSubCategory) {
                console.log('🔍 Found matching subcategory:', matchingSubCategory)
                form.setValue("subCategoryId", matchingSubCategory.subCategoryId || matchingSubCategory.id)
              }
            }
            
            // Load sub-subcategories if we have subCategory info
            if (editProduct.subCategoryId || editProduct.subCategoryName) {
              const subCategoryIdToUse = editProduct.subCategoryId || 
                subCategories.find(sc => sc.name.toLowerCase() === editProduct.subCategoryName?.toLowerCase())?.subCategoryId ||
                subCategories.find(sc => sc.name.toLowerCase() === editProduct.subCategoryName?.toLowerCase())?.id
              
              if (subCategoryIdToUse) {
                console.log('🔄 Loading sub-subcategories for edit mode - SubCategory ID:', subCategoryIdToUse)
                
                loadSubSubCategories(subCategoryIdToUse).then(() => {
                  // Try to find and set the correct subSubCategoryId
                  if (editProduct.subSubCategoryName && !editProduct.subSubCategoryId) {
                    const matchingSubSubCategory = subSubCategories.find(ssc => 
                      ssc.name.toLowerCase() === editProduct.subSubCategoryName?.toLowerCase()
                    )
                    
                    if (matchingSubSubCategory) {
                      console.log('🔍 Found matching sub-subcategory:', matchingSubSubCategory)
                      form.setValue("subSubCategoryId", matchingSubSubCategory.subSubCategoryId || matchingSubSubCategory.id)
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  }, [editMode, editProduct, open, form])

  const watchedCategoryId = form.watch("categoryId")
  const watchedSubCategoryId = form.watch("subCategoryId")

  // Load categories when modal opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  // Load subcategories when category changes
  useEffect(() => {
    if (watchedCategoryId) {
      // Only load subcategories if not already loaded or if category actually changed
      const shouldLoadSubCategories = !editMode || 
        subCategories.length === 0 || 
        !subCategories.some(sc => sc.categoryId === watchedCategoryId)
      
      if (shouldLoadSubCategories) {
        console.log('🔄 Category changed or initial load, loading subcategories for:', watchedCategoryId)
        loadSubCategories(watchedCategoryId)
      }
    } else {
      setSubCategories([])
      setSubSubCategories([])
    }
  }, [watchedCategoryId])

  // Load sub-subcategories when subcategory changes
  useEffect(() => {
    if (watchedSubCategoryId) {
      // Only load sub-subcategories if not already loaded or if subcategory actually changed
      const shouldLoadSubSubCategories = !editMode || 
        subSubCategories.length === 0 || 
        !subSubCategories.some(ssc => ssc.subCategoryId === watchedSubCategoryId)
      
      if (shouldLoadSubSubCategories) {
        console.log('🔄 Subcategory changed or initial load, loading sub-subcategories for:', watchedSubCategoryId)
        loadSubSubCategories(watchedSubCategoryId)
      }
    } else {
      setSubSubCategories([])
    }
  }, [watchedSubCategoryId])

  // =====================================
  // API OPERATIONS
  // =====================================

  const loadCategories = async () => {
    try{
        setLoadingCategories(true);
      
      const response = await categoriesService.getCategories({
        search: '',
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      });
      console.log('✅ Categories loaded:', response.categories.length);
      //console.log('✅ Categories loaded:', response.data.length);
      setCategories(response.categories);

      //setCategories(response.data);

      // Reset subcategories when categories change
      setSubCategories([])
      setSubSubCategories([])
    }
    catch(error){
      console.error('💥 Error loading categories:', error);
      toast.error("Error Loading Categories", {
        description: "Failed to load categories. Please try again.",
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([])
      setSubSubCategories([])
      return
    }

    try {
      setLoadingSubCategories(true)
      console.log('🔄 Loading subcategories for category:', categoryId)
      
      const response = await categoriesService.getSubCategories(categoryId)
      
      console.log('✅ Subcategories loaded:', response.length, 'subcategories')
      const processedSubCategories = response.map((cat: SubCategory) => ({
        ...cat,
        categoryId: categoryId
      }))
      
      setSubCategories(processedSubCategories)
      
      // Only reset sub-subcategories if not in edit mode or if category actually changed
      if (!editMode || !editProduct) {
        setSubSubCategories([])
      }
      
      console.log('📋 Processed subcategories:', processedSubCategories.map(sc => ({
        id: sc.subCategoryId || sc.id,
        name: sc.name
      })))
      
    } catch (error) {
      console.error('💥 Error loading subcategories for category', categoryId, ':', error)
      setSubCategories([])
      toast.error("Error Loading Subcategories", {
        description: "Failed to load subcategories. Please try again.",
      })
    } finally {
      setLoadingSubCategories(false)
    }
  }

  const loadSubSubCategories = async (subCategoryId: string) => {
    if (!subCategoryId) {
      setSubSubCategories([])
      return
    }

    try {
      setLoadingSubSubCategories(true)
      console.log('🔄 Loading sub-subcategories for subcategory:', subCategoryId)
      
      const response = await categoriesService.getSubSubCategories(subCategoryId)
      
      console.log('✅ Sub-subcategories loaded:', response.length, 'sub-subcategories')
      const processedSubSubCategories = response.map((cat: SubSubCategory) => ({
        ...cat,
        subCategoryId: subCategoryId
      }))
      
      setSubSubCategories(processedSubSubCategories)
      
      console.log('📋 Processed sub-subcategories:', processedSubSubCategories.map(ssc => ({
        id: ssc.subSubCategoryId || ssc.id,
        name: ssc.name
      })))
      
    } catch (error) {
      console.error('💥 Error loading sub-subcategories for subcategory', subCategoryId, ':', error)
      setSubSubCategories([])
      toast.error("Error Loading Sub-subcategories", {
        description: "Failed to load sub-subcategories. Please try again.",
      })
    } finally {
      setLoadingSubSubCategories(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }))
      
      // Limit to 4 images total
      setImages((prev) => {
        const combined = [...prev, ...newImages]
        return combined.slice(0, 4)
      })
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      // Cleanup object URL
      const removed = prev.find(img => img.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return filtered
    })
  }

  const handleSubmit = async (data: LocalProductFormData) => {
    console.log('🚀 Form submitted with data:', data)
    console.log('🔍 Form validation state at submission:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      errorCount: Object.keys(form.formState.errors).length
    })
    
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Enhanced validation with detailed error messages
      const validationErrors: string[] = []

      if (images.length === 0) {
        validationErrors.push("At least one product image is required")
      }

      if (!data.categoryId) {
        validationErrors.push("Main category selection is required")
      }

      if (data.price <= 0) {
        validationErrors.push("Product price must be greater than 0")
      }

      if (data.stockQuantity < 0) {
        validationErrors.push("Stock quantity cannot be negative")
      }

      // Validate image files (skip validation for existing images)
      for (const image of images) {
        if (!image.isExisting && image.file) {
          const validation = productsService.validateImage(image.file)
          if (!validation.valid) {
            validationErrors.push(validation.error || "Invalid image file")
          }
        }
      }

      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(". "))
        return
      }

      // Get category details for enhanced payload
      const selectedCategory = categories.find(c => (c.categoryId || c.id) === data.categoryId)
      const selectedSubCategory = data.subCategoryId ? subCategories.find(sc => (sc.subCategoryId || sc.id) === data.subCategoryId) : null
      const selectedSubSubCategory = data.subSubCategoryId ? subSubCategories.find(ssc => (ssc.subSubCategoryId || ssc.id) === data.subSubCategoryId) : null

      // Create enhanced product payload with category hierarchy
      const enhancedProductPayload = {
        // Basic Product Information
        productInfo: {
          productName: data.productName.trim(),
          description: data.description.trim(),
          productDescription: data.productDescription.trim(),
          productType: data.productType?.trim() || "physical",
          keyFeatures: data.features.split(",").map((f: string) => f.trim()).filter((f: string) => f.length > 0),
          specification: data.productSpecification.trim(),
          boxContents: data.boxContents.trim(),
          searchKeywords: data.searchKeywords.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0),
        },

        // Pricing and Inventory
        pricingInfo: {
          price: Number(data.price),
          discount: Number(data.discount || 0),
          finalPrice: Number(data.price) * (1 - (Number(data.discount || 0) / 100)),
          stockQuantity: Number(data.stockQuantity),
          inStock: data.stockQuantity > 0, // Calculate based on stock quantity
          lowStockThreshold: Math.max(5, Math.floor(data.stockQuantity * 0.1)), // 10% of stock or minimum 5
        },

        // Enhanced Category Information with full hierarchy
        categoryInfo: {
          primary: {
            id: data.categoryId,
            name: selectedCategory?.name || "",
            slug: selectedCategory?.slug || "",
          },
          secondary: selectedSubCategory ? {
            id: data.subCategoryId!,
            name: selectedSubCategory.name,
            slug: selectedSubCategory.slug,
            parentId: data.categoryId,
          } : null,
          tertiary: selectedSubSubCategory ? {
            id: data.subSubCategoryId!,
            name: selectedSubSubCategory.name,
            slug: selectedSubSubCategory.slug,
            parentId: data.subCategoryId!,
          } : null,
          categoryPath: [
            selectedCategory?.name,
            selectedSubCategory?.name,
            selectedSubSubCategory?.name
          ].filter(Boolean).join(" > "),
          categoryIds: [
            data.categoryId,
            data.subCategoryId,
            data.subSubCategoryId
          ].filter(Boolean),
        },

        // System Information
        systemInfo: {
          createdOn: new Date().toISOString(),
          createdBy: "current-user", // TODO: Get from auth context
          status: "pending", // Default status for new products
          isActive: true,
          isFeatured: false,
          imageType: "product",
          version: "1.0",
        },

        // Additional metadata
        metadata: {
          totalImages: images.length,
          primaryImageId: images[0]?.id || null,
          categoryLevel: selectedSubSubCategory ? 3 : selectedSubCategory ? 2 : 1,
          hasDiscount: (data.discount || 0) > 0,
          isPhysicalProduct: data.productType !== "digital",
          estimatedShippingWeight: null, // Can be enhanced later
          tags: data.searchKeywords.split(",").map((k: string) => k.trim().toLowerCase()).filter((k: string) => k.length > 0),
        }
      }

      // Prepare product images with enhanced metadata (only for new images)
      const productImages: ProductImageUpload[] = images
        .filter(image => !image.isExisting && image.file) // Only new images with files
        .map((image, index) => ({
          id: image.id,
          file: image.file!,
          preview: image.preview,
          alt: `${data.productName} - Image ${index + 1}`,
          isPrimary: index === 0,
          order: index,
          caption: `${data.productName} view ${index + 1}`,
          size: image.file!.size,
          type: image.file!.type,
        }))

      // For edit mode, collect existing image URLs
      const existingImageUrls = editMode ? images
        .filter(image => image.isExisting)
        .map(image => image.preview) : []

      // Create ProductDto payload that matches backend CreateProductDto
      const createProductDto = {
        // Required fields from CreateProductDto
        productName: data.productName.trim(),
        description: data.description.trim(),
        productDescription: data.productDescription.trim(),
        price: Number(data.price),
        discount: Number(data.discount || 0),
        stockQuantity: Number(data.stockQuantity),
        sku: data.sku?.trim() || "",
        
        // Category Information (as Guid strings)
        categoryId: data.categoryId,
        categoryName: selectedCategory?.name || "",
        subCategoryId: data.subCategoryId || null,
        subCategoryName: selectedSubCategory?.name || null,
        subSubCategoryId: data.subSubCategoryId || null,
        subSubCategoryName: selectedSubSubCategory?.name || null,
        
        // Product Details with AI extraction support
        productSpecification: formatProductSpecification(data.productSpecification.trim()),
        features: formatProductFeatures(data.features.trim()),
        boxContents: data.boxContents.trim(),
        productType: data.productType || "physical",
        
        // Status & Features
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        status: data.status,
        
        // Images (existing + new)
        imageUrls: editMode ? [...existingImageUrls, ...productImages.map(img => img.preview)] : images.map(img => img.preview),
        
        // Required Merchant ID (will be set from JWT token in productsService)
        merchantID: data.merchantID || "" // Backend will get from _currentUserService.MerchantId
      }

      // Legacy ProductFormData for backward compatibility (if needed)
      const legacyProductData: ProductFormData = {
        productName: data.productName,
        description: data.description,
        productDescription: data.productDescription,
        price: data.price,
        stockQuantity: data.stockQuantity,
        categoryId: 1, // Use a default integer for legacy API (backend should handle GUIDs)
        categoryName: selectedCategory?.name || "",
        subCategoryId: data.subCategoryId ? 2 : undefined, // Use default integers
        subCategoryName: selectedSubCategory?.name || "",
        subSubCategoryId: data.subSubCategoryId ? 3 : undefined, // Use default integers
        subSubCategoryName: selectedSubSubCategory?.name || "",
        productType: data.productType,
        keyFeatures: data.features, // Map to legacy field name
        specification: data.productSpecification, // Map to legacy field name
        box: data.boxContents, // Map to legacy field name
        searchKeyWord: data.searchKeywords, // Map to legacy field name
        discount: data.discount,
        inStock: data.stockQuantity > 0, // Calculate based on stock
        imageType: "product", // Default value
        isSaved: false // Default value
      }

      console.log('📝 Enhanced Product Payload (CreateProductDto):', createProductDto)
      console.log('🔄 Legacy Product Data:', legacyProductData)
      console.log('🖼️ Product Images:', productImages)

      let response
      
      if (editMode && editProduct) {
        // Update existing product - use same structure as createProductDto
        // The updateProduct method expects CreateProductDto format with GUIDs
        
        const productId = editProduct.productId || editProduct.id
        if (!productId) {
          throw new Error('Product ID is missing for update operation')
        }
        
        // Pass the createProductDto directly since updateProduct expects CreateProductDto format
        console.log('🔍 Update: CategoryId being sent:', createProductDto.categoryId)
        console.log('📦 Update: Full DTO being sent:', createProductDto)
        response = await productsService.updateProduct(productId, createProductDto)
        console.log('✅ Product updated successfully:', response)
        
        toast.success("🎉 Product Updated Successfully!", {
          description: `${data.productName} has been updated`,
        })
      } else {
        // Create new product
        response = await productsService.createProduct(createProductDto, productImages)
        console.log('✅ Product created successfully:', response)
        
        // Enhanced success feedback with category information
        const categoryPath = [
          createProductDto.categoryName,
          createProductDto.subCategoryName,
          createProductDto.subSubCategoryName
        ].filter(Boolean).join(' > ')
        
        toast.success("🎉 Product Created Successfully!", {
          description: `${data.productName} has been added to ${categoryPath || 'Products'}`,
        })
      }

      // Reset form and close modal
      form.reset()
      setImages([])
      setCategories([])
      setSubCategories([])
      setSubSubCategories([])
      setActiveTab("basic")
      
      if (editMode && onClose) {
        onClose()
      } else {
        setOpen(false)
      }
      
      // Cleanup object URLs
      images.forEach(img => URL.revokeObjectURL(img.preview))
      
      // Pass enhanced payload to parent component
      onProductAdded?.({
        ...data,
        enhancedPayload: enhancedProductPayload,
        categoryPath: enhancedProductPayload.categoryInfo.categoryPath,
        finalPrice: enhancedProductPayload.pricingInfo.finalPrice,
      })
      
    } catch (error) {
      console.error('💥 Error adding product:', error)
      
      let errorMessage = 'Failed to add product'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Add more specific error messages
      if (errorMessage.includes('fetch')) {
        errorMessage += ' - Check if the API server is running and NEXT_PUBLIC_API_URL is set correctly'
      }
      
      console.error('💥 Full error details:', {
        error,
        errorMessage,
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'not set',
        formData: data
      })
      
      setSubmitError(errorMessage)
      
      // Enhanced error feedback
      toast.error("❌ Failed to Create Product", {
        description: `${errorMessage}. Please check console for details.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => (c.categoryId || c.id) === categoryId)
    
    console.log('🏷️ Category selected:', category?.name)
    
    // Update form values
    form.setValue("categoryId", categoryId)
    form.setValue("categoryName", category?.name || "")
    
    // Clear dependent fields
    form.setValue("subCategoryId", "")
    form.setValue("subCategoryName", "")
    form.setValue("subSubCategoryId", "")
    form.setValue("subSubCategoryName", "")
    
    // Clear dependent arrays to trigger re-loading
    setSubCategories([])
    setSubSubCategories([])
    
    // Show category selected feedback
    toast.success("🏷️ Category Selected", {
      description: `✅ Selected: ${category?.name}`,
    })
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    const subCategory = subCategories.find(sc => (sc.subCategoryId || sc.id) === subCategoryId)
    
    console.log('🏷️ Subcategory selected:', subCategory?.name)
    
    // Update form values
    form.setValue("subCategoryId", subCategoryId)
    form.setValue("subCategoryName", subCategory?.name || "")
    
    // Clear dependent fields
    form.setValue("subSubCategoryId", "")
    form.setValue("subSubCategoryName", "")
    
    // Clear dependent array
    setSubSubCategories([])
    
    // Show subcategory selected feedback
    toast.success("📂 Subcategory Selected", {
      description: `✅ Selected: ${subCategory?.name}`,
    })
  }

  const handleSubSubCategoryChange = (subSubCategoryId: string) => {
    const subSubCategory = subSubCategories.find(ssc => (ssc.subSubCategoryId || ssc.id) === subSubCategoryId)
    
    console.log('🏷️ Sub-subcategory selected:', subSubCategory?.name)
    
    // Update form values
    form.setValue("subSubCategoryId", subSubCategoryId)
    form.setValue("subSubCategoryName", subSubCategory?.name || "")
    
    // Show sub-subcategory selected feedback
    toast.success("📁 Sub-subcategory Selected", {
      description: `✅ Selected: ${subSubCategory?.name}`,
    })
  }

  const filteredSubCategories = subCategories.filter(
    sc => sc.categoryId === watchedCategoryId
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogLargeContent>
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Package className="h-6 w-6 text-blue-600" />
              {editMode ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {editMode 
                ? "Update the product information. Changes will be saved when you submit the form."
                : "Create a comprehensive product listing with detailed information. All required fields must be completed for approval."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
                <div className="flex-1 overflow-auto px-6 py-4">
                  {submitError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                    <div className="border-b bg-gray-50/50 -mx-6 px-6 py-3">
                      <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1 bg-white shadow-sm">
                        <TabsTrigger value="basic" className="flex items-center gap-2 py-2.5 text-sm font-medium">
                          <Package className="h-4 w-4" />
                          <span className="hidden sm:inline">Basic Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex items-center gap-2 py-2.5 text-sm font-medium">
                          <Tag className="h-4 w-4" />
                          <span className="hidden sm:inline">Categories</span>
                        </TabsTrigger>
                        <TabsTrigger value="details" className="flex items-center gap-2 py-2.5 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2 py-2.5 text-sm font-medium">
                          <ImageIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Images ({images.length}/4)</span>
                          <span className="sm:hidden">({images.length}/4)</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6 mt-0">
                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Basic Information
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Enter the essential details about your product
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                        <div className="grid gap-6 lg:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">Product Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter product name" 
                                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="productType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">Product Type</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Physical, Digital, Service" 
                                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">Short Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief product description for listings..."
                                className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              This will appear in product listings and search results (max 500 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detailed Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Comprehensive product description with all details..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Detailed description for the product page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">Price ($) *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    className="h-11 pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="discount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">Discount (%)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="0.0"
                                    className="h-11 pr-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="stockQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">Stock Quantity *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  placeholder="0"
                                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active Product</FormLabel>
                              <FormDescription>
                                Check if this product is active and available for purchase
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                    {/* Categories Tab */}
                    <TabsContent value="categories" className="space-y-6 mt-0">
                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-blue-600" />
                            Category Classification
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Organize your product in the right categories for better discoverability
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                      {/* Category Selection Progress */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${watchedCategoryId ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm font-medium">Main Category</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${watchedSubCategoryId ? 'bg-green-500' : watchedCategoryId && filteredSubCategories.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            <span className="text-sm font-medium">Subcategory</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${form.watch("subSubCategoryId") ? 'bg-green-500' : watchedSubCategoryId && subSubCategories.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            <span className="text-sm font-medium">Sub-subcategory</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Step {watchedCategoryId ? (watchedSubCategoryId ? (form.watch("subSubCategoryId") ? 3 : 2) : 1) : 0} of 3
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Main Category *
                                {loadingCategories && <Loader2 className="h-3 w-3 animate-spin" />}
                              </FormLabel>
                              <Select
                                onValueChange={(value) => handleCategoryChange(value)}
                                disabled={loadingCategories}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      loadingCategories 
                                        ? "Loading categories..." 
                                        : field.value 
                                          ? categories.find(c => (c.categoryId || c.id) === field.value)?.name || "Select category"
                                          : "Select category"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.categoryId || category.id} value={category.categoryId || category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* Show selected category */}
                              {field.value && (
                                <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span>Selected: {categories.find(c => (c.categoryId || c.id) === field.value)?.name}</span>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Subcategory
                                {loadingSubCategories && <Loader2 className="h-3 w-3 animate-spin" />}
                              </FormLabel>
                              <Select
                                onValueChange={(value) => handleSubCategoryChange(value)}
                                disabled={!watchedCategoryId || loadingSubCategories || filteredSubCategories.length === 0}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      !watchedCategoryId 
                                        ? "Select category first"
                                        : loadingSubCategories 
                                          ? "Loading subcategories..." 
                                          : filteredSubCategories.length === 0
                                            ? "No subcategories available"
                                            : field.value
                                              ? filteredSubCategories.find(sc => sc.subCategoryId === field.value)?.name || "Select subcategory"
                                              : "Select subcategory"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredSubCategories.map((subCategory) => (
                                    <SelectItem key={subCategory.subCategoryId || subCategory.id} value={subCategory.subCategoryId || subCategory.id}>
                                      {subCategory.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* Show selected subcategory */}
                              {field.value && filteredSubCategories.length > 0 && (
                                <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span>Selected: {filteredSubCategories.find(sc => sc.subCategoryId === field.value)?.name}</span>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subSubCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Sub-Subcategory
                                {loadingSubSubCategories && <Loader2 className="h-3 w-3 animate-spin" />}
                              </FormLabel>
                              <Select
                                onValueChange={(value) => handleSubSubCategoryChange(value)}
                                disabled={!watchedSubCategoryId || loadingSubSubCategories || subSubCategories.length === 0}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      !watchedSubCategoryId 
                                        ? "Select subcategory first"
                                        : loadingSubSubCategories 
                                          ? "Loading sub-subcategories..." 
                                          : subSubCategories.length === 0
                                            ? "No sub-subcategories available"
                                            : field.value
                                              ? subSubCategories.find(ssc => (ssc.subSubCategoryId || ssc.id) === field.value)?.name || "Select sub-subcategory"
                                              : "Select sub-subcategory"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subSubCategories.map((subSubCategory) => (
                                    <SelectItem key={subSubCategory.subSubCategoryId || subSubCategory.id} value={subSubCategory.subSubCategoryId || subSubCategory.id}>
                                      {subSubCategory.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* Show selected sub-subcategory */}
                              {field.value && subSubCategories.length > 0 && (
                                <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span>Selected: {subSubCategories.find(ssc => (ssc.subSubCategoryId || ssc.id) === field.value)?.name}</span>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Category Hierarchy Display */}
                      {watchedCategoryId && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-blue-900">Category Hierarchy</h4>
                          </div>
                          
                          {/* Breadcrumb Style Category Path */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 rounded-md">
                              <span className="text-xs font-medium text-blue-800">
                                {categories.find(c => (c.categoryId || c.id) === watchedCategoryId)?.name}
                              </span>
                            </div>
                            
                            {watchedSubCategoryId && (
                              <>
                                <span className="text-blue-400">→</span>
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 rounded-md">
                                  <span className="text-xs font-medium text-indigo-800">
                                    {subCategories.find(sc => (sc.subCategoryId || sc.id) === watchedSubCategoryId)?.name}
                                  </span>
                                </div>
                              </>
                            )}
                            
                            {form.watch("subSubCategoryId") && (
                              <>
                                <span className="text-blue-400">→</span>
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 rounded-md">
                                  <span className="text-xs font-medium text-purple-800">
                                    {subSubCategories.find(ssc => ssc.id === form.watch("subSubCategoryId"))?.name}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Category Path Info */}
                          <div className="mt-3 text-xs text-blue-600">
                            <span className="font-medium">Category Path:</span> {' '}
                            <span>
                              {categories.find(c => (c.categoryId || c.id) === watchedCategoryId)?.name}
                              {watchedSubCategoryId && ` > ${subCategories.find(sc => (sc.subCategoryId || sc.id) === watchedSubCategoryId)?.name}`}
                              {form.watch("subSubCategoryId") && ` > ${subSubCategories.find(ssc => ssc.id === form.watch("subSubCategoryId"))?.name}`}
                            </span>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="searchKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Search Keywords *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add relevant keywords separated by commas (e.g., smartphone, mobile, android, phone)"
                                className="min-h-[80px]"
                                {...field}
                                value={field.value as string}
                              />
                            </FormControl>
                            <FormDescription>
                              These keywords help customers find your product. Include brand names, colors, materials, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6 mt-0">
                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Product Details
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Provide comprehensive information about your product features and specifications
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                      <FormField
                        control={form.control}
                        name="features"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Features *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="• Feature 1&#10;• Feature 2&#10;• Feature 3"
                                className="min-h-[120px]"
                                {...field}
                                value={field.value as string}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const textarea = e.target as HTMLTextAreaElement;
                                    const cursorPos = textarea.selectionStart;
                                    const textBefore = textarea.value.substring(0, cursorPos);
                                    const textAfter = textarea.value.substring(cursorPos);
                                    
                                    // Add new line with bullet point
                                    const newValue = textBefore + '\n• ' + textAfter;
                                    field.onChange(newValue);
                                    
                                    // Set cursor position after the bullet
                                    setTimeout(() => {
                                      textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
                                      textarea.focus();
                                    }, 0);
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pasteData = e.clipboardData?.getData('text') || '';
                                  
                                  if (pasteData.trim()) {
                                    // Split pasted text into lines and format as bullets
                                    const lines = pasteData
                                      .split('\n')
                                      .map(line => line.trim())
                                      .filter(line => line.length > 0)
                                      .map(line => {
                                        // Remove existing bullets/numbers/dashes
                                        const cleaned = line.replace(/^[•\-\*\+\d+\.\)\]]\s*/, '').trim();
                                        return cleaned ? `• ${cleaned}` : '';
                                      })
                                      .filter(line => line.length > 0);
                                    
                                    const formattedText = lines.join('\n');
                                    
                                    // If there's existing content, append with newline
                                    const currentValue = field.value as string || '';
                                    const finalValue = currentValue.trim() 
                                      ? `${currentValue}\n${formattedText}` 
                                      : formattedText;
                                    
                                    field.onChange(finalValue);
                                    
                                    toast.success(`Organized ${lines.length} feature${lines.length !== 1 ? 's' : ''} into bullet points!`);
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  
                                  // Auto-add bullet to first line if it doesn't start with one and isn't empty
                                  if (value.trim() && !value.startsWith('•') && !value.startsWith('-') && !value.startsWith('*')) {
                                    // Only auto-add bullet if it's a single line starting fresh
                                    const lines = value.split('\n');
                                    if (lines.length === 1 && !value.includes('\n')) {
                                      field.onChange(`• ${value}`);
                                      return;
                                    }
                                  }
                                  
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormDescription className="flex items-center justify-between">
                              <span>List the main selling points and features of your product. Press Enter for new bullets.</span>
                              {(() => {
                                try {
                                  const parsed = JSON.parse(field.value as string || '{}');
                                  if (parsed._format === "structured") {
                                    return (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        AI Structured
                                      </span>
                                    );
                                  }
                                } catch {}
                                return null;
                              })()}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productSpecification"
                        render={({ field }) => {
                          // Parse current specifications into key-value pairs
                          const parseSpecs = (value: string): Array<{key: string, value: string, id: string}> => {
                            if (!value) return [{key: '', value: '', id: '1'}];
                            
                            try {
                              // Try parsing as structured JSON first
                              const parsed = JSON.parse(value);
                              if (parsed._format === "structured" && parsed.ProductSpecifications) {
                                return Object.entries(parsed.ProductSpecifications).map(([key, val], index) => ({
                                  key,
                                  value: val as string,
                                  id: (index + 1).toString()
                                }));
                              }
                            } catch {}
                            
                            // Parse as text format (Key: Value lines)
                            const lines = value.split('\n').filter(line => line.trim());
                            const specs = lines.map((line, index) => {
                              const colonIndex = line.indexOf(':');
                              if (colonIndex > 0) {
                                return {
                                  key: line.substring(0, colonIndex).trim(),
                                  value: line.substring(colonIndex + 1).trim(),
                                  id: (index + 1).toString()
                                };
                              }
                              return { key: '', value: line.trim(), id: (index + 1).toString() };
                            });
                            
                            return specs.length > 0 ? specs : [{key: '', value: '', id: '1'}];
                          };
                          
                          // Convert specs back to text format for the form field
                          const specsToText = (specs: Array<{key: string, value: string}>) => {
                            return specs
                              .filter(spec => spec.key.trim() || spec.value.trim())
                              .map(spec => spec.key.trim() ? `${spec.key}: ${spec.value}` : spec.value)
                              .join('\n');
                          };
                          
                          const [specs, setSpecs] = useState(() => parseSpecs(field.value as string || ''));
                          const [inputMode, setInputMode] = useState<'pairs' | 'text'>('pairs');
                          
                          // Update form field when specs change
                          useEffect(() => {
                            const textValue = specsToText(specs);
                            if (textValue !== field.value) {
                              field.onChange(textValue);
                            }
                          }, [specs, field]);
                          
                          const addSpecPair = () => {
                            const newId = (specs.length + 1).toString();
                            setSpecs([...specs, { key: '', value: '', id: newId }]);
                          };
                          
                          const removeSpecPair = (id: string) => {
                            if (specs.length > 1) {
                              setSpecs(specs.filter(spec => spec.id !== id));
                            }
                          };
                          
                          const updateSpec = (id: string, key: string, value: string) => {
                            setSpecs(specs.map(spec => 
                              spec.id === id ? { ...spec, key, value } : spec
                            ));
                          };
                          
                          return (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Technical Specifications *</FormLabel>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInputMode(inputMode === 'pairs' ? 'text' : 'pairs')}
                                    className="text-xs"
                                  >
                                    {inputMode === 'pairs' ? 'Switch to Text' : 'Switch to Pairs'}
                                  </Button>
                                </div>
                              </div>
                              
                              <FormControl>
                                {inputMode === 'pairs' ? (
                                  <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/30">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">
                                        Specification Key-Value Pairs
                                      </span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSpecPair}
                                        className="text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Spec
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {specs.map((spec, index) => (
                                        <div key={spec.id} className="flex gap-2 items-center">
                                          <Input
                                            placeholder="Property (e.g., Weight, Dimensions)"
                                            value={spec.key}
                                            onChange={(e) => updateSpec(spec.id, e.target.value, spec.value)}
                                            className="flex-1 h-9 text-sm"
                                          />
                                          <span className="text-gray-500">:</span>
                                          <Input
                                            placeholder="Value (e.g., 200g, 15cm x 10cm)"
                                            value={spec.value}
                                            onChange={(e) => updateSpec(spec.id, spec.key, e.target.value)}
                                            className="flex-1 h-9 text-sm"
                                          />
                                          {specs.length > 1 && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeSpecPair(spec.id)}
                                              className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {specs.length === 0 && (
                                      <div className="text-center py-4 text-gray-500 text-sm">
                                        No specifications added. Click "Add Spec" to get started.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Textarea 
                                    placeholder="Dimensions: 15cm x 10cm x 5cm&#10;Weight: 200g&#10;Material: Aluminum&#10;Color: Space Gray"
                                    className="min-h-[120px]"
                                    value={field.value as string}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      setSpecs(parseSpecs(e.target.value));
                                    }}
                                    onPaste={(e) => {
                                      // Auto-format pasted specifications
                                      const pasteData = e.clipboardData?.getData('text') || '';
                                      if (pasteData.trim()) {
                                        const lines = pasteData.split('\n')
                                          .map(line => line.trim())
                                          .filter(line => line.length > 0)
                                          .map(line => {
                                            // If line doesn't contain colon, try to format it
                                            if (!line.includes(':') && line.includes(' ')) {
                                              const words = line.split(' ');
                                              if (words.length >= 2) {
                                                const key = words[0];
                                                const value = words.slice(1).join(' ');
                                                return `${key}: ${value}`;
                                              }
                                            }
                                            return line;
                                          })
                                          .join('\n');
                                        
                                        setTimeout(() => {
                                          setSpecs(parseSpecs(lines));
                                          toast.success('Specifications formatted automatically!');
                                        }, 100);
                                      }
                                    }}
                                  />
                                )}
                              </FormControl>
                              
                              <FormDescription className="flex items-center justify-between">
                                <span>
                                  {inputMode === 'pairs' 
                                    ? 'Add key-value pairs for technical specifications' 
                                    : 'Detailed technical specifications and measurements (Key: Value format)'
                                  }
                                </span>
                                {(() => {
                                  try {
                                    const parsed = JSON.parse(field.value as string || '{}');
                                    if (parsed._format === "structured") {
                                      return (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                          <Sparkles className="h-3 w-3" />
                                          AI Structured
                                        </span>
                                      );
                                    }
                                  } catch {}
                                  
                                  // Show count for pairs mode
                                  if (inputMode === 'pairs') {
                                    const validSpecs = specs.filter(spec => spec.key.trim() || spec.value.trim());
                                    return validSpecs.length > 0 ? (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {validSpecs.length} spec{validSpecs.length !== 1 ? 's' : ''}
                                      </span>
                                    ) : null;
                                  }
                                  
                                  return null;
                                })()}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* AI Text Extraction Utility */}
                      {/* <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-purple-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            AI Text Extraction
                          </CardTitle>
                          <CardDescription className="text-purple-700">
                            Paste product description text and let AI extract structured specifications and features
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-purple-900 mb-2 block">
                              Raw Product Text
                            </label>
                            <Textarea
                              placeholder="Paste your product description text here...&#10;&#10;Example:&#10;Brand: Apple&#10;Model: iPhone 15 Pro&#10;Storage: 256GB&#10;Display: 6.1-inch Super Retina XDR&#10;• Advanced camera system&#10;• All-day battery life&#10;• Water resistant up to 6 meters"
                              className="min-h-[100px] border-purple-200 focus:border-purple-400"
                              value={rawText}
                              onChange={(e) => setRawText(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => {
                                if (!rawText.trim()) {
                                  toast.error("Please paste some product text to extract information from.");
                                  return;
                                }
                                
                                const extracted = extractProductInfo(rawText);
                                
                                // Option 1: Fill with formatted text (current approach)
                                const specsText = Object.entries(extracted.ProductSpecifications)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join('\n');
                                
                                const featuresText = extracted.ProductFeatures
                                  .map(feature => `• ${feature}`)
                                  .join('\n');
                                
                                // Set form values with formatted text
                                if (specsText) {
                                  form.setValue('productSpecification', specsText);
                                }
                                if (featuresText) {
                                  form.setValue('features', featuresText);
                                }
                                
                                toast.success(`AI Extraction Complete! Extracted ${Object.keys(extracted.ProductSpecifications).length} specifications and ${extracted.ProductFeatures.length} features.`);
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              disabled={!rawText.trim()}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              Extract & Fill
                            </Button>
                            
                            <Button
                              type="button"
                              onClick={() => {
                                if (!rawText.trim()) {
                                  toast.error("Please paste some product text to extract information from.");
                                  return;
                                }
                                
                                const extracted = extractProductInfo(rawText);
                                
                                // Option 2: Fill with structured JSON (for advanced backend processing)
                                const structuredSpecs = JSON.stringify({
                                  ProductSpecifications: extracted.ProductSpecifications,
                                  _format: "structured" // Metadata for backend detection
                                });
                                
                                const structuredFeatures = JSON.stringify({
                                  ProductFeatures: extracted.ProductFeatures,
                                  _format: "structured" // Metadata for backend detection  
                                });
                                
                                // Set form values with structured JSON
                                if (Object.keys(extracted.ProductSpecifications).length > 0) {
                                  form.setValue('productSpecification', structuredSpecs);
                                }
                                if (extracted.ProductFeatures.length > 0) {
                                  form.setValue('features', structuredFeatures);
                                }
                                
                                toast.success(`Structured data filled! ${Object.keys(extracted.ProductSpecifications).length} specs + ${extracted.ProductFeatures.length} features as JSON.`);
                              }}
                              variant="outline"
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              disabled={!rawText.trim()}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              Fill as JSON
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (!rawText.trim()) return;
                                
                                const extracted = extractProductInfo(rawText);
                                const result = {
                                  ProductSpecifications: extracted.ProductSpecifications,
                                  ProductFeatures: extracted.ProductFeatures
                                };
                                
                                // Copy to clipboard
                                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                                toast.success("JSON copied to clipboard! Structured data is ready to use.");
                              }}
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              disabled={!rawText.trim()}
                            >
                              Copy JSON
                            </Button>
                          </div>
                          
                          <div className="text-xs text-purple-600 space-y-1">
                            <p><strong>How it works:</strong></p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              <li>Identifies specifications from "Key: Value" patterns</li>
                              <li>Extracts features from bullet points and descriptive text</li>
                              <li>Automatically fills the form fields above</li>
                              <li>Outputs structured JSON for external use</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card> */}

                      <FormField
                        control={form.control}
                        name="boxContents"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What's in the Box *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="• 1x Product&#10;• 1x User Manual&#10;• 1x USB Cable&#10;• 1x Warranty Card"
                                className="min-h-[100px]"
                                {...field}
                                value={field.value as string}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const textarea = e.target as HTMLTextAreaElement;
                                    const cursorPos = textarea.selectionStart;
                                    const textBefore = textarea.value.substring(0, cursorPos);
                                    const textAfter = textarea.value.substring(cursorPos);
                                    
                                    // Add new line with bullet point
                                    const newValue = textBefore + '\n• ' + textAfter;
                                    field.onChange(newValue);
                                    
                                    // Set cursor position after the bullet
                                    setTimeout(() => {
                                      textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
                                      textarea.focus();
                                    }, 0);
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pasteData = e.clipboardData?.getData('text') || '';
                                  
                                  if (pasteData.trim()) {
                                    // Split pasted text into lines and format as bullets
                                    const lines = pasteData
                                      .split('\n')
                                      .map(line => line.trim())
                                      .filter(line => line.length > 0)
                                      .map(line => {
                                        // Remove existing bullets/numbers/dashes and clean formatting
                                        const cleaned = line
                                          .replace(/^[•\-\*\+\d+\.\)\]]\s*/, '') // Remove list markers
                                          .replace(/^\d+x?\s+/i, '') // Remove quantity prefixes like "1x" or "2 "
                                          .trim();
                                        
                                        // Add quantity prefix if it looks like an item without one
                                        if (cleaned && !cleaned.match(/^\d+x?\s/i)) {
                                          return `• 1x ${cleaned}`;
                                        }
                                        return cleaned ? `• ${cleaned}` : '';
                                      })
                                      .filter(line => line.length > 0);
                                    
                                    const formattedText = lines.join('\n');
                                    
                                    // If there's existing content, append with newline
                                    const currentValue = field.value as string || '';
                                    const finalValue = currentValue.trim() 
                                      ? `${currentValue}\n${formattedText}` 
                                      : formattedText;
                                    
                                    field.onChange(finalValue);
                                    
                                    toast.success(`Organized ${lines.length} item${lines.length !== 1 ? 's' : ''} into box contents!`);
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  
                                  // Auto-add bullet to first line if it doesn't start with one and isn't empty
                                  if (value.trim() && !value.startsWith('•') && !value.startsWith('-') && !value.startsWith('*')) {
                                    // Only auto-add bullet if it's a single line starting fresh
                                    const lines = value.split('\n');
                                    if (lines.length === 1 && !value.includes('\n')) {
                                      // Smart quantity detection - add "1x " if it doesn't start with a number
                                      const smartValue = value.match(/^\d+x?\s/i) ? value : `1x ${value}`;
                                      field.onChange(`• ${smartValue}`);
                                      return;
                                    }
                                  }
                                  
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              List all items included in the product package. Press Enter for new items.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images" className="space-y-6 mt-0">
                      <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                            Product Images
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Upload up to 4 high-quality images. The first image will be used as the main product image.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                      {images.length < 4 && (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-blue-500 transition-colors">
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="mt-4">
                              <Label htmlFor="images" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-foreground hover:text-blue-500 transition-colors">
                                  Upload product images
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  PNG, JPG, WEBP up to 10MB each. {4 - images.length} more images allowed.
                                </span>
                              </Label>
                              <Input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {images.length > 0 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                              <div key={image.id} className="relative group">
                                <div className="relative aspect-square">
                                  <img
                                    src={image.preview}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-border group-hover:scale-105 transition-transform"
                                  />
                                  {index === 0 && (
                                    <Badge className="absolute top-2 left-2 bg-blue-600">
                                      Main
                                    </Badge>
                                  )}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(image.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {image.file ? image.file.name : `Image ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {image.file ? `${(image.file.size / 1024 / 1024).toFixed(1)} MB` : (image.isExisting ? 'Existing' : 'Unknown')}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {images.length > 0 && (
                            <Alert>
                              <Check className="h-4 w-4" />
                              <AlertDescription>
                                {images.length} image{images.length !== 1 ? 's' : ''} ready for upload. 
                                The first image will be used as the main product image.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="border-t bg-gray-50/30 px-6 py-4 flex gap-3 mt-auto">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)} 
                    className="flex-1 font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium shadow-md" 
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log('🔍 Form submit button clicked!')
                      console.log('📝 Form state:', {
                        isValid: form.formState.isValid,
                        errors: form.formState.errors
                      })
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editMode ? "Updating Product..." : "Adding Product..."}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {editMode ? "Update Product" : "Add Product"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogLargeContent>
    </Dialog>
  )
}
