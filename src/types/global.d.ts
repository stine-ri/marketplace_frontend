declare global {
  interface Window {
    debugPurchase: {
      checkProduct: typeof debugProductAvailability;
      checkAuth: typeof debugUserAuth;
      testEndpoints: typeof debugPurchaseEndpoints;
      testPayments: typeof debugPaymentMethods;
      runAll: typeof runComprehensiveDebug;
    };
  }
}

export {};
