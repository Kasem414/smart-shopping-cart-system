import ViewStrategy from './ViewStrategy';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin-top: 1rem;
`;

const ProductCard = styled.div`
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .product-image {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }

  .image-container {
    width: 300px;
    height: 230px;
    overflow: hidden;
    border-radius: 4px;
  }

  .product-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.15rem;
    
    a {
      text-decoration: none;
      color: inherit;
      
      &:hover {
        color: #45930F;
      }
    }
  }

  .category-link {
    text-decoration: none;
    color: #6c757d;
    font-size: 0.8rem;
    
    &:hover {
      color: #45930F;
    }
  }

  .product-description {
    color: #6c757d;
    font-size: 0.75rem;
    margin: 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price-container {
    .current-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .old-price {
      text-decoration: line-through;
      color: #6c757d;
      margin-left: 0.5rem;
    }

    .discount-badge {
      background-color: #dc3545;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.65rem;
      margin-left: 0.5rem;
    }
  }

  .add-button {
    transition: all 0.2s ease;
    font-size: 0.75rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.5em 0.75em;
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    .image-container {
      height: 200px;
    }
  }
`;

class ListView extends ViewStrategy {
  render(products, categories, user, addToList, setError) {
    return (
      <ListContainer>
        {products.map((product) => (
          <ProductCard className="card" key={product.id}>
            <div className="row g-0">
              <div className="col-md-4">
                <div className="image-container">
                  <Link to={`/product-details/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </Link>
                </div>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  {/* Badges */}
                  <div className="mb-2">
                    {product.featured && (
                      <span className="badge bg-primary">Featured</span>
                    )}
                    {product.available === false && (
                      <span className="badge bg-danger">Out of Stock</span>
                    )}
                  </div>

                  {/* Category */}
                  <Link 
                    to={`/category/${product.category}`}
                    className="category-link"
                  >
                    {categories.find((cat) => cat.id === product.category)?.name}
                  </Link>

                  {/* Title */}
                  <h2 className="product-title mt-1">
                    <Link to={`/product-details/${product.id}`}>
                      {product.name}
                    </Link>
                  </h2>

                  {/* Description */}
                  <p className="product-description">
                    {product.description}
                  </p>

                  {/* Price and Action */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="price-container">
                      <span className="current-price">
                        ${product.price}
                      </span>
                      {product.old_price && (
                        <>
                          <span className="old-price">
                            ${product.old_price}
                          </span>
                          <span className="discount-badge">
                            {Math.round(
                              ((product.old_price - product.price) /
                                product.old_price) *
                                100
                            )}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      className="btn btn-primary add-button"
                      onClick={async () => {
                        if (!user) {
                          alert("Please log in to add products to your shopping list.");
                          return;
                        }
                        try {
                          const result = await addToList(product.id);
                          alert(result.message);
                        } catch (err) {
                          console.error("Failed to add product:", err);
                          setError("Failed to add product to shopping list");
                        }
                      }}
                      disabled={!user || user.account_type !== "customer"}
                    >
                      <i className="bi bi-plus"></i> Add to List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ProductCard>
        ))}
      </ListContainer>
    );
  }
}

export default ListView;