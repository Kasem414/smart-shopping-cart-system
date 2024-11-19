import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CategoryTag = styled.div`
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }

  button {
    border: none;
    background: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #ef4444;
    }
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
`;

const CategoryOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  input {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    border: 2px solid #94a3b8;
    cursor: pointer;
  }

  span {
    font-size: 0.875rem;
    color: #475569;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  ${props => props.primary ? `
    background: #3b82f6;
    color: white;
    border: none;

    &:hover {
      background: #2563eb;
    }
  ` : `
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #f1f5f9;
    }
  `}
`;

const ShelfCategoryModal = ({ isOpen, onClose, categories = [], onSave }) => {
  const [currentCategories, setCurrentCategories] = useState(categories);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/categories/');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setAvailableCategories(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setCurrentCategories(selectedOptions);
  };

  const handleSave = () => {
    onSave(currentCategories);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Manage Shelf Categories</Title>
        
        <CategoryList>
          {currentCategories.map((category, index) => (
            <CategoryTag key={index}>
              {category}
              <button onClick={() => setCurrentCategories(currentCategories.filter((_, i) => i !== index))}>
                <i className="bi bi-x-circle" />
              </button>
            </CategoryTag>
          ))}
        </CategoryList>

        {isLoading ? (
          <div>Loading categories...</div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>{error}</div>
        ) : (
          <CategoryGrid>
            {availableCategories.map((category) => (
              <CategoryOption key={category.id}>
                <input
                  type="checkbox"
                  checked={currentCategories.includes(category.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCurrentCategories([...currentCategories, category.name]);
                    } else {
                      setCurrentCategories(
                        currentCategories.filter((cat) => cat !== category.name)
                      );
                    }
                  }}
                />
                <span>{category.name}</span>
              </CategoryOption>
            ))}
          </CategoryGrid>
        )}

        <ButtonGroup>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary onClick={handleSave}>Save Changes</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ShelfCategoryModal; 