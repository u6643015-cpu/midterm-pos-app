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

function CategoryIcon(category) {
  switch (category.icon) {
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
  const grandTotal = purchasedItems.reduce((total, item) => {
    return total + item.subtotal;
  }, 0);
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
    const value = event.target.value;
    if (value === "") {
      setAmount("");
      setErrorMessage("");
      return;
    }
    setAmount(Number(value));
    setErrorMessage("");
  }
  function handleAddItem() {
    setErrorMessage("");
    if (!selectedProduct) {
      setErrorMessage("Please select a product.");
      return;
    }
    const purchaseAmount = Number(amount);
    if (!Number.isInteger(purchaseAmount) || purchaseAmount <= 0) {
      setErrorMessage("Purchase amount must be greater than zero.");
      return;
    }
    if (purchaseAmount > selectedProduct.inventory) {
      setErrorMessage(
        `Not enough items. Only ${selectedProduct.inventory} left.`
      );
      return;
    }
    const priceAfterDiscount =
      selectedProduct.sellPrice * (1 - selectedProduct.discount / 100);
    const subtotal = priceAfterDiscount * purchaseAmount;
    const existingItem = purchasedItems.find(
      (item) => item.id === selectedProduct.id
    );
    if (existingItem) {
      setPurchasedItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id === selectedProduct.id) {
            const updatedAmount = item.amount + purchaseAmount;
            return {
              ...item,
              amount: updatedAmount,
              subtotal: priceAfterDiscount * updatedAmount,
            };
          }
          return item;
        })
      );
    } else {
      const category = categories.find(
        (categoryItem) => categoryItem.id === selectedProduct.category
      );
      const newPurchasedItem = {
        ...selectedProduct,
        categoryData: category,
        amount: purchaseAmount,
        priceAfterDiscount,
        subtotal,
      };
      setPurchasedItems((previousItems) => [
        ...previousItems,
        newPurchasedItem,
      ]);
    }
    setProductList((previousProducts) =>
      previousProducts.map((product) => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            inventory: product.inventory - purchaseAmount,
          };
        }
        return product;
      })
    );
    setAmount(0);
    setErrorMessage("");
  }
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="bg-blue-700 px-6 py-5 text-white">
          <p className="mt-1 text-sm text-blue-100">
            Select a category, choose a product, and enter the purchase amount.
          </p>
        </header>
        <div className="p-5 md:p-8">
          <div className="grid gap-5 rounded-xl border bg-slate-50 p-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-semibold text-slate-700"
              >
                Select Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="product"
                className="mb-2 block font-semibold text-slate-700"
              >
                Select Product
              </label>
              <select
                id="product"
                value={selectedProductId}
                onChange={handleProductChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">Please Select An Item</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} — {product.inventory} available
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block font-semibold text-slate-700"
              >
                Amount
              </label>
              <div className="flex gap-2">
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={!selectedProduct}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={
                    !selectedProduct ||
                    Number(amount) <= 0 ||
                    !Number.isInteger(Number(amount))
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
          {selectedProduct && (
            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <strong>{selectedProduct.title}</strong>
              {" | "}
              Price: ฿{selectedProduct.sellPrice.toLocaleString()}
              {" | "}
              Discount: {selectedProduct.discount}%{" | "}
              Available inventory: {selectedProduct.inventory}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-600">
              {errorMessage}
            </div>
          )}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-700">
                  <th className="border p-3">#</th>
                  <th className="border p-3">ID</th>
                  <th className="border p-3">Item</th>
                  <th className="border p-3">Category</th>
                  <th className="border p-3">Price</th>
                  <th className="border p-3">Discount</th>
                  <th className="border p-3">Amount</th>
                  <th className="border p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchasedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="border p-8 text-center text-slate-500"
                    >
                      No purchased items yet.
                    </td>
                  </tr>
                ) : (
                  purchasedItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border p-3">{index + 1}</td>
                      <td className="border p-3">{item.id}</td>
                      <td className="border p-3 font-medium">{item.title}</td>
                      <td className="border p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">
                            <CategoryIcon category={item.categoryData} />
                          </span>
                          <span>{item.categoryData?.title}</span>
                        </div>
                      </td>
                      <td className="border p-3">
                        ฿{item.sellPrice.toLocaleString()}
                      </td>
                      <td className="border p-3">{item.discount}%</td>
                      <td className="border p-3">{item.amount}</td>
                      <td className="border p-3 font-semibold">
                        ฿
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
          <div className="mt-6 flex justify-end">
            <div className="rounded-xl bg-slate-900 px-6 py-4 text-white">
              <span className="mr-4 text-lg">Grand Total:</span>
              <strong className="text-2xl">
                ฿
                {grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
