import React from "react";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";

const shopConfigState = atom({
  key: "shopState",
  default: {
    discount: 0,
  },
});

const cartState = atom({
  key: "cartState",
  default: [],
});

const cartDetailsState = selector({
  key: "cartDetailsState",
  get: ({ get }) => {
    const { discount } = get(shopConfigState);
    const cart = get(cartState);

    const total = cart.reduce((prev, cur) => prev + cur.price, 0);
    const discountAmount = total * discount;

    return {
      total,
      discountAmount,
    };
  },
  set: ({ set }, newValue) => {
    set(cartState, newValue);
  },
});

const products = [
  { name: "Toothbrush", price: 10 },
  { name: "Smart TV", price: 800 },
  { name: "Laptop", price: 600 },
  { name: "Chocolate", price: 12 },
  { name: "Apple juice", price: 5 },
];

const getProductsFromDB = async () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(products), 2500);
  });

const productsQuery = selector({
  key: "Products",
  get: async () => getProductsFromDB(),
});

const ShopConfig = () => {
  const [shopState, setShopState] = useRecoilState(shopConfigState);

  const updateDiscount = ({ target: { value } }) => {
    setShopState({ ...shopState, discount: value });
  };

  return (
    <div>
      Discount:
      <select value={shopState.discount} onChange={updateDiscount}>
        <option value={0}>None</option>
        <option value={0.05}>5%</option>
        <option value={0.1}>10%</option>
        <option value={0.15}>15%</option>
      </select>
    </div>
  );
};

const ShopProducts = ({ onAddToCart }) => {
  const shopProducts = useRecoilValue(productsQuery);

  return (
    <>
      PRODUCTS:
      <div>
        {shopProducts.map((product) => (
          <p key={product.name}>
            {product.name} (${product.price})
            <button onClick={() => onAddToCart(product)}>Add</button>
          </p>
        ))}
      </div>
    </>
  );
};

const Cart = ({ products, onRemoveFromCart }) => (
  <>
    CART:
    <div>
      {!products.length
        ? "Empty"
        : products.map((product) => (
            <p key={product.name}>
              {product.name} (${product.price})
              <button onClick={() => onRemoveFromCart(product)}>Remove</button>
            </p>
          ))}
    </div>
  </>
);

const CartDetails = ({ total, discount, discountAmount, setCart }) => (
  <div>
    <p>
      DISCOUNT: {discount * 100}% (${discountAmount})
    </p>
    <p>TOTAL: {total}</p>
    <p>TOTAL AFTER DISCOUNT: {total - discountAmount}</p>
    <button onClick={() => setCart([])}>Clear cart</button>
  </div>
);

const App = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const { discount } = useRecoilValue(shopConfigState);
  const [{ total, discountAmount }, setCartFromSelector] =
    useRecoilState(cartDetailsState);

  const addToCart = (product) =>
    setCart((cart) =>
      cart.find((item) => item.name === product.name)
        ? cart
        : [...cart, product]
    );

  const removeFromCart = (product) =>
    setCart((cart) => cart.filter((item) => item.name !== product.name));

  return (
    <div>
      <ShopConfig />
      <React.Suspense fallback={<div>Loading products...</div>}>
        <ShopProducts onAddToCart={addToCart} />
      </React.Suspense>
      <Cart products={cart} onRemoveFromCart={removeFromCart} />
      <CartDetails
        total={total}
        discount={discount}
        discountAmount={discountAmount}
        setCart={setCartFromSelector}
      />
    </div>
  );
};

export default App;
