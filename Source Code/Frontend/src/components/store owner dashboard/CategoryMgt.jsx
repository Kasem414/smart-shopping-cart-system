import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryManagement = () => {
  // State variables
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories from the server
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Retrieve the JWT from local storage
      console.log(token)
      const response = await axios.get("http://127.0.0.1:8000/categories/", {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT in the Authorization header
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Function to add a new category
  const addCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token'); // Retrieve the JWT from local storage
      const formData = new FormData();
      formData.append("name", newCategory.name);
      // if (newCategory.image) {
      //   formData.append("image", newCategory.image);
      // }

      const response = await axios.post("http://127.0.0.1:8000/categories/create/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Include the JWT in the Authorization header
        },
      });
      setCategories([...categories, response.data]);
      setNewCategory({ name: "", image: null });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Function to delete a category
  const deleteCategory = async (e, id) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Handle input changes for new category form
  const handleInputChange = (e) => {
    
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewCategory({ ...newCategory, image: files[0] });
    } else {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };

  // Filter and sort categories based on search term and sort order
  const filteredCategories = categories
    .filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle sort order
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Function to edit a category
  const editCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3006/categories/${editingCategory.id}`, editingCategory);
      
      setCategories(categories.map(cat => cat.id === editingCategory.id ? response.data : cat));
      setEditingCategory(null);
      
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  // Handle input changes for editing category form
  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEditingCategory({ ...editingCategory, newImage: files[0] });
    } else {
      setEditingCategory({ ...editingCategory, [name]: value });
    }
  };

  return (
    <div className="container-fluid mt-3 mt-md-5">
      <h2 className="mb-4">Category Management</h2>

      {/* Add/Edit Category Form */}
      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          {editingCategory ? (
            // Edit Category Form
            <form onSubmit={editCategory}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={editingCategory.name}
                  onChange={handleEditInputChange}
                  placeholder="Category Name"
                  required
                />
              </div>
              {/* <div className="form-group mb-3">
                <input
                  type="file"
                  className="form-control"
                  name="image"
                  onChange={handleEditInputChange}
                  accept="image/*"
                />
              </div> */}
              <button type="submit" className="btn btn-primary me-2">
                Update Category
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </button>
            </form>
          ) : (
            // Add New Category Form
            <form onSubmit={addCategory}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  placeholder="Category Name"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="file"
                  className="form-control"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </div>
              <button type="submit" className="btn btn-success">
                Add Category
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="mb-4">Category List</h3>

          {/* Search and Sort */}
          <div className="row mb-4">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <button className="btn btn-primary" onClick={handleSort}>
                Sort{" "}
                {sortOrder === "asc" ? (
                  <i className="bi bi-sort-alpha-down"></i>
                ) : (
                  <i className="bi bi-sort-alpha-down-alt"></i>
                )}
              </button>
            </div>
          </div>

          {/* Category List Items */}
          <ul className="list-group">
            {currentCategories.map((category) => (
              <li
                key={category.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                    />
                  )}
                  {category.name}
                </div>
                <div>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setEditingCategory(category)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={(e) => deleteCategory(e, category.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center mt-4">
              {Array.from(
                {
                  length: Math.ceil(
                    filteredCategories.length / categoriesPerPage
                  ),
                },
                (_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
