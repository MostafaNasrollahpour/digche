export const endpoints = {
  chefDashboard: {
    get: "/core/chef/dashboard",
  },

  foods: {
    list: "/core/Dishes/available",
    nearby: "/core/Dishes/available",
    detail: (foodId: number | string) => `/core/Dishes/${foodId}`,
    comments: (foodId: number | string) => `/core/Comments/dish/${foodId}`,
    createComment: "/core/Comments",
  },

  chefFoods: {
    list: (chefId: number | string) => `/core/Dishes/chef/${chefId}`,
    detail: (foodId: number | string) => `/core/Dishes/${foodId}`,
    create: "/core/Dishes",
    update: (foodId: number | string) => `/core/Dishes/${foodId}`,
    delete: (foodId: number | string) => `/core/Dishes/${foodId}`,
  },

  customerOrders: {
  history: "/customer/orders/history",
  },

  customerAddresses: {
    list: "/customer/addresses",
    create: "/customer/addresses",
    update: (addressId: number | string) =>
      `/customer/addresses/${addressId}`,
    delete: (addressId: number | string) =>
      `/customer/addresses/${addressId}`,
    setDefault: (addressId: number | string) =>
      `/customer/addresses/${addressId}/default`,
  },

  media: {
  profilePhotoPresign: "/media/profile-photo/presign",
  dishImagePresign: "/media/dish-images/presign",
},

  cart: {
    get: "/core/Carts",
    clear: "/core/Carts",
    addItem: "/core/Carts/items",
    removeItem: (dishId: number | string) => `/core/Carts/items/${dishId}`,
  },

  orders: {
  create: "/core/Orders",
  detail: (id: number | string) => `/core/Orders/${id}`,
  customer: "/core/Orders/customer",
  chef: "/core/Orders/chef",
},
};