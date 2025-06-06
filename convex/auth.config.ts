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
    {
      domain: "http://localhost:5173",
      applicationID: "convex",
    },
    {
      domain: "https://posh-anaconda-144.convex.site",
      applicationID: "convex",
    },
    // Thêm domain của Vercel preview nếu có
    {
      domain: "https://*.vercel.app",
      applicationID: "convex",
    },
  ],
};
