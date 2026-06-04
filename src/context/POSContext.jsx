import React, { createContext, useState, useEffect } from 'react';

export const POSContext = createContext();

const API_URL = 'http://localhost:3001/api';

const initialSellers = [
  { id: 1, name: "Robertinho", salesTotal: 1500 },
  { id: 2, name: "Maria", salesTotal: 2300 },
  { id: 3, name: "João", salesTotal: 800 },
];

export const POSProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [sales, setSales] = useState([]);
  const [sellers, setSellers] = useState(initialSellers);
  const [cancellations, setCancellations] = useState(0);

  // Carregar produtos do banco de dados na inicialização
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/produtos`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos do banco:", error);
      }
    };
    fetchProducts();
  }, []);

  // Cart Functions
  const cartItems = Object.values(cart);
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: prev[product.id]
        ? { ...prev[product.id], qty: prev[product.id].qty + 1 }
        : { ...product, qty: 1 },
    }));
  };

  const incQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: prev[id].qty + 1 },
    }));
  };

  const decQty = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id].qty <= 1) delete next[id];
      else next[id] = { ...next[id], qty: next[id].qty - 1 };
      return next;
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const finalizeSale = async (method, received, change) => {
    try {
      // Registrar no banco de dados via API
      const response = await fetch(`${API_URL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: totalPrice,
          items: cartItems.map(item => ({ id: item.id, qty: item.qty, price: item.price }))
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar venda');
      }

      const newSale = {
        id: Date.now(),
        date: new Date().toISOString(),
        total: totalPrice,
        method,
        items: cartItems,
      };
      
      // Decrease stock locally
      const nextProducts = products.map(p => {
        const cartItem = cart[p.id];
        if (cartItem && p.stock !== 999) { // 999 for services
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      });
      setProducts(nextProducts);

      // Add sale
      setSales(prev => [...prev, newSale]);
      
      // Add to Robertinho
      setSellers(prev => prev.map(s => s.id === 1 ? { ...s, salesTotal: s.salesTotal + totalPrice } : s));
      
      clearCart();
    } catch (error) {
      console.error("Erro ao finalizar a venda no banco:", error);
      alert("Houve um erro ao registrar a venda no banco de dados.");
    }
  };
  
  // Product Functions (with API calls)
  const addProduct = async (product) => {
    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        const newProd = await response.json();
        setProducts(prev => [...prev, { ...product, id: newProd.id, icon: product.icon || "📦" }]);
      }
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  };
  
  const updateProduct = async (id, updatedFields) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
  };
  
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
    }
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        cartItems,
        totalQty,
        totalPrice,
        sales,
        sellers,
        cancellations,
        addToCart,
        incQty,
        decQty,
        removeItem,
        clearCart,
        finalizeSale,
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </POSContext.Provider>
  );
};
