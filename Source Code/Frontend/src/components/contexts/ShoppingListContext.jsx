import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const [shoppingList, setShoppingList] = useState({
    id: null,
    name: "",
    items: [],
    total_cost: 0
  });
  const [itemCount, setItemCount] = useState(0);
  const { user } = useContext(UserContext);

  useEffect(() => {
    setItemCount(shoppingList.items?.length || 0);
  }, [shoppingList]);

  const fetchShoppingList = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://127.0.0.1:8000/shopping-lists/`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        const list = {
          ...response.data[0],
          items: response.data[0].items || []
        };
        setShoppingList(list);
        return list;
      } else {
        setShoppingList({ 
          id: null,
          name: "",
          items: [],
          total_cost: 0
        });
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch shopping list", err);
      setShoppingList({ 
        id: null,
        name: "",
        items: [],
        total_cost: 0
      });
      throw err;
    }
  };
  

  const createShoppingList = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/shopping-lists/",
        { 
          name: `${user.first_name}'s Shopping List`, 
          items: [] 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newList = {
        ...response.data,
        items: response.data.items || []
      };
      setShoppingList(newList);
      return newList;
    } catch (err) {
      console.error("Failed to create shopping list", err);
      throw err;
    }
  };
  

  const addToList = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // First, ensure we have the latest shopping list state
      let currentList = shoppingList;
      
      // If no list exists, create one
      if (!currentList || !currentList.id) {
        currentList = await createShoppingList();
      }

      // Check if product already exists in the list
      const existingItem = currentList.items.find(
        item => item.product.id === productId
      );

      if (existingItem) {
        // If product exists, update its quantity instead
        await axios.patch(
          `http://127.0.0.1:8000/shopping-lists/${currentList.id}/update-quantity/${productId}/`,
          {
            quantity: existingItem.quantity + 1
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // If product doesn't exist, add it as new
        await axios.post(
          `http://127.0.0.1:8000/shopping-lists/${currentList.id}/add-to-list/`,
          {
            product: [{
              product_id: productId,
              quantity: 1
            }]
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Fetch the updated list immediately after adding/updating
      await fetchShoppingList();
      
      // Return success message based on action taken
      return {
        success: true,
        message: existingItem 
          ? "Product quantity updated in shopping list!"
          : "Product added to shopping list!"
      };
      
    } catch (err) {
      console.error("Failed to add/update item in shopping list", err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchShoppingList();
    } else {
      setShoppingList({ 
        id: null,
        name: "",
        items: [],
        total_cost: 0
      });
    }
  }, [user]);

  return (
    <ShoppingListContext.Provider 
      value={{ 
        shoppingList, 
        setShoppingList, 
        fetchShoppingList, 
        addToList, 
        itemCount 
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};