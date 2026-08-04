import { useMemo, useState } from "react";
import { products, categories } from "./data";
import "./App.css";

function App() {
  const [productList, setProductList] = useState(
    products.map((product) => ({ ...product }))
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [amount, setAmount] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return productList;
    }

    return productList.filter(
      (product) => product.category === Number(selectedCategory)
    );
  }, [selectedCategory, productList]);

  const selectedProduct = productList.find(
    (product) => product.id === Number(selectedProductId)
  );

  const grandTotal = purchasedItems.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  function handleCategoryChange(event) {
    setSelectedCategory(event.target.value);
    setSelectedProductId("");
    setAmount(0);
    setErrorMessage("");
  }

  function handleProductChange(event) {
    setSelectedProductId(event.target.value);
    setAmount(0);
    setErrorMessage("");
  }

  function handleAddItem() {
    const purchaseAmount = Number(amount);

    if (!selectedProduct) {
      setErrorMessage("Please select a product.");
      return;
    }

    if (!Number.isInteger(purchaseAmount) || purchaseAmount <= 0) {
      setErrorMessage("Amount must be greater than zero.");
      return;
    }

    if (purchaseAmount > selectedProduct.inventory) {
      setErrorMessage(
        `Not enough items. Only ${selectedProduct.inventory} left.`
      );
      return;
    }

    const category = categories.find(
      (item) => item.id === selectedProduct.category
    );

    const discountedPrice =
      selectedProduct.sellPrice *
      (1 - selectedProduct.discount / 100);

    setPurchasedItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === selectedProduct.id
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.id === selectedProduct.id) {
            const newAmount = item.amount + purchaseAmount;

            return {
              ...item,
              amount: newAmount,
              subtotal: discountedPrice * newAmount,
            };
          }

          return item;
        });
      }

      return [
        ...currentItems,
        {
          ...selectedProduct,
          categoryTitle: category?.title || "",
          categoryIcon: category?.icon || "",
          amount: purchaseAmount,
          subtotal: discountedPrice * purchaseAmount,
        },
      ];
    });

    setProductList((currentProducts) =>
      currentProducts.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              inventory: product.inventory - purchaseAmount,
            }
          : product
      )
    );

    setAmount(0);
    setErrorMessage("");
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Point of Sale System</h1>

        <div className="form-row">
          <div className="form-group">
            <label>Select Category</label>

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="all">All</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Product</label>

            <select
              value={selectedProductId}
              onChange={handleProductChange}
            >
              <option value="">Please Select An Item</option>

              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group amount-group">
            <label>Amount</label>

            <div className="amount-controls">
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                disabled={!selectedProduct}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrorMessage("");
                }}
              />

              <button
                type="button"
                onClick={handleAddItem}
                disabled={
                  !selectedProduct ||
                  Number(amount) <= 0 ||
                  !Number.isInteger(Number(amount))
                }
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <p className="inventory-info">
            Available inventory: {selectedProduct.inventory}
          </p>
        )}

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {purchasedItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-message">
                    No purchased items
                  </td>
                </tr>
              ) : (
                purchasedItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>

                    <td>
                      <span className="category-cell">
                        <span className="category-icon">
                          {item.categoryIcon === "mouse" && "🖱️"}
                          {item.categoryIcon === "laptop" && "💻"}
                          {item.categoryIcon ===
                            "tablet-smartphone" && "📱"}
                          {item.categoryIcon === "headphones" && "🎧"}
                          {item.categoryIcon === "cable" && "🔌"}
                        </span>

                        {item.categoryTitle}
                      </span>
                    </td>

                    <td>
                      {item.sellPrice.toLocaleString()}
                    </td>

                    <td>{item.discount}%</td>

                    <td>{item.amount}</td>

                    <td>
                      {item.subtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grand-total">
          Total:{" "}
          {grandTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
