import React, { useEffect, useState, useContext } from "react";
import { MagnifyingGlass } from "react-loader-spinner";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { ShoppingListContext } from "../contexts/ShoppingListContext";
// import '@fortawesome/fontawesome-free/css/all.min.css';

import ScrollToTop from "../layout/ScrollToTop";

function ProductList() {
  const { user } = useContext(UserContext);
  const { addToList } = useContext(ShoppingListContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // Add products state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch both categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/categories/"),
          fetch("http://127.0.0.1:8000/products/"),
        ]);

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        console.log(categoriesData);
        console.log(productsData);

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5); // Default value

  // Calculate pagination values
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  // Function to handle page changes
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(products); // Show all products when search is empty
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/search/?query=${encodeURIComponent(query)}`, // Updated endpoint
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setCurrentPage(1); // Reset to first page when searching
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to perform search');
      setSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = React.useCallback(
    debounce(handleSearch, 300),
    []
  );

  const displayProducts = searchQuery ? searchResults : products;
  const currentProducts = displayProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(displayProducts.length / productsPerPage);

  return (
    <div>
      {loading ? (
        <div className="loader-container">
          {/* <PulseLoader loading={loaderStatus} size={50} color="#0aad0a" /> */}
          <MagnifyingGlass
            visible={true}
            height="100"
            width="100"
            ariaLabel="magnifying-glass-loading"
            wrapperStyle={{}}
            wrapperclassName="magnifying-glass-wrapper"
            glassColor="#c0efff"
            color="#0aad0a"
          />
        </div>
      ) : (
        <>
          <>
            <ScrollToTop />
          </>

          <div className="container ">
            <div className="row">
              {/* Left */}
              <div className="col-md-3 mt-4">
                {/* search */}
                <div className="pt-4">
                  <h5>Search for Products</h5>
                  <div className="mt-3 position-relative">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search for products"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                      disabled={isSearching}
                    />
                    {isSearching && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Searching...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="text-danger small mt-2">
                      {error}
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div className="py-4">
                  <h5 className="mb-3 mt-6">Categories</h5>
                  <ul className="nav flex-column">
                    {Array.isArray(categories) && categories.map((category, index) => (
                      <li className="nav-item" key={category._id || index}>
                        <Link
                          className="nav-link"
                          to={`/category/${category._id}`}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product list */}
              <div className="col-lg-9 col-md-8">
                <div className="d-md-flex justify-content-between align-items-center mt-3">
                  {/* Products Found */}
                  <div>
                    <p className="mb-3 mb-md-0">
                      <span className="text-dark">
                        {searchQuery 
                          ? `${searchResults.length} results for "${searchQuery}"`
                          : `${products.length} Products found`
                        }
                      </span>
                    </p>
                  </div>

                  {/* sort & list style & num of prods */}
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Number of Proucts per page */}
                    <div className="me-2">
                      <select
                        className="form-select"
                        value={productsPerPage}
                        onChange={(e) => {
                          setProductsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={5}>Show: 5</option>
                        <option value={20}>Show: 20</option>
                        <option value={30}>Show: 30</option>
                      </select>
                    </div>

                    {/* Sort by */}
                    <div>
                      <select
                        className="form-select"
                        aria-label="Default select example"
                      >
                        <option selected>Sort by: Featured</option>
                        <option value="Low to High">Price: Low to High</option>
                        <option value="High to Low"> Price: High to Low</option>
                        <option value="Release Date"> Release Date</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* row */}
                <div className="row g-4 row-cols-xl-4 row-cols-lg-3 row-cols-2 row-cols-md-2 mt-2">
                  {currentProducts.map((product) => (
                    <div className="col" key={product.id}>
                      {" "}
                      {/* Handle both id formats */}
                      <div className="card card-product">
                        <div className="card-body">
                          <div className="text-center position-relative">
                            {/* Only show badge if there's a condition to show */}
                            <div className="position-absolute top-0 start-0">
                              {product.featured && (
                                <span className="badge bg-primary">
                                  Featured
                                </span>
                              )}
                              {!product.available && (
                                <span className="badge bg-danger">
                                  Out of Stock
                                </span>
                              )}
                              {product.old_price && (
                                <span className="badge bg-secondary ms-2">
                                  {Math.round(
                                    ((product.old_price - product.price) /
                                      product.old_price) *
                                      100
                                  )}
                                  % Off
                                </span>
                              )}
                            </div>

                            <Link to="/product-details">
                              <img
                                src={product.image}
                                alt={product.name || ""}
                                className="mb-3 img-fluid"
                              />
                            </Link>
                          </div>

                          <div className="text-small mb-1">
                            <Link
                              to="#!"
                              className="text-decoration-none text-muted"
                            >
                              <small>
                                {Array.isArray(categories) && categories.find(
                                  (cat) => cat.id === product.category
                                )?.name || "Category"}
                              </small>
                            </Link>
                          </div>

                          <h2 className="fs-6">
                            <Link
                              to={`/product/${product.id || product._id}`}
                              className="text-inherit text-decoration-none"
                            >
                              {product.name || "Product Name"}
                            </Link>
                          </h2>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                              <span className="text-dark">
                                ${product.price || 0}
                              </span>{" "}
                              {product.old_price && (
                                <span className="text-decoration-line-through text-muted ms-2">
                                  ${product.old_price}
                                </span>
                              )}
                            </div>
                            <div>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                  if (!user) {
                                    alert(
                                      "Please log in to add products to your shopping list."
                                    );
                                    return;
                                  }
                                  try {
                                    const result = await addToList(product.id);
                                    alert(result.message);
                                  } catch (err) {
                                    console.error(
                                      "Failed to add product:",
                                      err
                                    );
                                    setError(
                                      "Failed to add product to shopping list"
                                    );
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={16}
                                  height={16}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-plus"
                                >
                                  <line x1={12} y1={5} x2={12} y2={19} />
                                  <line x1={5} y1={12} x2={19} y2={12} />
                                </svg>{" "}
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="row mt-8">
                    <div className="col d-flex justify-content-center">
                      <nav>
                        <ul className="pagination">
                          {/* Previous button */}
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link mx-1 rounded-3"
                              onClick={() =>
                                currentPage > 1 && paginate(currentPage - 1)
                              }
                              disabled={currentPage === 1}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                          </li>

                          {/* Page numbers */}
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Show first page, last page, and pages around current page
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 &&
                                pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <li
                                  key={pageNumber}
                                  className={`page-item ${
                                    pageNumber === currentPage ? "active" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link mx-1 rounded-3"
                                    onClick={() => paginate(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            }

                            // Show dots if there's a gap
                            if (
                              (pageNumber === currentPage - 2 &&
                                pageNumber > 2) ||
                              (pageNumber === currentPage + 2 &&
                                pageNumber < totalPages - 1)
                            ) {
                              return (
                                <li key={pageNumber} className="page-item">
                                  <span className="page-link mx-1 rounded-3">
                                    ...
                                  </span>
                                </li>
                              );
                            }

                            return null;
                          })}

                          {/* Next button */}
                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link mx-1 rounded-3"
                              onClick={() =>
                                currentPage < totalPages &&
                                paginate(currentPage + 1)
                              }
                              disabled={currentPage === totalPages}
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;
