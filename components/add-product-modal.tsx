"use client"

import type React from "react"
import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { productsService, type ProductFormData, type ProductImageUpload } from "@/lib/api/products"
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
  Loader2
} from "lucide-react"

// Zod schema for product validation
const productSchema = z.object({
  // Basic Information
  productName: z.string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  description: z.string()
    .min(1, "Description is required"),
  productDescription: z.string()
    .min(1, "Product description is required"),
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  stockQuantity: z.number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  
  // Category Information
  categoryId: z.number().min(1, "Category is required"),
  categoryName: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  subCategoryId: z.number().optional(),
  subCategoryName: z.string()
    .max(100, "Subcategory name must be less than 100 characters")
    .optional(),
  subSubCategoryId: z.number().optional(),
  subSubCategoryName: z.string()
    .max(100, "Sub-subcategory name must be less than 100 characters")
    .optional(),
  
  // Product Details
  productType: z.string()
    .max(100, "Product type must be less than 100 characters")
    .optional(),
  keyFeatures: z.string()
    .min(1, "Key features are required"),
  specification: z.string()
    .min(1, "Specifications are required"),
  box: z.string()
    .min(1, "Box contents are required"),
  searchKeyWord: z.string()
    .min(1, "Search keywords are required")
    .max(500, "Search keywords must be less than 500 characters"),
  
  // Pricing & Stock
  discount: z.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .default(0),
  inStock: z.boolean().default(true),
  
  // Images (will be handled separately)
  imageType: z.string().default("product"),
  
  // System fields (will be set automatically)
  isSaved: z.boolean().default(false)
})

type LocalProductFormData = z.infer<typeof productSchema>

interface AddProductModalProps {
  trigger?: React.ReactNode
  onProductAdded?: (product: any) => void
}

interface ImageUpload {
  file: File
  preview: string
  id: string
}

