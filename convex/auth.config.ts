export default {
  providers: [
    {
      domain: "https://webbannuoc.vercel.app",
      applicationID: "convex",
    },
    // Thêm domain localhost để test local
    {
      domain: "http://localhost:3000",
      applicationID: "convex",
    },
    // Thêm domain của Vercel preview nếu có
    {
      domain: "https://*.vercel.app",
      applicationID: "convex",
    },
  ],
};
