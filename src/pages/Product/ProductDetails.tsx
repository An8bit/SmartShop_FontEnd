import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaStar, FaShare, FaMinus, FaPlus, FaComments } from 'react-icons/fa';
import { getProductById } from '../../services/productService';
import { addToCart, addToGuestCart } from '../../services/cartService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import Header from "../../components/features/Header/Header";
import Footer from "../../components/common/Footer/Footer";
import styles from "./ProductDetails.module.css";

interface Product {
  productId: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  description: string;
  categoryId: string;
  stockQuantity: number;
  rating?: number;
  sold?: number;
  variants?: Array<{
    variantId: number;
    size: string;
    color: string;
    stockQuantity: number;
  }>;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Fetch product datanp
  const fetchProductData = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching product details for ID:", productId);

      const productResponse = await getProductById(productId);
      console.log("Product API Response:", productResponse);

      if (!productResponse) {
        throw new Error('Không thể tải thông tin sản phẩm');
      }

      // Xử lý response từ API
      let productData: Product;
      const response = productResponse as any;
      if (response.data) {
        productData = response.data;
      } else if (response.product) {
        productData = response.product;
      } else {
        productData = productResponse as Product;
      }
      
      console.log("Processed product data:", productData);
      
      if (!productData.productId && !productData.name) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
      }
      
      setProduct(productData);
      setMainImage(productData.imageUrl);
      
      // Extract unique sizes and colors from variants
      if (productData.variants && productData.variants.length > 0) {
        const sizes = Array.from(new Set(productData.variants.map(variant => variant.size)));
        const colors = Array.from(new Set(productData.variants.map(variant => variant.color)));

        setAvailableSizes(sizes);
        setAvailableColors(colors);

        // Set initial selected values if available
        if (sizes.length > 0) {
          setSelectedSize(sizes[0]);
        }
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Handle size selection
  const handleSizeChange = (size: string) => {
    console.log('Selected size:', size);
    setSelectedSize(size);
  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    console.log('Selected color:', color);
    setSelectedColor(color);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    try {
      if (!selectedSize) {
        showToast('Vui lòng chọn size!', 'warning');
        return;
      }

      if (quantity <= 0) {
        showToast('Vui lòng chọn số lượng hợp lệ!', 'warning');
        return;
      }

      if (!product) {
        showToast('Không tìm thấy sản phẩm!', 'error');
        return;
      }

      // Kiểm tra xem user đã login chưa
      const user = sessionStorage.getItem("user");
      const isLoggedIn = user !== null && user !== "undefined";

      if (isLoggedIn) {
        // User đã login - gọi API
        const selectedVariant = product.variants?.find(v => v.size === selectedSize);
        await addToCart({ 
          productId: product.productId, 
          variantId: selectedVariant?.variantId,
          quantity 
        });
      } else {
        // Guest - lưu vào localStorage
        addToGuestCart(product as any, quantity);
      }

      showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'error');
    }
  };

  // Buy now handler
  const handleBuyNow = async () => {
    try {
      if (!selectedSize) {
        alert('Vui lòng chọn size!');
        return;
      }
      await handleAddToCart();
      navigate('/cart');
    } catch (error) {
      console.error('Error buying product:', error);
      showToast('Có lỗi xảy ra khi mua hàng!', 'error');
    }
  };

  // Chat handler
  const handleChat = () => {
    showToast('Tính năng chat sẽ sớm ra mắt!', 'warning');
  };

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles["product-details-loading"]}>
          <div className={styles["loading-spinner"]}></div>
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className={styles["product-details-error"]}>
          <h2>Không tìm thấy sản phẩm</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles["product-details-container"]}>
        <div className={styles["product-details-wrapper"]}>
          {/* Left Section - Product Images */}
          <div className={styles["product-gallery"]}>
            <div className={styles["main-image"]}>
              <img src={mainImage || product.imageUrl} alt={product.name} />
            </div>
          </div>

          {/* Right Section - Product Info */}
          <div className={styles["product-info"]}>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#7f5539'}}>{product.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className="text-lg"
                        style={{
                          color: index < Math.floor(product.rating || 0) ? '#ddb892' : '#f4e1d2'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{color: '#b08968'}}>(0 đánh giá)</span>
                </div>
                {product.sold && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#f4e1d2', color: '#7f5539'}}>
                    Đã bán: {product.sold}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold mb-2" style={{color: '#7f5539'}}>
                {Number(product.discountedPrice || product.price).toLocaleString()}đ
              </div>
              {product.discountedPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-lg line-through" style={{color: '#b08968'}}>
                    {Number(product.price).toLocaleString()}đ
                  </span>
                  <span className="px-2 py-1 rounded-md text-sm font-semibold text-white" style={{backgroundColor: '#7f5539'}}>
                    -{Math.round((1 - product.discountedPrice / product.price) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Size Selector - Custom Design Colors */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#7f5539'}}>Chọn Size</h3>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className="px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: selectedSize === size ? '#7f5539' : '#ddb892',
                        backgroundColor: selectedSize === size ? '#7f5539' : '#f4e1d2',
                        color: selectedSize === size ? 'white' : '#7f5539'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSize !== size) {
                          e.currentTarget.style.backgroundColor = '#ddb892';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSize !== size) {
                          e.currentTarget.style.backgroundColor = '#f4e1d2';
                          e.currentTarget.style.color = '#7f5539';
                        }
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="mt-2 text-sm font-medium" style={{color: '#b08968'}}>
                    Size đã chọn: {selectedSize}
                  </p>
                )}
              </div>
            )}

            {/* Color Selector - Custom Design Colors */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{color: '#7f5539'}}>Chọn Màu</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className="px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105 capitalize"
                      style={{
                        borderColor: selectedColor === color ? '#b08968' : '#ddb892',
                        backgroundColor: selectedColor === color ? '#b08968' : '#f4e1d2',
                        color: selectedColor === color ? 'white' : '#7f5539'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.backgroundColor = '#ddb892';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.backgroundColor = '#f4e1d2';
                          e.currentTarget.style.color = '#7f5539';
                        }
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-sm font-medium" style={{color: '#b08968'}}>
                    Màu đã chọn: {selectedColor}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector - Custom Design Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{color: '#7f5539'}}>Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg overflow-hidden" style={{borderColor: '#ddb892'}}>
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-lg font-bold transition-colors duration-300"
                    style={{
                      backgroundColor: quantity <= 1 ? '#f4e1d2' : 'white',
                      color: quantity <= 1 ? '#ddb892' : '#7f5539',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (quantity > 1) {
                        e.currentTarget.style.backgroundColor = '#f4e1d2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (quantity > 1) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <FaMinus />
                  </button>
                  <span className="px-6 py-2 text-lg font-semibold min-w-60 text-center" style={{backgroundColor: '#f4e1d2', color: '#7f5539'}}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    disabled={quantity >= (product.stockQuantity || 99)}
                    className="px-4 py-2 text-lg font-bold transition-colors duration-300"
                    style={{
                      backgroundColor: quantity >= (product.stockQuantity || 99) ? '#f4e1d2' : 'white',
                      color: quantity >= (product.stockQuantity || 99) ? '#ddb892' : '#7f5539',
                      cursor: quantity >= (product.stockQuantity || 99) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (quantity < (product.stockQuantity || 99)) {
                        e.currentTarget.style.backgroundColor = '#f4e1d2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (quantity < (product.stockQuantity || 99)) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
                {product.stockQuantity && (
                  <span className="text-sm font-medium px-3 py-1 rounded-full" style={{color: '#b08968', backgroundColor: '#f4e1d2'}}>
                    Còn {product.stockQuantity} sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* Product Description - Custom Design Colors */}
            <div className="mb-20">
              <h3 className="text-lg font-semibold mb-3" style={{color: '#7f5539'}}>Mô tả sản phẩm</h3>
              <div 
                className="prose prose-sm max-w-none leading-relaxed"
                style={{color: '#b08968'}}
                dangerouslySetInnerHTML={{ __html: product.description }} 
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Bar - Custom Design Colors */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 px-4 py-3" style={{borderColor: '#ddb892'}}>
          <div className="max-w-6xl mx-auto flex gap-3">
            {/* Chat Button */}
            <button 
              onClick={handleChat}
              className="flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-white"
              style={{
                background: 'linear-gradient(135deg, #b08968 0%, #7f5539 100%)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7f5539 0%, #b08968 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #b08968 0%, #7f5539 100%)';
              }}
            >
              <FaComments className="text-lg" />
              <span className="hidden sm:inline">Chat ngay</span>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize && availableSizes.length > 0}
              className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                !selectedSize && availableSizes.length > 0
                  ? 'cursor-not-allowed'
                  : ''
              }`}
              style={{
                background: !selectedSize && availableSizes.length > 0 
                  ? '#f4e1d2' 
                  : 'linear-gradient(135deg, #ddb892 0%, #b08968 100%)',
                color: !selectedSize && availableSizes.length > 0 ? '#7f5539' : 'white'
              }}
              onMouseEnter={(e) => {
                if (!(!selectedSize && availableSizes.length > 0)) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #b08968 0%, #7f5539 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!selectedSize && availableSizes.length > 0)) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ddb892 0%, #b08968 100%)';
                }
              }}
            >
              <FaShoppingCart className="text-lg" />
              <span className="hidden sm:inline">Thêm vào giỏ</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={!selectedSize && availableSizes.length > 0}
              className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                !selectedSize && availableSizes.length > 0
                  ? 'cursor-not-allowed'
                  : ''
              }`}
              style={{
                background: !selectedSize && availableSizes.length > 0 
                  ? '#f4e1d2' 
                  : 'linear-gradient(135deg, #7f5539 0%, #b08968 100%)',
                color: !selectedSize && availableSizes.length > 0 ? '#7f5539' : 'white'
              }}
              onMouseEnter={(e) => {
                if (!(!selectedSize && availableSizes.length > 0)) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #b08968 0%, #ddb892 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!selectedSize && availableSizes.length > 0)) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7f5539 0%, #b08968 100%)';
                }
              }}
            >
              <span>Mua ngay</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;
