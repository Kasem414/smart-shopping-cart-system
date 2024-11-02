import React, { useState, useContext } from "react";
import Grocerylogo from "../../images/smartshop.png";
import menubanner from "../../images/menu-banner.jpg";
import { Link } from "react-router-dom";
import { ShoppingListContext } from "../contexts/ShoppingListContext";
import { UserContext } from "../contexts/UserContext";

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const { shoppingList } = useContext(ShoppingListContext);
  const itemCount = shoppingList.items.length;

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary fixed-top shadow-sm">
      <div style={{ height: '76px' }}></div>
      <div className="container-fluid">
        {/* Logo aligned to the left */}
        <Link className="navbar-brand" to="/">
          <img
            src={Grocerylogo}
            style={{ width: 115 }}
            alt="Smart Shopping Cart"
          />
        </Link>

        {/* Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation links aligned to the right */}
        <div
          className={`collapse navbar-collapse justify-content-end ${
            isOpen ? "show" : ""
          }`}
          id="navbarNav"
        >
          <ul className="navbar-nav d-flex align-items-center">
            {/* Home */}
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item dmenu dropdown">
              <Link className="nav-link" to="/product-list">
                Shop
              </Link>
            </li>

            {/* About */}
            <li className="nav-item dmenu dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                About
              </Link>
              <div
                className="dropdown-menu sm-menu"
                aria-labelledby="navbarDropdown"
              >
                <Link class="dropdown-item" to="/Blog">
                  Blog
                </Link>
                <Link className="dropdown-item" to="/BlogCategory">
                  Blog Category
                </Link>
                <Link className="dropdown-item" to="/AboutUs">
                  About us
                </Link>
                <Link className="dropdown-item" to="/Contact">
                  Contact
                </Link>
              </div>
            </li>

            {/* All serevices */}
            <li className="nav-item dropdown megamenu-li dmenu">
              <Link
                className="nav-link dropdown-toggle"
                to="/Shop"
                id="dropdown01"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                All Services
              </Link>
              <div
                className="dropdown-menu megamenu sm-menu border-top"
                aria-labelledby="dropdown01"
              >
                <div className="row">
                  <div className="col-sm-6 col-lg-3 border-right mb-4">
                    <div>
                      <h6 className="text-primary ps-3">
                        Dairy, Bread &amp; Eggs
                      </h6>
                      <Link className="dropdown-item" to="/Shop">
                        Butter
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Milk Drinks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Curd &amp; Yogurt
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Eggs
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Buns &amp; Bakery
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Cheese
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Condensed Milk
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Dairy Products
                      </Link>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3 border-right mb-4">
                    <div>
                      <h6 className="text-primary ps-3">
                        Breakfast &amp; Instant Food
                      </h6>
                      <Link className="dropdown-item" to="/Shop">
                        Breakfast Cereal
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Noodles, Pasta &amp; Soup
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Frozen Veg Snacks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Frozen Non-Veg Snacks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Vermicelli
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Instant Mixes
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Batter
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        {" "}
                        Fruit and Juices
                      </Link>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3 mb-4">
                    <div>
                      <h6 className="text-primary ps-3">
                        Cold Drinks &amp; Juices
                      </h6>
                      <Link className="dropdown-item" to="/Shop">
                        Soft Drinks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Fruit Juices
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Coldpress
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Water &amp; Ice Cubes
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Soda &amp; Mixers
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Health Drinks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Herbal Drinks
                      </Link>
                      <Link className="dropdown-item" to="/Shop">
                        Milk Drinks
                      </Link>
                    </div>
                  </div>

                  {/* <div className="row"> */}
                  <div className="col-sm-6 col-lg-3 border-right mb-4">
                    <div className="card border-0">
                      <img
                        src={menubanner}
                        style={{ width: "90%" }}
                        alt="eCommerce HTML Template"
                        className="img-fluid rounded-3"
                      />
                      <div className="position-absolute ps-6 mt-8">
                        <h5 className=" mb-0 ">
                          Dont miss this <br />
                          offer today.
                        </h5>
                        <Link
                          to="/Shop"
                          className="btn btn-primary btn-sm mt-3"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link position-relative text-muted"
                to="/shopping-list"
              >
                <i
                  className="bi bi-cart3"
                  style={{ fontSize: "1.5rem" }}
                  title="shopping list"
                ></i>
                {itemCount > 0 && (
                  <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-success">
                    {itemCount}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </Link>
            </li>

            {/* Conditional rendering based on user authentication */}
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-muted ms-5">
                    Welcome, {user.first_name} {user.last_name}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link text-muted border-0 bg-transparent"
                    onClick={logout}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className="bi bi-box-arrow-right"
                      style={{ fontSize: "1.5rem" }}
                      title="logout"
                    ></i>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-muted" to="/login">
                    <i
                      className="bi bi-box-arrow-in-right"
                      style={{ fontSize: "1.5rem" }}
                      title="login"
                    ></i>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-muted" to="/sign-up">
                    <i
                      className="bi bi-person-add"
                      style={{ fontSize: "1.5rem" }}
                      title="sign-up"
                    ></i>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
