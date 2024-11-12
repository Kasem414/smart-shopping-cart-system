import ViewStrategy from './ViewStrategy';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const GridContainer = styled.div`
  &.row {
    --bs-gutter-x: 1.5rem;
    --bs-gutter-y: 1.5rem;
  }
`;

const ProductCard = styled.div`
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(0,0,0,0.1);
  height: 100%;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .badge {
    z-index: 2;
  }

  .product-image {
    height: 200px;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover .product-image {
    transform: scale(1.05);
  }

  .image-container {
    overflow: hidden;
    border-radius: 4px;
  }

  .category-link {
    font-size: 0.75rem;
    text-decoration: none;
    color: #6c757d;

    &:hover {
      color: #45930F;
    }
  }

  .product-title {
    margin-bottom: 0.5rem;
    line-height: 1.2;
    
    a {
      color: inherit;
      text-decoration: none;
      
      &:hover {
        color: #45930F;
      }
    }
  }

  .old-price {
    font-size: 0.75rem;
    color: #6c757d;
  }

  .add-button {
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }

  @media (max-width: 576px) {
    .product-image {
      height: 150px;
    }
  }
`;

class GridView extends ViewStrategy {
  render(products, categories, user, addToList, setError) {
    return (
      <GridContainer className="row g-4 row-cols-xl-4 row-cols-lg-3 row-cols-2 row-cols-md-2 mt-2">
        {products.map((product) => (
          <div className="col" key={product.id}>
            <ProductCard className="card card-product">
              <div className="card-body">
                {/* Product Image & Badges */}
                <div className="text-center position-relative image-container">
                  <div className="position-absolute top-0 start-0">
                    {product.featured && (
                      <span className="badge bg-primary">Featured</span>
                    )}
                    {product.available === false && (
                      <span className="badge bg-danger">Out of Stock</span>
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
                  
                  {/* Product Image */}
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mb-3 img-fluid product-image"
                    />
                  </Link>
                </div>

                {/* Product Category */}
                <div className="mb-1">
                  <Link 
                    to={`/category/${product.category}`}
                    className="category-link"
                  >
                    {categories.find((cat) => cat.id === product.category)?.name}
                  </Link>
                </div>

                {/* Product Title */}
                <h2 className="product-title fs-6">
                  <Link to={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h2>

                {/* Product Price */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="text-dark">${product.price}</span>
                    {product.old_price && (
                      <span className="text-decoration-line-through old-price ms-2">
                        ${product.old_price}
                      </span>
                    )}
                  </div>

                  {/* Add to List Button */}
                  <button
                    className="btn btn-primary btn-sm add-button"
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
                    <i className="bi bi-plus"></i> Add
                  </button>
                </div>
              </div>
            </ProductCard>
          </div>
        ))}
      </GridContainer>
    );
  }
}

export default GridView;