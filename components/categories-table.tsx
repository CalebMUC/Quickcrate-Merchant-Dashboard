"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Tag,
  Folder,
  Eye,
  EyeOff,
  Search,
} from "lucide-react"

// Category Image Component with fallback
function CategoryImage({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Show fallback icon if no imageUrl or error occurred
  if (!imageUrl || imageError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
        <Tag className="h-5 w-5 text-white" />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <Tag className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={`${name} category image`}
        width={40}
        height={40}
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
        unoptimized={true} // For external URLs
      />
    </div>
  )
}

export function CategoriesTable({
  categories,
  openEditCategory,
  openEditSubCategory,
  openEditSubSubCategory,
  openAddSubCategory,
  openAddSubSubCategory,
  confirmDelete,
  loading,
}: {
  categories: any[]
  openEditCategory: (cat: any) => void
  openEditSubCategory?: (subCat: any) => void
  openEditSubSubCategory?: (subSubCat: any) => void
  openAddSubCategory: (id: string) => void
  openAddSubSubCategory?: (id: string) => void
  confirmDelete: (type: 'category' | 'subcategory' | 'subsubcategory', id: string, name: string) => void
  loading: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Table */}
      {!loading && filteredCategories.length > 0 ? (
        <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                <TableHead className="font-semibold text-foreground/90">Category</TableHead>
                <TableHead className="font-semibold text-foreground/90">Description</TableHead>
                <TableHead className="font-semibold text-foreground/90">Slug</TableHead>
                <TableHead className="font-semibold text-foreground/90">Parent</TableHead>
                <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                <TableHead className="text-center font-semibold text-foreground/90">Sort</TableHead>
                <TableHead className="text-center font-semibold text-foreground/90">Products</TableHead>
                <TableHead className="text-center font-semibold text-foreground/90">Subcategories</TableHead>
                <TableHead className="text-right font-semibold text-foreground/90 w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCategories.map((category, index) => (
                <>
                  {/* Main Category Row */}
                  <TableRow
                    key={category.categoryId}
                    className={cn(
                      "hover:bg-muted/50 transition-all duration-200 group border-b border-border/40",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Category Image */}
                        <div className="relative flex-shrink-0">
                          <CategoryImage
                            imageUrl={category.imageUrl}
                            name={category.name}
                          />
                          <div className="absolute inset-0 w-10 h-10 rounded-lg bg-blue-400/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {/* Category Info */}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium group-hover:text-blue-600 transition-colors truncate">
                            {category.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {category.slug || 'No slug'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {category.description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[300px] cursor-help">
                              <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors line-clamp-2">
                                {category.description}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="max-w-sm bg-popover text-popover-foreground border shadow-lg"
                            sideOffset={5}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {category.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="italic text-muted-foreground text-sm">No description</span>
                      )}
                    </TableCell>

                    {/* Slug */}
                    <TableCell>
                      <code className="text-xs bg-muted/60 group-hover:bg-muted px-2 py-1 rounded font-mono transition-colors">
                        {category.slug || <span className="italic text-muted-foreground">No slug</span>}
                      </code>
                    </TableCell>

                    {/* Parent */}
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Tag className="h-3 w-3 mr-1" />
                        Root
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {category.isActive ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Sort */}
                    <TableCell className="text-center font-medium">
                      {category.sortOrder ?? 0}
                    </TableCell>

                    {/* Products */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-default">
                        <Tag className="h-3 w-3 mr-1" />
                        {category.productCount || 0}
                      </Badge>
                    </TableCell>

                    {/* Subcategories */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors cursor-default">
                        <Folder className="h-3 w-3 mr-1" />
                        {category.subcategories?.length || 0}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* Add Subcategory Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-green-100 hover:text-green-600 hover:scale-110"
                          onClick={() => openAddSubCategory(category.categoryId || category.id)}
                          title="Add Subcategory"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 hover:scale-110"
                          onClick={() => openEditCategory(category)}
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600 hover:scale-110"
                          onClick={() => confirmDelete("category", category.categoryId || category.id, category.name)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditCategory(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAddSubCategory(category.categoryId || category.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Subcategory
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 hover:text-red-600 hover:bg-red-50"
                              onClick={() => confirmDelete("category", category.categoryId || category.id, category.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Subcategories Rows */}
                  {category.subcategories?.map((subcategory: any, subIndex: number) => (
                    <>
                      <TableRow
                        key={`sub-${subcategory.id}`}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 group bg-blue-50/40 dark:bg-blue-950/10 border-b border-border/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 pl-8">
                            <div className="w-4 h-px bg-border"></div>
                            <div className="relative flex-shrink-0">
                              <CategoryImage
                                imageUrl={subcategory.imageUrl}
                                name={subcategory.name}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium group-hover:text-blue-600 transition-colors truncate text-sm">
                                {subcategory.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {subcategory.slug || 'No slug'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subcategory.description ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[250px] cursor-help">
                                  <p className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-2">
                                    {subcategory.description}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="max-w-sm bg-popover text-popover-foreground border shadow-lg"
                                sideOffset={5}
                              >
                                <p className="text-xs whitespace-pre-wrap break-words">
                                  {subcategory.description}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="italic text-muted-foreground text-xs">No description</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted/60 px-1 py-0.5 rounded font-mono">
                            {subcategory.slug || '-'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <Folder className="h-2 w-2 mr-1" />
                            Subcategory
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subcategory.isActive ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                              <Eye className="h-2 w-2 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                              <EyeOff className="h-2 w-2 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {subcategory.sortOrder ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {subcategory.productCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {subcategory.subSubCategories?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {openAddSubSubCategory && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-green-100 hover:text-green-600"
                                onClick={() => openAddSubSubCategory(subcategory.id)}
                                title="Add Sub-Subcategory"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                            {openEditSubCategory && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
                                onClick={() => openEditSubCategory(subcategory)}
                                title="Edit Subcategory"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                              onClick={() => confirmDelete("subcategory", subcategory.id, subcategory.name)}
                              title="Delete Subcategory"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Sub-Subcategories Rows */}
                      {subcategory.subSubCategories?.map((subSubCategory: any) => (
                        <TableRow
                          key={`subsub-${subSubCategory.id}`}
                          className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-200 group bg-purple-50/40 dark:bg-purple-950/10 border-b border-border/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3 pl-16">
                              <div className="w-4 h-px bg-border"></div>
                              <div className="w-6 h-6 rounded bg-muted/60 flex items-center justify-center">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium group-hover:text-purple-600 transition-colors truncate text-xs">
                                  {subSubCategory.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  Sub-subcategory
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subSubCategory.description ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] cursor-help">
                                    <p className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-2">
                                      {subSubCategory.description}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="max-w-sm bg-popover text-popover-foreground border shadow-lg"
                                  sideOffset={5}
                                >
                                  <p className="text-xs whitespace-pre-wrap break-words">
                                    {subSubCategory.description}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="italic text-muted-foreground text-xs">No description</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              Sub-sub
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {subSubCategory.isActive ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                                <Eye className="h-2 w-2 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                                <EyeOff className="h-2 w-2 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {subSubCategory.sortOrder ?? 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              {subSubCategory.productCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {openEditSubSubCategory && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600"
                                  onClick={() => openEditSubSubCategory(subSubCategory)}
                                  title="Edit Sub-Subcategory"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                                onClick={() => confirmDelete("subsubcategory", subSubCategory.id, subSubCategory.name)}
                                title="Delete Sub-Subcategory"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-10 text-muted-foreground">
            No categories found
          </div>
        )
      )}
    </div>
  )
}
