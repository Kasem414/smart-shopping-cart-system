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
    old_price: "",
    description: "",
    available: true, // Changed from inStock to available
    featured: false,
    image: null,
    quantity: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  // When resetting filters
  const resetFilters = () => {
    setFilter("");
    setCategoryFilter("");
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://127.0.0.1:8000/products/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://127.0.0.1:8000/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    } else if (name === "category") {
      setCategory(value);
      setEditingProduct({
        ...editingProduct,
        category: value,
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
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      // Check if image is provided
      if (!newProduct.image) {
        alert("Please add a product image before submitting.");
        return;
      }

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
      if (category) {
        formData.append("category", category);
      } else {
        console.error("Category is not selected");
        return;
      }

      console.log("Sending product data:", Object.fromEntries(formData));

      const response = await axios.post(
        "http://127.0.0.1:8000/products/create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API response:", response.data);

      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        price: "",
        old_price: "",
        description: "",
        available: true,
        featured: false,
        image: null,
        quantity: "",
      });
      setCategory("");
      // handleCloseForm();
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Edit an existing product
  const editProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const formData = new FormData();

      // Append all product data to formData
      Object.keys(editingProduct).forEach((key) => {
        if (key === "image" && editingProduct[key] instanceof File) {
          formData.append("image", editingProduct[key]);
        } else if (key !== "image" && key !== "category") {
          formData.append(key, editingProduct[key]);
        }
      });

      // Append the category
      formData.append("category", category);

      const response = await axios.put(
        `http://127.0.0.1:8000/products/${editingProduct.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProducts = products.map((product) =>
        product.id === editingProduct.id ? response.data : product
      );
      setProducts(updatedProducts);
      setIsEditing(false);
      setEditingProduct(null);
      setCategory("");
      // handleCloseForm();
    } catch (error) {
      console.error("Error editing product:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert("Error editing product. Please check the console for details.");
    }
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: "",
      old_price: "",
      description: "",
      available: true,
      featured: false,
      image: null,
      quantity: "",
    });
    setCategory("");
  };

  // Start editing a product
  const startEdit = (product) => {
    setEditingProduct({ ...product });
    setCategory(product.category.toString()); // Convert to string if it's a number
    setIsEditing(true);
    setShowForm(true);
  };

  // Delete a product
  const deleteProduct = async (e, id) => {
    e.preventDefault();
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (confirmDelete) {
        const token = localStorage.getItem("access_token");
        await axios.delete(`http://127.0.0.1:8000/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Update the state to remove the deleted product
        setProducts(products.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
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

  // Filter products based on search input and category
  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(filter.toLowerCase()) &&
      (categoryFilter === "" || product.category.toString() === categoryFilter)
  );

  // Sort products based on selected column and order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortColumn === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortColumn === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
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

  const handleShowForm = () => setShowForm(true);
  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewProduct({
      name: "",
      price: "",
      old_price: "",
      description: "",
      available: true,
      featured: false,
      image: null,
      quantity: "",
    });
    setCategory("");
  };

  return (
    <div className="container-fluid mt-3 mt-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Product Management</h1>
        <button className="btn btn-primary" onClick={handleShowForm}>
          Add New Product
        </button>
      </div>

      <div
        className={`modal fade ${showForm ? "show" : ""}`}
        style={{ display: showForm ? "block" : "none" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseForm}
              ></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isEditing) {
                    editProduct(e);
                  } else {
                    addProduct(e);
                  }
                  // handleCloseForm();
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
                    name="old_price"
                    placeholder="Old Price (optional)"
                    value={
                      isEditing
                        ? editingProduct.old_price
                        : newProduct.old_price
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
                <div className="form-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    placeholder="Quantity"
                    value={
                      isEditing ? editingProduct.quantity : newProduct.quantity
                    }
                    onChange={isEditing ? handleEditChange : handleInputChange}
                    min={0}
                    required
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="available"
                    name="available"
                    defaultChecked={
                      isEditing
                        ? editingProduct.available
                        : newProduct.available
                    }
                    onChange={isEditing ? handleEditChange : handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="available">
                    Available
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
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="modal-backdrop fade show"
          onClick={handleCloseForm}
        ></div>
      )}

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
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <colgroup><col style={{ width: "5%" }}/><col style={{ width: "30%" }}/><col style={{ width: "15%" }}/><col style={{ width: "15%" }}/><col style={{ width: "15%" }}/><col style={{ width: "20%" }}/></colgroup>
          <thead><tr>
            <th scope="col">#</th>
            <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
              Name {sortColumn === "name" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
              Price {sortColumn === "price" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th>Category</th>
            <th>Image</th>
            <th scope="col" style={{ textAlign: "center" }}>Actions</th>
          </tr></thead>
          <tbody>
            {sortedProducts
              .slice(indexOfFirstProduct, indexOfLastProduct)
              .map((product, index) => (
                <tr key={product.id}>
                  <th scope="row">{index + 1 + (currentPage - 1) * productsPerPage}</th>
                  <td className="text-truncate" style={{ maxWidth: "200px" }} title={product.name || "N/A"}>{product.name || "N/A"}</td>
                  <td>${product.price || "N/A"}</td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }} title={getCategoryName(product.category)}>{getCategoryName(product.category)}</td>
                  <td>{product.image ? (
                    <img src={product.image} alt={product.name} style={{width: "50px", height: "50px", objectFit: "cover"}}/>
                  ) : "No Image"}</td>
                  <td style={{textAlign: "center"}}>
                    <button
                      className="btn me-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewProduct(product);
                      }}
                    >
                      <i className="bi bi-eye" style={{ color: "gray" }}></i>
                    </button>
                    <button
                      className="btn me-2"
                      onClick={(e) => {
                        e.preventDefault();
                        startEdit(product);
                      }}
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ color: "green" }}
                      ></i>
                    </button>
                    <button
                      className="btn"
                      onClick={(e) => deleteProduct(e, product.id)}
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
                  <strong>Old Price:</strong> ${selectedProduct.old_price}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedProduct.quantity}
                </p>{" "}
                {/* Moved to modal */}
                <p>
                  <strong>Category:</strong>{" "}
                  {getCategoryName(selectedProduct.category)}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedProduct.description
                    ? selectedProduct.description
                    : "N/A"}
                </p>
                <p>
                  <strong>In Stock:</strong>{" "}
                  {selectedProduct.available ? "Yes" : "No"}
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

const styles = `
  .modal-open {
    overflow: hidden;
  }
  
  .modal {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal.show {
    display: block;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ProductManagement;
