import { defineConfig,devices } from "@playwright/test";
export default defineConfig({
 testDir:"./e2e",
 fullyParallel:false,
 workers:1,
 forbidOnly:!!process.env.CI,
 retries:0,
 timeout:90_000,
 expect:{timeout:10_000},
 reporter:[["list"],["html",{open:"never"}]],
 outputDir:"test-results",
 use:{
  baseURL:"http://127.0.0.1:3211",
  channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "chrome" : "chromium"),
  headless:true,
  trace:"retain-on-failure",
  screenshot:"only-on-failure",
 },
 projects:[
  {name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}},
  {name:"mobile",use:{...devices["Pixel 7"]}},
 ],
 webServer:{
  command:"npm run start -- --hostname 127.0.0.1 --port 3211",
  url:"http://127.0.0.1:3211",
  reuseExistingServer:false,
  timeout:60_000,
 },
});
