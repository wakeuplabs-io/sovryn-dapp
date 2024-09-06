export const useAaveConfig = () => {
  return {
    currentNetworkConfig: {
      ratesHistoryApiUrl: process.env.REACT_APP_AAVE_API_URI,
    },
  };
};
