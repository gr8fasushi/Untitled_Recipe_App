// Jest manual mock for react-native-purchases (native module — not available in Jest/Node)
const Purchases = {
  configure: jest.fn(),
  logIn: jest.fn().mockResolvedValue({ customerInfo: {}, created: false }),
  logOut: jest.fn().mockResolvedValue({}),
  getOfferings: jest.fn().mockResolvedValue({ current: null }),
  purchasePackage: jest.fn().mockResolvedValue({ customerInfo: {} }),
  getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
};

export default Purchases;