export function AddProductModal({ trigger, onProductAdded }: AddProductModalProps) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<ImageUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  // Categories data (in production, fetch from API)
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing & Fashion" },
    { id: 3, name: "Home & Garden" },
    { id: 4, name: "Sports & Outdoors" },
    { id: 5, name: "Books & Media" },
    { id: 6, name: "Health & Beauty" },
    { id: 7, name: "Automotive" },
    { id: 8, name: "Toys & Games" }
  ]

  const subCategories = [
    { id: 1, parentId: 1, name: "Smartphones" },
    { id: 2, parentId: 1, name: "Laptops" },
    { id: 3, parentId: 1, name: "Headphones" },
    { id: 4, parentId: 1, name: "Cameras" },
    { id: 5, parentId: 2, name: "Men's Clothing" },
    { id: 6, parentId: 2, name: "Women's Clothing" },
    { id: 7, parentId: 2, name: "Shoes" },
    { id: 8, parentId: 2, name: "Accessories" }
  ]

  const form = useForm<LocalProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      description: "",
      productDescription: "",
      price: 0,
      stockQuantity: 0,
      categoryId: 0,
      categoryName: "",
      subCategoryId: undefined,
      subCategoryName: "",
      subSubCategoryId: undefined,
      subSubCategoryName: "",
      productType: "",
      keyFeatures: "",
      specification: "",
      box: "",
      searchKeyWord: "",
      discount: 0,
      inStock: true,
      imageType: "product",
      isSaved: false
    }
  })

  const watchedCategoryId = form.watch("categoryId")
  const watchedSubCategoryId = form.watch("subCategoryId")

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
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate images
      if (images.length === 0) {
        setSubmitError("Please upload at least one product image")
        return
      }

      // Validate image files
      for (const image of images) {
        const validation = productsService.validateImage(image.file)
        if (!validation.valid) {
          setSubmitError(validation.error || "Invalid image file")
          return
        }
      }

      // Prepare product images for service
      const productImages: ProductImageUpload[] = images.map((image, index) => ({
        id: image.id,
        file: image.file,
        preview: image.preview,
        alt: `${data.productName} - Image ${index + 1}`,
        isPrimary: index === 0
      }))

      // Convert LocalProductFormData to ProductFormData for the service
      const productData: ProductFormData = {
        productName: data.productName,
        description: data.description,
        productDescription: data.productDescription,
        price: data.price,
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        subCategoryId: data.subCategoryId,
        subCategoryName: data.subCategoryName,
        subSubCategoryId: data.subSubCategoryId,
        subSubCategoryName: data.subSubCategoryName,
        brand: data.brand,
        model: data.model,
        color: data.color,
        size: data.size,
        weight: data.weight,
        dimensions: data.dimensions,
        material: data.material,
        sku: data.sku,
        tags: data.tags,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        status: data.status || 'pending'
      }

      console.log('📝 Submitting product data:', productData)
      console.log('🖼️ Product images:', productImages.length)

      // Call the products service
      const response = await productsService.createProduct(productData, productImages)

      console.log('✅ Product created successfully:', response)
      
      // Show success toast
      toast({
        title: "Product Created Successfully!",
        description: `${data.productName} has been added to your inventory.`,
        variant: "default",
        duration: 5000,
      })

      // Reset form and close modal
      form.reset()
      setImages([])
      setActiveTab("basic")
      setOpen(false)
      
      // Cleanup object URLs
      images.forEach(img => URL.revokeObjectURL(img.preview))
      
      onProductAdded?.(data)
      
    } catch (error) {
      console.error('💥 Error adding product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product'
      
      setSubmitError(errorMessage)
      
      // Show error toast
      toast({
        title: "Failed to Create Product",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const id = parseInt(categoryId)
    const category = categories.find(c => c.id === id)
    
    form.setValue("categoryId", id)
    form.setValue("categoryName", category?.name || "")
    form.setValue("subCategoryId", undefined)
    form.setValue("subCategoryName", "")
    form.setValue("subSubCategoryId", undefined)
    form.setValue("subSubCategoryName", "")
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    const id = parseInt(subCategoryId)
    const subCategory = subCategories.find(sc => sc.id === id)
    
    form.setValue("subCategoryId", id)
    form.setValue("subCategoryName", subCategory?.name || "")
    form.setValue("subSubCategoryId", undefined)
    form.setValue("subSubCategoryName", "")
  }

  const filteredSubCategories = subCategories.filter(
    sc => sc.parentId === watchedCategoryId
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
              Add New Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Create a comprehensive product listing with detailed information. All required fields must be completed for approval.
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
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>In Stock</FormLabel>
                              <FormDescription>
                                Check if this product is currently available for purchase
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
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Category *</FormLabel>
                              <Select
                                onValueChange={(value) => handleCategoryChange(value)}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <Select
                                onValueChange={(value) => handleSubCategoryChange(value)}
                                disabled={!watchedCategoryId || filteredSubCategories.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subcategory" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredSubCategories.map((subCategory) => (
                                    <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                                      {subCategory.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subSubCategoryName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sub-Subcategory</FormLabel>
                              <FormControl>
                                <Input placeholder="Optional sub-category" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="searchKeyWord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Search Keywords *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add relevant keywords separated by commas (e.g., smartphone, mobile, android, phone)"
                                className="min-h-[80px]"
                                {...field} 
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
                        name="keyFeatures"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Features *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="• Feature 1&#10;• Feature 2&#10;• Feature 3"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              List the main selling points and features of your product
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technical Specifications *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Dimensions: 15cm x 10cm x 5cm&#10;Weight: 200g&#10;Material: Aluminum&#10;Color: Space Gray"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Detailed technical specifications and measurements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="box"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What's in the Box *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="• 1x Product&#10;• 1x User Manual&#10;• 1x USB Cable&#10;• 1x Warranty Card"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              List all items included in the product package
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
                                  {image.file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(image.file.size / 1024 / 1024).toFixed(1)} MB
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
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Product...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
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
