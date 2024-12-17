// src/ProductDetails.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import { UserContext } from "../contexts/UserContext";
import { ShoppingListContext } from "../contexts/ShoppingListContext";
import styled from "styled-components";

// Add the Message styled component
const Message = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: ${({ $success }) => ($success ? "#4caf50" : "#f44336")};
  color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: opacity 0.3s ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? "visible" : "hidden")};
  pointer-events: none;
`;

const ProductDetails = () => {
  const { user } = useContext(UserContext);
  const { addToList } = useContext(ShoppingListContext);
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [categoryName, setCategoryName] = useState(""); // State for category name
  const [message, setMessage] = useState({
    text: "",
    success: true,
    visible: false,
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/catalog/details/${productId}/`
        );
        const data = await response.json();
        setProduct(data.data);
        console.log(product);

        // Fetch category name if product data is available
        if (data.data.category) {
          const categoryResponse = await fetch(
            `http://127.0.0.1:8000/categories/${data.data.category}`
          );
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.name);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchProductData();
  }, [productId]);

  if (loading) {
    return (
      <div className="loader-container">
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
    );
  }

  if (!product) return <div>Loading...</div>;

  // Helper function to show message
  const showMessage = (text, success = true) => {
    setMessage({ text, success, visible: true });
    setTimeout(() => {
      setMessage((prev) => ({ ...prev, visible: false }));
    }, 1500);
  };
  return (
    <>
      <Message $success={message.success} $isVisible={message.visible}>
        {message.text}
      </Message>
      <section className="mt-8">
        <div className="container">
          <div className="row">
            <div className="col-md-5 col-xl-6">
              <div className="product" id="product">
                <img width={400} src={product.get_image} alt={product.name} />
              </div>
            </div>
            <div className="col-md-7 col-xl-6">
              <div className="ps-lg-10 mt-6 mt-md-0">
                <a href="#!" className="mb-4 d-block">
                  {categoryName}
                </a>
                <h1 className="mb-1">{product.name}</h1>
                <div className="mb-4">
                  <small className="text-warning">
                    {Array.from({ length: 5 }, (_, index) => (
                      <i
                        key={index}
                        className={`bi bi-star${
                          index < product.rating ? "-fill" : ""
                        }`}
                      ></i>
                    ))}
                  </small>
                  <a href="#" className="ms-2">
                    ({product.reviews} reviews)
                  </a>
                </div>
                <div className="fs-4">
                  <span className="fw-bold text-dark">${product.price}</span>
                  {product.old_price && (
                    <>
                      <span className="text-decoration-line-through text-muted ms-4">
                        ${product.old_price}
                      </span>
                      <span>
                        <small className="fs-6 ms-2 text-danger ms-3">
                          {Math.round(
                            ((product.old_price - product.price) /
                              product.old_price) *
                              100
                          )}
                          % Off
                        </small>
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-5 row justify-content-start g-2 align-items-center">
                  <div className="col-xxl-4 col-lg-4 col-md-5 col-5 d-grid">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={async () => {
                        if (!user) {
                          showMessage(
                            "Please log in to add products to your shopping list.",
                            false
                          );
                          return;
                        }
                        try {
                          const result = await addToList(product.id);
                          showMessage(result.message, true);
                        } catch (err) {
                          console.error("Failed to add product:", err);
                          showMessage(
                            "Failed to add product to shopping list",
                            false
                          );
                        }
                      }}
                    >
                      <i className="feather-icon icon-shopping-bag me-2"></i>
                      Add to list
                    </button>
                  </div>
                </div>
                <hr className="my-6" />
                <div>
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td>Product Code:</td>
                        <td>#{product.id}</td>
                      </tr>
                      <tr>
                        <td>Availability:</td>
                        <td>{product.available ? "Yes" : "No"}</td>
                      </tr>
                      <tr>
                        <td>Type:</td>
                        <td>{product.category}</td>
                      </tr>
                      <tr>
                        <td>Shipping:</td>
                        <td>
                          <small>
                            {product.shipping}
                            <span className="text-muted">
                              ( Free pickup today)
                            </span>
                          </small>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-4">
                    <Link 
                      to={`/product-location/${product.id}`}
                      className="btn btn-primary d-flex align-items-center gap-2 w-100 justify-content-center"
                    >
                      <i className="bi bi-map-fill"></i>
                      Find in Store
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-lg-14 mt-8">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul
                className="nav nav-pills nav-lb-tab"
                id="myTab"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="product-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#product-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="product-tab-pane"
                    aria-selected="true"
                  >
                    Product Details
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="details-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#details-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="details-tab-pane"
                    aria-selected="false"
                  >
                    Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="reviews-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#reviews-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="reviews-tab-pane"
                    aria-selected="false"
                  >
                    Reviews
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="product-tab-pane"
                  role="tabpanel"
                  aria-labelledby="product-tab"
                  tabindex="0"
                >
                  <div className="my-8">
                    <div className="mb-5">
                      <h4 className="mb-1">Nutrient Value & Benefits</h4>
                      <p className="mb-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Nisi, tellus iaculis urna bibendum in lacus, integer. Id
                        imperdiet vitae varius sed magnis eu nisi nunc sit. Vel,
                        varius habitant ornare ac rhoncus. Consequat risus
                        facilisis ante ipsum netus risus adipiscing sagittis
                        sed. Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit.
                      </p>
                    </div>
                    <div className="mb-5">
                      <h5 className="mb-1">Storage Tips</h5>
                      <p className="mb-0">
                        Nisi, tellus iaculis urna bibendum in lacus, integer. Id
                        imperdiet vitae varius sed magnis eu nisi nunc sit. Vel,
                        varius habitant ornare ac rhoncus. Consequat risus
                        facilisis ante ipsum netus risus adipiscing sagittis
                        sed.Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit.
                      </p>
                    </div>
                    <div className="mb-5">
                      <h5 className="mb-1">Unit</h5>
                      <p className="mb-0">3 units</p>
                    </div>
                    <div className="mb-5">
                      <h5 className="mb-1">Seller</h5>
                      <p className="mb-0">DMart Pvt. LTD</p>
                    </div>
                    <div>
                      <h5 className="mb-1">Disclaimer</h5>
                      <p className="mb-0">
                        Image shown is a representation and may slightly vary
                        from the actual product. Every effort is made to
                        maintain accuracy of all information displayed.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="details-tab-pane"
                  role="tabpanel"
                  aria-labelledby="details-tab"
                  tabindex="0"
                >
                  <div className="my-8">
                    <div className="row">
                      <div className="col-12">
                        <h4 className="mb-4">Details</h4>
                      </div>
                      <div className="col-12 col-lg-6">
                        <table className="table table-striped">
                          <tbody>
                            <tr>
                              <th>Weight</th>
                              <td>1000 Grams</td>
                            </tr>
                            <tr>
                              <th>Ingredient Type</th>
                              <td>Vegetarian</td>
                            </tr>
                            <tr>
                              <th>Brand</th>
                              <td>Dmart</td>
                            </tr>
                            <tr>
                              <th>Item Package Quantity</th>
                              <td>1</td>
                            </tr>
                            <tr>
                              <th>Form</th>
                              <td>Larry the Bird</td>
                            </tr>
                            <tr>
                              <th>Manufacturer</th>
                              <td>Dmart</td>
                            </tr>
                            <tr>
                              <th>Net Quantity</th>
                              <td>340.0 Gram</td>
                            </tr>
                            <tr>
                              <th>Product Dimensions</th>
                              <td>9.6 x 7.49 x 18.49 cm</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-12 col-lg-6">
                        <table className="table table-striped">
                          <tbody>
                            <tr>
                              <th>ASIN</th>
                              <td>SB0025UJ75W</td>
                            </tr>
                            <tr>
                              <th>Best Sellers Rank</th>
                              <td>#2 in Fruits</td>
                            </tr>
                            <tr>
                              <th>Date First Available</th>
                              <td>30 April 2022</td>
                            </tr>
                            <tr>
                              <th>Item Weight</th>
                              <td>500g</td>
                            </tr>
                            <tr>
                              <th>Generic Name</th>
                              <td>Banana Robusta</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="reviews-tab-pane"
                  role="tabpanel"
                  aria-labelledby="reviews-tab"
                  tabindex="0"
                >
                  <div className="my-8">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-10">
                          <div className="mb-8">
                            <h4>Reviews</h4>
                          </div>
                          <div className="d-flex border-bottom pb-6 mb-6">
                            <img
                              src="../assets/images/avatar/avatar-10.jpg"
                              alt=""
                              className="rounded-circle avatar-lg"
                            />
                            <div className="ms-5">
                              <h6 className="mb-1">Shankar Subbaraman</h6>
                              <p className="small">
                                <span className="text-muted">
                                  30 December 2022
                                </span>
                                <span className="text-primary ms-3 fw-bold">
                                  Verified Purchase
                                </span>
                              </p>
                              <div className="mb-2">
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <span className="ms-3 text-dark fw-bold">
                                  Need to recheck the weight at delivery point
                                </span>
                              </div>
                              <p>
                                Product quality is good. But, weight seemed less
                                than 1kg. Since it is being sent in open
                                package, there is a possibility of pilferage in
                                between. FreshCart sends the veggies and fruits
                                through sealed plastic covers and Barcode on the
                                weight etc. .
                              </p>
                              <div>
                                <div className="border icon-shape icon-lg border-2">
                                  <img
                                    src="../assets/images/products/product-img-1.jpg"
                                    alt=""
                                    className="img-fluid"
                                  />
                                </div>
                                <div className="border icon-shape icon-lg border-2 ms-1">
                                  <img
                                    src="../assets/images/products/product-img-2.jpg"
                                    alt=""
                                    className="img-fluid"
                                  />
                                </div>
                                <div className="border icon-shape icon-lg border-2 ms-1">
                                  <img
                                    src="../assets/images/products/product-img-3.jpg"
                                    alt=""
                                    className="img-fluid"
                                  />
                                </div>
                              </div>
                              <div className="d-flex justify-content-end mt-4">
                                <a href="#" className="text-muted">
                                  <i className="feather-icon icon-thumbs-up me-1"></i>
                                  Helpful
                                </a>
                                <a href="#" className="text-muted ms-4">
                                  <i className="feather-icon icon-flag me-2"></i>
                                  Report abuse
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex border-bottom pb-6 mb-6 pt-4">
                            <img
                              src="../assets/images/avatar/avatar-12.jpg"
                              alt=""
                              className="rounded-circle avatar-lg"
                            />
                            <div className="ms-5">
                              <h6 className="mb-1">Robert Thomas</h6>
                              <p className="small">
                                <span className="text-muted">
                                  29 December 2022
                                </span>
                                <span className="text-primary ms-3 fw-bold">
                                  Verified Purchase
                                </span>
                              </p>
                              <div className="mb-2">
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star text-warning"></i>
                                <span className="ms-3 text-dark fw-bold">
                                  Need to recheck the weight at delivery point
                                </span>
                              </div>
                              <p>
                                Product quality is good. But, weight seemed less
                                than 1kg. Since it is being sent in open
                                package, there is a possibility of pilferage in
                                between. FreshCart sends the veggies and fruits
                                through sealed plastic covers and Barcode on the
                                weight etc. .
                              </p>
                              <div className="d-flex justify-content-end mt-4">
                                <a href="#" className="text-muted">
                                  <i className="feather-icon icon-thumbs-up me-1"></i>
                                  Helpful
                                </a>
                                <a href="#" className="text-muted ms-4">
                                  <i className="feather-icon icon-flag me-2"></i>
                                  Report abuse
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex border-bottom pb-6 mb-6 pt-4">
                            <img
                              src="../assets/images/avatar/avatar-9.jpg"
                              alt=""
                              className="rounded-circle avatar-lg"
                            />
                            <div className="ms-5">
                              <h6 className="mb-1">Barbara Tay</h6>
                              <p className="small">
                                <span className="text-muted">
                                  28 December 2022
                                </span>
                                <span className="text-danger ms-3 fw-bold">
                                  Unverified Purchase
                                </span>
                              </p>
                              <div className="mb-2">
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star text-warning"></i>
                                <span className="ms-3 text-dark fw-bold">
                                  Need to recheck the weight at delivery point
                                </span>
                              </div>
                              <p>
                                Everytime i ordered from fresh i got greenish
                                yellow bananas just like i wanted so go for it ,
                                its happens very rare that u get over riped
                                ones.
                              </p>
                              <div className="d-flex justify-content-end mt-4">
                                <a href="#" className="text-muted">
                                  <i className="feather-icon icon-thumbs-up me-1"></i>
                                  Helpful
                                </a>
                                <a href="#" className="text-muted ms-4">
                                  <i className="feather-icon icon-flag me-2"></i>
                                  Report abuse
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex border-bottom pb-6 mb-6 pt-4">
                            <img
                              src="../assets/images/avatar/avatar-8.jpg"
                              alt=""
                              className="rounded-circle avatar-lg"
                            />
                            <div className="ms-5 flex-grow-1">
                              <h6 className="mb-1">Sandra Langevin</h6>
                              <p className="small">
                                <span className="text-muted">
                                  8 December 2022
                                </span>
                                <span className="text-danger ms-3 fw-bold">
                                  Unverified Purchase
                                </span>
                              </p>
                              <div className="mb-2">
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star-fill text-warning"></i>
                                <i className="bi bi-star text-warning"></i>
                                <span className="ms-3 text-dark fw-bold">
                                  Great product
                                </span>
                              </div>
                              <p>
                                Great product & package. Delivery can be
                                expedited.
                              </p>
                              <div className="d-flex justify-content-end mt-4">
                                <a href="#" className="text-muted">
                                  <i className="feather-icon icon-thumbs-up me-1"></i>
                                  Helpful
                                </a>
                                <a href="#" className="text-muted ms-4">
                                  <i className="feather-icon icon-flag me-2"></i>
                                  Report abuse
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
