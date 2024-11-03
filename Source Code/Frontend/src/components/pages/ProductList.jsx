import React, { useEffect, useState, useContext, useMemo } from "react";
import { MagnifyingGlass } from "react-loader-spinner";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { ShoppingListContext } from "../contexts/ShoppingListContext";
// import '@fortawesome/fontawesome-free/css/all.min.css';

import ScrollToTop from "../layout/ScrollToTop";
import GridView from '../product-views/GridView';
import ListView from '../product-views/ListView';
import ViewContext from '../product-views/ViewContext';

import styled from 'styled-components';

// Add these styled components at the top level
const SortingContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 200px;
`;

const SortSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: 0.5rem 2.25rem 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #2c3e50;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
  }

  &:disabled {
    background-color: #f8fafc;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #64748b;
  }

  &:focus {
    outline: none;
    color: #475569;
  }

  i {
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
`;

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    background: ${props => props.active ? '#f1f5f9' : '#fff'};
    color: ${props => props.active ? '#0f172a' : '#64748b'};
    border-radius: 0.375rem;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    i {
      font-size: 1rem;
    }
  }
`;

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
  const [viewContext] = useState(new ViewContext(new GridView()));
  const [viewMode, setViewMode] = useState('grid');

  // Add new state for sorting
  const [sortOption, setSortOption] = useState('default');
  const [isSorting, setIsSorting] = useState(false);

  // Add sorting function
  const getSortedProducts = (products) => {
    switch (sortOption) {
      case 'price-low-high':
        return [...products].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high-low':
        return [...products].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'featured':
        return [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      case 'default':
      default:
        return products; // Return original order
    }
  };

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
      setSearchResults(products);
      setIsSearching(false);
      return;
    }

    try {
      setError(null)
      setIsSearching(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/search/?query=${encodeURIComponent(query)}`,
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
      setSearchResults(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to perform search');
      setSearchResults([]);
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
  const sortedProductsMemo = useMemo(() => {
    return getSortedProducts(displayProducts);
  }, [displayProducts, sortOption]);
  const currentProducts = sortedProductsMemo.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  console.log(displayProducts);
  
  const totalPages = Math.ceil(displayProducts.length / productsPerPage);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    viewContext.setStrategy(mode === 'grid' ? new GridView() : new ListView());
  };

  // Add sort handler
  const handleSort = async (e) => {
    const newSortOption = e.target.value;
    setIsSorting(true);
    setSortOption(newSortOption);
    setCurrentPage(1);
    
    // Use setTimeout to allow the UI to update before heavy sorting
    setTimeout(() => {
      setIsSorting(false);
    }, 100);
  };

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
              <div className="col-lg-9 col-md-8 mt-2">
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

                  {/* Only show sorting options if there are products to display */}
                  {currentProducts.length > 0 && (
                    <ToolbarContainer>
                      <ViewToggle>
                        <button
                          className={viewMode === 'grid' ? 'active' : ''}
                          onClick={() => handleViewChange('grid')}
                        >
                          <i className="bi bi-grid"></i>
                        </button>
                        <button
                          className={viewMode === 'list' ? 'active' : ''}
                          onClick={() => handleViewChange('list')}
                        >
                          <i className="bi bi-list"></i>
                        </button>
                      </ViewToggle>


                      <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: '120px' }}
                        value={productsPerPage}
                        onChange={(e) => {
                          setProductsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={5}>Show 5</option>
                        <option value={20}>Show 20</option>
                        <option value={30}>Show 30</option>
                      </select>

                      <SortingContainer>
                        <SortSelect
                          value={sortOption}
                          onChange={handleSort}
                          disabled={isSorting}
                        >
                          <option value="default">Sort Products</option>
                          <option value="featured">Featured First</option>
                          <option value="price-low-high">Price: Lowest</option>
                          <option value="price-high-low">Price: Highest</option>
                          <option value="name-asc">Name: A to Z</option>
                          <option value="name-desc">Name: Z to A</option>
                        </SortSelect>
                        
                        {isSorting ? (
                          <LoadingSpinner>
                            <div className="spinner-border spinner-border-sm text-primary" 
                                 role="status" 
                                 style={{ width: '16px', height: '16px' }}>
                              <span className="visually-hidden">Sorting...</span>
                            </div>
                          </LoadingSpinner>
                        ) : (
                          sortOption !== 'default' && (
                            <ClearButton
                              onClick={() => {
                                setSortOption('default');
                                setCurrentPage(1);
                              }}
                              title="Clear sorting"
                              type="button"
                            >
                              <i className="bi bi-x"></i>
                            </ClearButton>
                          )
                        )}
                      </SortingContainer>
                    </ToolbarContainer>
                  )}
                </div>

                {/* Show message when no results found */}
                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="alert alert-info mt-3">
                    No products found matching "{searchQuery}"
                  </div>
                )}

                {/* Render current view */}
                {currentProducts.length > 0 && (
                  viewContext.executeStrategy(
                    currentProducts,
                    categories,
                    user,
                    addToList,
                    setError
                  )
                )}

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
