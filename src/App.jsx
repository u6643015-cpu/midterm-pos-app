import { useMemo, useState } from "react";
import { products, categories } from "./assets/data";

import {
  Cable,
  Headphones,
  Laptop,
  Mouse,
  Settings,
  TabletSmartphone,
} from "lucide-react";

function CategoryIcon({ category }) {
  switch (category?.icon) {
    case "mouse":
      return <Mouse className="h-5 w-5 text-blue-600" />;

    case "laptop":
      return <Laptop className="h-5 w-5 text-blue-600" />;

    case "tablet-smartphone":
      return <TabletSmartphone className="h-5 w-5 text-blue-600" />;

    case "headphones":
      return <Headphones className="h-5 w-5 text-blue-600" />;

    case "cable":
      return <Cable className="h-5 w-5 text-blue-600" />;

    default:
      return <Settings className="h-5 w-5 text-blue-600" />;
  }
}

export default function Home() {
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

  function handleAmountChange(event) {
    setAmount(event.target.value);
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
        `Not enough inventory. Only ${selectedProduct.inventory} item(s) available.`
      );
      return;
    }

    const category = categories.find(
      (categoryItem) =>
        categoryItem.id === selectedProduct.category
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
            const updatedAmount =
              item.amount + purchaseAmount;

            return {
              ...item,
              amount: updatedAmount,
              subtotal: discountedPrice * updatedAmount,
            };
          }

          return item;
        });
      }

      return [
        ...currentItems,
        {
          ...selectedProduct,
          categoryData: category,
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
              inventory:
                product.inventory - purchaseAmount,
            }
          : product
      )
    );

    setAmount(0);
    setErrorMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">
          Point of Sale System
        </h1>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Select Category
            </label>

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full rounded-md border border-slate-400 bg-white p-2"
            >
              <option value="all">All</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Select Product
            </label>

            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="w-full rounded-md border border-slate-400 bg-white p-2"
            >
              <option value="">
                Please Select An Item
              </option>

              {filteredProducts.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Amount
            </label>

            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={handleAmountChange}
                disabled={!selectedProduct}
                className="min-w-0 flex-1 rounded-md border border-slate-400 p-2 disabled:cursor-not-allowed disabled:bg-slate-200"
              />

              <button
                type="button"
                onClick={handleAddItem}
                disabled={
                  !selectedProduct ||
                  Number(amount) <= 0 ||
                  !Number.isInteger(Number(amount))
                }
                className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <div className="mt-5 rounded-md bg-blue-50 p-3 text-blue-800">
            Available inventory:{" "}
            <strong>{selectedProduct.inventory}</strong>
          </div>
        )}

        {errorMessage && (
          <div className="mt-5 rounded-md border border-red-300 bg-red-50 p-3 font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-400 p-3">
                  #
                </th>

                <th className="border border-slate-400 p-3">
                  ID
                </th>

                <th className="border border-slate-400 p-3">
                  Item
                </th>

                <th className="border border-slate-400 p-3">
                  Category
                </th>

                <th className="border border-slate-400 p-3">
                  Price
                </th>

                <th className="border border-slate-400 p-3">
                  Discount
                </th>

                <th className="border border-slate-400 p-3">
                  Amount
                </th>

                <th className="border border-slate-400 p-3">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {purchasedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="border border-slate-400 p-8 text-center text-slate-500"
                  >
                    No purchased items
                  </td>
                </tr>
              ) : (
                purchasedItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-slate-400 p-3 text-center">
                      {index + 1}
                    </td>

                    <td className="border border-slate-400 p-3">
                      {item.id}
                    </td>

                    <td className="border border-slate-400 p-3">
                      {item.title}
                    </td>

                    <td className="border border-slate-400 p-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          category={item.categoryData}
                        />

                        <span>
                          {item.categoryData?.title}
                        </span>
                      </div>
                    </td>

                    <td className="border border-slate-400 p-3 text-right">
                      {item.sellPrice.toLocaleString()}
                    </td>

                    <td className="border border-slate-400 p-3 text-center">
                      {item.discount}%
                    </td>

                    <td className="border border-slate-400 p-3 text-center">
                      {item.amount}
                    </td>

                    <td className="border border-slate-400 p-3 text-right font-semibold">
                      {item.subtotal.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right text-2xl font-bold text-blue-700">
          Total:{" "}
          {grandTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </main>
  );
}
