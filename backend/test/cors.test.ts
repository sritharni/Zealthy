import { createCorsOptions } from "@/config/cors";

describe("createCorsOptions", () => {
  it("builds a credentialed allowlist-based CORS policy", () => {
    process.env.FRONTEND_ORIGINS = "http://localhost:3000,https://frontend.example.com";

    const options = createCorsOptions();

    expect(options.origin).toEqual([
      "http://localhost:3000",
      "https://frontend.example.com",
    ]);
    expect(options.credentials).toBe(true);
    expect(options.methods).toContain("OPTIONS");
    expect(options.allowedHeaders).toContain("Content-Type");
  });
});
