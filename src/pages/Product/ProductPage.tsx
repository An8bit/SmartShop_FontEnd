import { Product } from '../../interfaces/Product';
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../Product/ProductPage.module.css";
import Header from "../../components/features/Header/Header";
import Footer from "../../components/common/Footer/Footer";
import { getProducts, getProductById, getProductsByCategory } from '../../services/productService';
import { FiShoppingCart, FiHeart, FiSearch, FiFilter } from 'react-icons/fi';
import ProductCard from "../../components/common/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface ProductPageProps {
  sampleProducts: any[];
}

const ProductPage = ({ sampleProducts }: ProductPageProps) => {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Function to get category display name
  const getCategoryDisplayName = (categoryParam: string | undefined) => {
    switch(categoryParam) {
      case "1": return "Nam";
      case "2": return "Nữ"; 
      case "3": return "Trẻ em";
      case "4": return "Sale";
      case "5": return "Xu hướng";
      case "6": return "Bộ sưu tập";
      case "all": return "Tất cả sản phẩm";
      default: return "Tất cả sản phẩm";
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let apiResult: any;
        
        console.log("Fetching products for category:", category);
        
        if (!category || category === "all") {
          apiResult = await getProducts();
        } else {
          apiResult = await getProductsByCategory(category);
        }
        
        console.log("API Result:", apiResult);
        console.log("API Result type:", typeof apiResult);
        console.log("Is API Result array?", Array.isArray(apiResult));
        
        let productsData: Product[] = [];
        
        // Xử lý response từ API
        if (Array.isArray(apiResult)) {
          productsData = apiResult;
          console.log("Case 1: Direct array");
        } else if (apiResult && Array.isArray((apiResult as any).data)) {
          productsData = (apiResult as any).data;
          console.log("Case 2: .data array");
        } else if (apiResult && (apiResult as any).products && Array.isArray((apiResult as any).products)) {
          productsData = (apiResult as any).products;
          console.log("Case 3: .products array");
        } else {
          console.warn("Unexpected API response format:", apiResult);
          console.log("API keys:", apiResult ? Object.keys(apiResult) : "No keys");
          productsData = [];
        }
        
        console.log("Products data:", productsData);
        console.log("Total products before filtering:", productsData.length);
        
        // Hiển thị tất cả sản phẩm - không lọc bỏ
        setProducts(productsData);
        console.log("Products set to state:", productsData.length);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(`Failed to load products: ${err.message as string}`);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Sort products based on selected option
  const sortedProducts: Product[] = [...products].sort((a: Product, b: Product) => {
    const getDisplayPrice = (p: Product) => p.discountedPrice ?? p.price;
    switch(sortOption) {
      case 'price-low':
        return getDisplayPrice(a) - getDisplayPrice(b);
      case 'price-high':
        return getDisplayPrice(b) - getDisplayPrice(a);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Lọc và tìm kiếm sản phẩm theo tên và khoảng giá (không gọi lại API)
  const filteredProducts = sortedProducts
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => {
      const price = product.discountedPrice ?? product.price;
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    });

  if (loading) return (
    <LoadingSpinner 
      message="Đang tải sản phẩm"
      subtitle="Chúng tôi đang chuẩn bị những sản phẩm tuyệt vời cho bạn..."
    />
  );
  
  if (error) return (
    <div className="product-page error-container">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <>
      <Header />
      <div className={styles["product-page"]}>
        <div className={styles["product-header"]}>
          <h2>Sản phẩm - {getCategoryDisplayName(category)}</h2>
          <div className={styles["product-controls"]}>
            <div className={styles["search-container"]}>
              <FiSearch className={styles["search-icon"]} />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className={styles["search-input"]}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles["filter-container"]}>
              <FiFilter className={styles["filter-icon"]} />
              <select 
                className={styles["sort-select"]}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Sắp xếp</option>
                <option value="price-low">Giá: Thấp đến Cao</option>
                <option value="price-high">Giá: Cao đến Thấp</option>
                <option value="name-asc">Tên: A đến Z</option>
                <option value="name-desc">Tên: Z đến A</option>
              </select>
            </div>
            <div className={styles["price-filter-container"]}>
              <input
                type="number"
                placeholder="Giá từ"
                className={styles["price-input"]}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <span className={styles["price-separator"]}>-</span>
              <input
                type="number"
                placeholder="Đến"
                className={styles["price-input"]}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className={styles["product-list"]}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.productId || `product-${index}`} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles["no-products"]}>
            <div className={styles["no-products-icon"]}>🔍</div>
            <h3>No products found</h3>
            <p>We couldn't find any products that match your criteria.</p>
            <button onClick={() => window.location.reload()} className="reload-btn">Reload Page</button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;