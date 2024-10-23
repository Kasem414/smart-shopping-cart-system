import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagement = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    inStock: true,
    featured: false,
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/products/");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle input changes for new product form
  const handleInputChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "file") {
      setNewProduct({
        ...newProduct,
        [name]: files[0],
      });
    } else {
      const inputValue = type === "checkbox" ? checked : value;
      setNewProduct({
        ...newProduct,
        [name]: inputValue,
      });
    }
  };

  // Handle input changes for editing product form
  const handleEditChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "file") {
      setEditingProduct({
        ...editingProduct,
        [name]: files[0],
      });
    } else {
      const inputValue = type === "checkbox" ? checked : value;
      setEditingProduct({
        ...editingProduct,
        [name]: inputValue,
      });
    }
  };

  // Add a new product
  const addProduct = async () => {
    try {
      const formData = new FormData();

      // Append all product data to formData
      Object.keys(newProduct).forEach((key) => {
        if (key === "image" && newProduct[key]) {
          formData.append("image", newProduct[key]);
        } else {
          formData.append(key, newProduct[key]);
        }
      });

      // Append category
      formData.append("category", category);

      console.log("Sending product data:", Object.fromEntries(formData));

      const response = await axios.post(
        "http://127.0.0.1:8000/products/create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API response:", response.data);

      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        price: "",
        oldPrice: "",
        description: "",
        inStock: true,
        featured: false,
        image: null,
      });
      setCategory("");
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Edit an existing product
  const editProduct = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/products/${editingProduct.id}`,
        editingProduct
      );
      const updatedProducts = products.map((product) =>
        product.id === editingProduct.id ? response.data : product
      );
      setProducts(updatedProducts);
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      alert("Error editing product:", error);
    }
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      oldPrice: "",
      description: "",
      inStock: true,
      featured: false,
      image: null,
    });
    setCategory("");
  };

  // Start editing a product
  const startEdit = (product) => {
    setIsEditing(true);
    setEditingProduct(product);
  };

  // Delete a product
  const deleteProduct = async (id) => {
    try {
      alert("Are you sure you want to delete this product?");
      await axios.delete(`http://127.0.0.1:8000/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Close product details modal
  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Filter products based on search input
  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(filter.toLowerCase()) &&
      (categoryFilter === "" || product.category === categoryFilter)
  );

  // Sort products based on selected column and order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  // Function to handle sorting
  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Render pagination items
  const renderPaginationItems = () => {
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
      paginationItems.push(
        <li
          className={`page-item ${number === currentPage ? "active" : ""}`}
          key={number}
        >
          <button className="page-link" onClick={() => setCurrentPage(number)}>
            {number}
          </button>
        </li>
      );
    }
    return paginationItems;
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "N/A";
  };

  return (
    <div className="container-fluid mt-3 mt-md-5">
      <h1 className="mb-4">Product Management</h1>

      {/* Add/Edit Product Form */}
      <div className="row mb-5">
        <div className="col-12 col-md-6">
          <h3 className="mb-4">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addProduct();
            }}
          >
            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Product Name"
                value={isEditing ? editingProduct.name : newProduct.name}
                onChange={isEditing ? handleEditChange : handleInputChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="number"
                className="form-control"
                name="price"
                placeholder="Price"
                value={isEditing ? editingProduct.price : newProduct.price}
                onChange={isEditing ? handleEditChange : handleInputChange}
                min={0}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="number"
                className="form-control"
                name="oldPrice"
                placeholder="Old Price (optional)"
                value={
                  isEditing ? editingProduct.oldPrice : newProduct.oldPrice
                }
                onChange={isEditing ? handleEditChange : handleInputChange}
                min={0}
              />
            </div>
            <div className="form-group mb-3">
              <textarea
                className="form-control"
                name="description"
                placeholder="Description"
                value={
                  isEditing
                    ? editingProduct.description
                    : newProduct.description
                }
                onChange={isEditing ? handleEditChange : handleInputChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    setCategory(e.target.value);
                  }
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="inStock"
                name="inStock"
                checked={
                  isEditing ? editingProduct.inStock : newProduct.inStock
                }
                onChange={isEditing ? handleEditChange : handleInputChange}
              />
              <label className="form-check-label" htmlFor="inStock">
                In Stock
              </label>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="featured"
                name="featured"
                checked={
                  isEditing ? editingProduct.featured : newProduct.featured
                }
                onChange={isEditing ? handleEditChange : handleInputChange}
              />
              <label className="form-check-label" htmlFor="featured">
                Featured
              </label>
            </div>
            <div className="form-group mb-3">
              <input
                type="file"
                className="form-control"
                name="image"
                onChange={isEditing ? handleEditChange : handleInputChange}
                accept="image/*"
              />
            </div>
            {isEditing && editingProduct.image && (
              <div className="mb-3">
                <img
                  src={
                    typeof editingProduct.image === "string"
                      ? editingProduct.image
                      : URL.createObjectURL(editingProduct.image)
                  }
                  alt="Product preview"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </div>
            )}
            {!isEditing && newProduct.image && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(newProduct.image)}
                  alt="Product preview"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </div>
            )}
            {isEditing ? (
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={editProduct}
                >
                  Update Product
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button type="submit" className="btn btn-success">
                Add Product
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Search and Filter Products */}
      <div className="row mb-4 d-flex justify-content-between">
        <div className="col-md-6 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search Products"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <colgroup>
            <col style={{ width: "5%" }} /> {/* # column */}
            <col style={{ width: "30%" }} /> {/* Name column */}
            <col style={{ width: "15%" }} /> {/* Price column */}
            <col style={{ width: "15%" }} /> {/* Category column */}
            <col style={{ width: "20%" }} /> {/* Image column */}
            <col style={{ width: "15%" }} /> {/* Actions column */}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th
                onClick={() => handleSort("name")}
                style={{ cursor: "pointer" }}
              >
                Name{" "}
                {sortColumn === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => handleSort("price")}
                style={{ cursor: "pointer" }}
              >
                Price{" "}
                {sortColumn === "price" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => handleSort("category")}
                style={{ cursor: "pointer" }}
              >
                Category{" "}
                {sortColumn === "category" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Image</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts
              .slice(indexOfFirstProduct, indexOfLastProduct)
              .map((product, index) => (
                <tr key={product.id}>
                  <th scope="row">
                    {index + 1 + (currentPage - 1) * productsPerPage}
                  </th>
                  <td
                    className="text-truncate"
                    style={{ maxWidth: "200px" }}
                    title={product.name || "N/A"}
                  >
                    {product.name || "N/A"}
                  </td>
                  <td>${product.price || "N/A"}</td>
                  <td
                    className="text-truncate"
                    style={{ maxWidth: "150px" }}
                    title={getCategoryName(product.category)}
                  >
                    {getCategoryName(product.category)}
                  </td>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn me-2"
                      onClick={() => handleViewProduct(product)}
                    >
                      <i className="bi bi-eye" style={{ color: "gray" }}></i>
                    </button>
                    <button
                      className="btn me-2"
                      onClick={() => startEdit(product)}
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ color: "green" }}
                      ></i>
                    </button>
                    <button
                      className="btn"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <i className="bi bi-trash" style={{ color: "red" }}></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <label htmlFor="productsPerPage" className="me-2">
            Products per page:
          </label>
          <select
            id="productsPerPage"
            className="form-select"
            style={{ width: "auto" }}
            value={productsPerPage}
            onChange={(e) => setProductsPerPage(+e.target.value)}
          >
            {[5, 10, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
            </li>
            {renderPaginationItems()}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal fade show d-block" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Product Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Name:</strong> {selectedProduct.name}
                </p>
                <p>
                  <strong>Price:</strong> ${selectedProduct.price}
                </p>
                <p>
                  <strong>Old Price:</strong> ${selectedProduct.oldPrice}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {categories[selectedProduct.category]?.name || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedProduct.description
                    ? selectedProduct.description
                    : "N/A"}
                </p>
                <p>
                  <strong>In Stock:</strong>{" "}
                  {selectedProduct.inStock ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Featured:</strong>{" "}
                  {selectedProduct.featured ? "Yes" : "No"}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
