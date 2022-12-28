const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const fss = require("fs");
const log = require("log-to-file");
const createPosts = require("./core-scraper/post-scraper");
const serachItem = require("./db/search");
const login = require("./middlewares/login");
const cors = require("cors");
const express = require("express");
const app = express();
const path = "./cookies.json";

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

async function createGroupsCollection(id) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--disable-notifications"],
  });
  try {
    const page = await browser.newPage();
    if (fss.existsSync(path)) {
      const cookiesString = await fs.readFile("./cookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    } else {
      await login(page);
    }

    console.log("Launching Page");
    page.setDefaultNavigationTimeout(100000);
    // try {
    //     await login(page)
    // } catch (error) {
    //     return console.log(error.message)
    // }

    // LOGING IN TO A FACEBOOK ACCOUNT --- //

    const posts = await createPosts(id, page);
    browser.close();

    return posts;
  } catch (error) {
    log(error, "./logs/error.log");
  }
}

app.post("/api/post", async function (req, res) {
  const id = req.body.id;
  console.log(id);
  const posts = await createGroupsCollection(id);
  if (!posts) {
    res.status(404).send("It doesnt exist");
    log(res.status(404), "./logs/error.log");
  }
  res.send(posts);
});
app.get("/api/search/:id", async function (req, res) {
  const id1 = req.params.id;
  const result = await serachItem(id1);
  if (!result) {
    res.status(404).send("It doesnt exist");
    log(res.status(404), "./logs/error.log");
  }
  res.send(result);
});

const port = process.env.PORT || 3555;
app.listen(port, () => console.log(`Listening on port ${port}...`));
