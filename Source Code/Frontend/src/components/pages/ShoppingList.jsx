import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../layout/ScrollToTop";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { ShoppingListContext } from "../contexts/ShoppingListContext";
import ShoppingListPathModal from "../pathfinding/ShoppingListPathModal";

const ShoppingList = () => {
  const { user } = useContext(UserContext);
  const { shoppingList, fetchShoppingList } = useContext(ShoppingListContext);
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [storeLayout, setStoreLayout] = useState({ items: [], gridSize: 50 });

  useEffect(() => {
    const loadShoppingList = async () => {
      if (!user) {
        setError("Please log in to view your shopping list");
        setLoaderStatus(false);
        return;
      }
      try {
        await fetchShoppingList();
      } catch (err) {
        setError("Failed to fetch shopping list");
      } finally {
        setLoaderStatus(false);
      }
    };

    loadShoppingList();
  }, [user]);

  useEffect(() => {}, [shoppingList]);

  useEffect(() => {
    const prefetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        // Check cache first
        const cacheKey = `shopping-path-${shoppingList.id}`;
        const cachedPath = localStorage.getItem(cacheKey);
        let pathDataFromCache = null;

        if (cachedPath && !isPathModalOpen) {
          // Don't use cache if modal is open
          const parsedCache = JSON.parse(cachedPath);
          const cacheTimestamp = parsedCache.timestamp;
          const now = Date.now();

          if (now - cacheTimestamp < 5 * 60 * 1000) {
            pathDataFromCache = parsedCache.path;
          }
        }

        // Fetch both layout and path data in parallel
        const [layoutRes, pathRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/store/layout/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          !pathDataFromCache
            ? axios.get("http://127.0.0.1:8000/shopping-list-path/", {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: { path: pathDataFromCache } }),
        ]);

        setStoreLayout(layoutRes.data);

        if (!pathDataFromCache) {
          const transformedPath = pathRes.data.path.map(([x, y]) => ({ x, y }));
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              path: transformedPath,
              timestamp: Date.now(),
            })
          );
          setPathData(transformedPath);
        } else {
          setPathData(pathDataFromCache);
        }
      } catch (err) {
        console.error("Failed to prefetch data:", err);
      }
    };

    if (shoppingList.id) {
      prefetchData();
    }
  }, [shoppingList.id, shoppingList.items, isPathModalOpen]); // Added isPathModalOpen dependency

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItems((prev) => ({ ...prev, [productId]: true }));
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `http://127.0.0.1:8000/shopping-lists/${shoppingList.id}/update-quantity/${productId}/`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchShoppingList();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError("Failed to update quantity.");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const togglePickedUp = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");
      const currentItem = transformedItems.find(
        (item) => item.product_id === productId
      );

      if (!currentItem) return;

      await axios.patch(
        `http://127.0.0.1:8000/shopping-lists/${shoppingList.id}/toggle-picked-up/${productId}/`,
        {
          picked_up: !currentItem.picked_up,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchShoppingList();
    } catch (err) {
      console.error("Failed to toggle picked up status:", err);
      setError("Failed to update product status.");
    }
  };

  const removeFromShoppingList = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(
        `http://127.0.0.1:8000/shopping-lists/${shoppingList.id}/remove-from-list/${productId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear the cached path since the shopping list has changed
      localStorage.removeItem(`shopping-path-${shoppingList.id}`);

      const cacheKey = `shopping-path-${shoppingList.id}`;
      // Reset path data and fetch new path
      setPathData(null);

      // Fetch new shopping list data
      await fetchShoppingList();

      // If modal is open, fetch new path immediately
      if (isPathModalOpen) {
        try {
          setIsPathLoading(true);
          const pathRes = await axios.get(
            "http://127.0.0.1:8000/shopping-list-path/",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const transformedPath = pathRes.data.path.map(([x, y]) => ({ x, y }));
          setPathData(transformedPath);

          // Update cache with new path
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              path: transformedPath,
              timestamp: Date.now(),
            })
          );
        } catch (err) {
          console.error("Failed to update path:", err);
          setPathError("Failed to update shopping path.");
        } finally {
          setIsPathLoading(false);
        }
      }
    } catch (err) {
      setError("Failed to remove product from shopping list.");
    }
  };

  // Update how we map the items to match the received structure
  const transformedItems =
    shoppingList.items?.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      price: parseFloat(item.product.price),
      quantity: item.quantity,
      picked_up: item.picked_up,
      total_price: item.total_price,
    })) || [];

  // Update total price calculation
  const totalPrice = transformedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const fetchShoppingPath = async () => {
    try {
      setIsPathLoading(true);
      setPathError(null);
      setIsPathModalOpen(true);

      const token = localStorage.getItem("access_token");

      // Check cache first
      const cacheKey = `shopping-path-${shoppingList.id}`;
      const cachedPath = localStorage.getItem(cacheKey);

      if (cachedPath) {
        const parsedPath = JSON.parse(cachedPath);
        const cacheTimestamp = parsedPath.timestamp;
        const now = Date.now();

        // Use cache if it's less than 5 minutes old
        if (now - cacheTimestamp < 5 * 60 * 1000) {
          setPathData(parsedPath.path);
          setIsPathLoading(false);
          return;
        }
      }

      // Fetch new path if cache is invalid or expired
      const pathRes = await axios.get(
        "http://127.0.0.1:8000/shopping-list-path/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const transformedPath = pathRes.data.path.map(([x, y]) => ({ x, y }));
      // Update cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          path: transformedPath,
          timestamp: Date.now(),
        })
      );
      setPathData(transformedPath);
    } catch (err) {
      console.error("Failed to fetch shopping path:", err);
      setPathError("Failed to generate shopping path. Please try again.");
    } finally {
      setIsPathLoading(false);
    }
  };

  // Clear cache when shopping list changes
  useEffect(() => {
    if (shoppingList.id) {
      localStorage.removeItem(`shopping-path-${shoppingList.id}`);
    }
  }, [shoppingList.items]);

  return (
    <div>
      <div>
        {loaderStatus ? (
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
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <ScrollToTop />
            <section className="my-14">
              <div className="container">
                <div className="row">
                  <div className="offset-lg-1 col-lg-10">
                    <div className="mb-8">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h1 className="mb-1">{shoppingList.name}</h1>
                          <p>
                            There are {shoppingList.items?.length || 0} products
                            in this Shopping List.
                          </p>
                        </div>
                        {shoppingList.items?.length > 0 && (
                          <button
                            className="btn btn-primary"
                            onClick={fetchShoppingPath}
                          >
                            <i className="bi bi-map me-2"></i>
                            Get Shopping Path
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="table-responsive">
                        <table className="table text-nowrap">
                          <thead className="table-light">
                            <tr>
                              <th
                                style={{ width: "5%" }}
                                className="text-center"
                              >
                                #
                              </th>
                              <th
                                style={{ width: "15%" }}
                                className="text-center"
                              >
                                Image
                              </th>
                              <th
                                style={{ width: "20%" }}
                                className="text-start"
                              >
                                Product Name
                              </th>
                              <th
                                style={{ width: "12%" }}
                                className="text-start"
                              >
                                Price
                              </th>
                              <th
                                style={{ width: "12%" }}
                                className="text-center"
                              >
                                Quantity
                              </th>
                              <th
                                style={{ width: "18%" }}
                                className="text-center"
                              >
                                Total
                              </th>
                              <th
                                style={{ width: "8%" }}
                                className="text-start"
                              >
                                Purchased
                              </th>
                              <th
                                style={{ width: "10%" }}
                                className="text-center"
                              >
                                Remove
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transformedItems.map((item, index) => (
                              <tr
                                key={item.product_id}
                                className={
                                  item.picked_up ? "table-success" : ""
                                }
                              >
                                <td className="align-middle text-center">
                                  {index + 1}
                                </td>
                                <td className="align-middle text-center">
                                  <Link to="#">
                                    <img
                                      src={item.image}
                                      className="img-fluid"
                                      style={{
                                        maxWidth: "60px",
                                        height: "auto",
                                      }}
                                      alt="item"
                                    />
                                  </Link>
                                </td>
                                <td className="align-middle text-start">
                                  <h5 className="fs-6 mb-0">
                                    <Link to="#" className="text-inherit">
                                      {item.name}
                                    </Link>
                                  </h5>
                                </td>
                                <td className="align-middle text-start">
                                  ${item.price}
                                </td>
                                <td className="align-middle">
                                  <div className="input-group input-group-sm quantity-controls">
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() =>
                                        updateQuantity(
                                          item.product_id,
                                          item.quantity - 1
                                        )
                                      }
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateQuantity(
                                          item.product_id,
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      min="1"
                                      style={{ width: "30px" }}
                                    />
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() =>
                                        updateQuantity(
                                          item.product_id,
                                          item.quantity + 1
                                        )
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="align-middle text-center">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </td>

                                <td className="align-middle">
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={item.picked_up}
                                      onChange={() =>
                                        togglePickedUp(item.product_id)
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="align-middle text-center">
                                  <button
                                    className="btn btn-link text-danger"
                                    onClick={() =>
                                      removeFromShoppingList(item.product_id)
                                    }
                                    title="Delete"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="4" className="text-end fw-bold">
                                Total:
                              </td>
                              <td className="fw-bold">
                                ${totalPrice.toFixed(2)}
                              </td>
                              <td colSpan="3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <ShoppingListPathModal
              isOpen={isPathModalOpen}
              onClose={() => {
                setIsPathModalOpen(false);
                setPathError(null);
              }}
              layout={storeLayout.items}
              path={pathData}
              gridSize={storeLayout.gridSize}
              isLoading={isPathLoading}
              error={pathError}
            />
          </>
        )}
      </div>
    </div>
  );
};
export default ShoppingList;
