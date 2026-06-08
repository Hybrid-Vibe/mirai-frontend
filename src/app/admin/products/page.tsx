"use client";

import { useState, useEffect, useCallback } from "react";
import { productApi, adminApi, categoryApi, brandApi } from "@/lib/api-client";
import { ProductDto, CategoryResponseDto, BrandResponseDto } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  Plus,
  Filter,
  Loader2,
  X,
  Package,
  Edit2,
  Trash2,
  EyeOff,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bộ lọc nâng cao
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [brands, setBrands] = useState<BrandResponseDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
    null,
  );

  // Form states cho thêm sản phẩm mới
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addCategoryId, setAddCategoryId] = useState("");
  const [addBrandId, setAddBrandId] = useState("");
  // Nhập variant nhanh
  const [addPhoneModel, setAddPhoneModel] = useState("iPhone 15 Pro Max");
  const [addColor, setAddColor] = useState("Trắng");
  const [addPrice, setAddPrice] = useState("150000");
  const [addImageUrl, setAddImageUrl] = useState(
    "https://picsum.photos/400/600?random=1",
  );

  // Form states cho chỉnh sửa sản phẩm
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editBrandId, setEditBrandId] = useState("");

  // Tải danh mục và thương hiệu để phục vụ bộ lọc + form
  useEffect(() => {
    async function loadFilterMetadata() {
      try {
        const [cats, brs] = await Promise.all([
          categoryApi.getAllCategoriesActive(),
          brandApi.getAllBrandsActive(),
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch (err) {
        console.error("Failed to load metadata for filters:", err);
      }
    }
    loadFilterMetadata();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      await Promise.resolve();
      setIsLoading(true);
      // Backend cung cấp getAllProducts, chúng ta có thể lọc ở frontend
      // để chính xác nhất với toàn bộ thông tin sản phẩm và hiển thị UI mượt mà
      const data = await productApi.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm ❌");
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  // Bộ lọc frontend nâng cao
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.categoryId === categoryFilter;

    const matchesBrand = brandFilter === "all" || p.brandId === brandFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? p.isActive : !p.isActive);

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // Kích hoạt/Vô hiệu hóa sản phẩm (Ẩn/Hiện)
  const handleToggleActive = async (product: ProductDto) => {
    const nextActive = !product.isActive;
    const actionText = nextActive ? "Hiện" : "Ẩn";
    const updateToast = toast.loading(
      `Đang thực hiện ${actionText.toLowerCase()} sản phẩm... ⏳`,
    );

    try {
      if (nextActive) {
        await adminApi.activateProduct(product.productId);
      } else {
        await adminApi.deactivateProduct(product.productId);
      }
      toast.success(`${actionText} sản phẩm thành công! ✨`, {
        id: updateToast,
      });
      fetchProducts();
    } catch (err) {
      console.error("Failed to toggle product status:", err);
      toast.error(
        `Lỗi khi ${actionText.toLowerCase()} sản phẩm. Vui lòng thử lại! `,
        { id: updateToast },
      );
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (product: ProductDto) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Thao tác này không thể hoàn tác! `,
    );
    if (!confirmDelete) return;

    const updateToast = toast.loading("Đang xóa sản phẩm... ");
    try {
      await adminApi.deleteProduct(product.productId);
      toast.success("Xóa sản phẩm thành công! ", { id: updateToast });
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error(
        "Lỗi khi xóa sản phẩm. Sản phẩm có thể đang chứa trong đơn hàng của khách! ",
        { id: updateToast },
      );
    }
  };

  // Mở Dialog Thêm sản phẩm mới
  const handleOpenAddDialog = () => {
    setAddName("");
    setAddDescription("");
    setAddCategoryId(categories[0]?.categoryId || "");
    setAddBrandId(brands[0]?.brandId || "");
    setAddPhoneModel("iPhone 15 Pro Max");
    setAddColor("Trắng");
    setAddPrice("150000");
    setAddImageUrl(
      "https://picsum.photos/400/600?random=" + Math.floor(Math.random() * 100),
    );
    setIsAddOpen(true);
  };

  // Submit thêm sản phẩm mới
  const handleAddProductSubmit = async () => {
    if (!addName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm! ");
      return;
    }
    if (!addCategoryId) {
      toast.error("Vui lòng chọn danh mục! ");
      return;
    }
    if (!addBrandId) {
      toast.error("Vui lòng chọn thương hiệu! ");
      return;
    }

    const priceNum = parseFloat(addPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Giá tiền variant phải là số dương hợp lệ! ");
      return;
    }

    const updateToast = toast.loading(
      "Đang tạo sản phẩm kèm variant phôi ốp... ",
    );
    try {
      // Dùng API tạo tất cả (sản phẩm + ảnh + variant) trong 1 request
      await productApi.createAllProducts({
        name: addName,
        description: addDescription,
        categoryId: addCategoryId,
        brandId: addBrandId,
        images: [
          {
            imageUrl: addImageUrl || "https://picsum.photos/400/600",
            isPrimary: true,
          },
        ],
        variants: [
          {
            phoneModel: addPhoneModel,
            color: addColor,
            price: priceNum,
            imageUrl: addImageUrl || "https://picsum.photos/400/600",
          },
        ],
      });

      toast.success("Tạo sản phẩm và phôi ốp thành công! ", {
        id: updateToast,
      });
      setIsAddOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to create product:", err);
      toast.error("Lỗi khi thêm sản phẩm mới. Vui lòng thử lại! ", {
        id: updateToast,
      });
    }
  };

  // Mở Dialog Sửa sản phẩm
  const handleOpenEditDialog = (product: ProductDto) => {
    setSelectedProduct(product);
    setEditName(product.name || "");
    setEditDescription(product.description || "");
    setEditCategoryId(product.categoryId || "");
    setEditBrandId(product.brandId || "");
    setIsEditOpen(true);
  };

  // Submit sửa sản phẩm
  const handleEditProductSubmit = async () => {
    if (!selectedProduct) return;
    if (!editName.trim()) {
      toast.error("Tên sản phẩm không được để trống! ");
      return;
    }

    const updateToast = toast.loading("Đang cập nhật thông tin sản phẩm... ");
    try {
      await productApi.updateProduct(selectedProduct.productId, {
        name: editName,
        description: editDescription,
        categoryId: editCategoryId,
        brandId: editBrandId,
      });

      toast.success("Cập nhật thông tin hiển thị sản phẩm thành công! ", {
        id: updateToast,
      });
      setIsEditOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Lỗi khi cập nhật sản phẩm. Vui lòng thử lại! ", {
        id: updateToast,
      });
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter("all");
    setBrandFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    toast.success("Đã xóa bộ lọc sản phẩm! 🧹");
  };

  const isFiltered =
    categoryFilter !== "all" ||
    brandFilter !== "all" ||
    statusFilter !== "all" ||
    searchTerm !== "";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/admin"
              className="hover:text-foreground transition-colors"
            >
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">Sản phẩm</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Quản lý Sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quản lý danh sách phôi ốp, dòng máy hỗ trợ, chỉnh sửa thông tin hiển
            thị và thêm mới sản phẩm.
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          className="h-10 rounded-xl transition-all shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      {/* Bộ lọc sản phẩm */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm tên sản phẩm hoặc mã ID..."
              className="pl-10 h-10 rounded-xl border border-border bg-background outline-none focus-visible:ring-1 focus-visible:ring-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10 rounded-xl transition-all"
            >
              <Filter className="h-4 w-4 mr-2" />
              Lọc nâng cao
            </Button>
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Xoá bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Khối Lọc nâng cao */}
        {showAdvancedFilters && (
          <div className="grid gap-4 md:grid-cols-3 bg-muted/20 p-5 rounded-2xl border border-border shadow-inner animate-in slide-in-from-top-2 duration-250">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Danh mục
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Thương hiệu
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map((b) => (
                  <option key={b.brandId} value={b.brandId}>
                    {b.brandName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Trạng thái hiển thị
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang bán (Hiển thị)</option>
                <option value="inactive">Ngừng bán (Đang ẩn)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bảng sản phẩm */}
      <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[110px] font-semibold">Mã SP</TableHead>
              <TableHead className="font-semibold">Tên Sản Phẩm</TableHead>
              <TableHead className="font-semibold">Danh mục</TableHead>
              <TableHead className="font-semibold">Thương hiệu</TableHead>
              <TableHead className="font-semibold">Đánh giá</TableHead>
              <TableHead className="font-semibold">Trạng Thái</TableHead>
              <TableHead className="text-right font-semibold">
                Thao Tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Đang tải danh sách sản phẩm...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  Không tìm thấy sản phẩm nào khớp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.productId}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground/80">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help border-b border-dotted border-muted-foreground/60 select-all text-xs">
                        {product.productId.slice(0, 8)}...
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-border text-popover-foreground text-xs shadow-md">
                        <p>{product.productId}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground text-sm">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.categoryName || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.brandName || "-"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {product.ratingAvg ? (
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        {product.ratingAvg}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({product.ratingCount})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Chưa có ({product.ratingCount})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className={`rounded-xl px-2.5 py-0.5 border ${
                        product.isActive
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15"
                          : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/15"
                      }`}
                    >
                      {product.isActive ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 outline-none transition-colors border border-transparent hover:border-border">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border border-border shadow-md"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                            Sản phẩm
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenEditDialog(product)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(product)}
                            className="cursor-pointer"
                          >
                            {product.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Ẩn sản phẩm
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Hiện sản phẩm
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa sản phẩm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog 1: Thêm sản phẩm mới */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Thêm Sản Phẩm & Phôi Ốp Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập thông tin sản phẩm và tạo nhanh một Variant phôi ốp đi kèm
              cùng hình ảnh chính.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Tên sản phẩm *
              </label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Ví dụ: Phôi ốp lưng cao cấp MIRAI Glass"
                className="rounded-xl border border-border bg-background h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Mô tả sản phẩm
              </label>
              <Textarea
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                placeholder="Nhập mô tả đặc tính sản phẩm, ưu điểm, chất liệu..."
                className="rounded-xl border border-border bg-background min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase block">
                  Danh mục *
                </label>
                <select
                  value={addCategoryId}
                  onChange={(e) => setAddCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase block">
                  Thương hiệu *
                </label>
                <select
                  value={addBrandId}
                  onChange={(e) => setAddBrandId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
                >
                  <option value="" disabled>
                    Chọn thương hiệu
                  </option>
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandId}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phần thông tin Variant đi kèm */}
            <div className="border-t border-border/80 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                Thông tin Phôi ốp (Variant khởi tạo)
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">
                    Dòng máy hỗ trợ *
                  </label>
                  <Input
                    value={addPhoneModel}
                    onChange={(e) => setAddPhoneModel(e.target.value)}
                    placeholder="Ví dụ: iPhone 15 Pro Max"
                    className="rounded-xl border border-border bg-background h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">
                    Màu sắc *
                  </label>
                  <Input
                    value={addColor}
                    onChange={(e) => setAddColor(e.target.value)}
                    placeholder="Ví dụ: Trắng / Trong suốt"
                    className="rounded-xl border border-border bg-background h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">
                    Giá bán (VNĐ) *
                  </label>
                  <Input
                    type="number"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    placeholder="Ví dụ: 150000"
                    className="rounded-xl border border-border bg-background h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">
                    Đường dẫn hình ảnh
                  </label>
                  <Input
                    value={addImageUrl}
                    onChange={(e) => setAddImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded-xl border border-border bg-background h-10 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0 border-t border-border/60 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddProductSubmit}
              className="rounded-xl flex-1"
            >
              Tạo sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Chỉnh sửa thông tin hiển thị sản phẩm */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Chỉnh Sửa Thông Tin Hiển Thị
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cập nhật các thông tin cơ bản hiển thị trên trang chủ bán hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Tên sản phẩm *
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="rounded-xl border border-border bg-background h-10 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Mô tả sản phẩm
              </label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Nhập mô tả sản phẩm..."
                className="rounded-xl border border-border bg-background min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Danh mục
              </label>
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Thương hiệu
              </label>
              <select
                value={editBrandId}
                onChange={(e) => setEditBrandId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none cursor-pointer hover:border-primary/50 transition-all font-medium"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((b) => (
                  <option key={b.brandId} value={b.brandId}>
                    {b.brandName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditProductSubmit}
              className="rounded-xl flex-1"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
