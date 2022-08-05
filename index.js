const puppeteer = require('puppeteer');
const login = require('./middlewares/login')
const createPosts = require('./core-scraper/post-scraper')
const serachItem = require('./db/search');
const cors = require('cors')
const express = require('express');
const app = express()


    app.use(
        cors()
    )
    app.use(
        express.urlencoded({
          extended: true
        })
      )
    app.use(express.json())

async function createGroupsCollection(id){
   

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            "--disable-notifications",
        
        ]
    });


        const page = await browser.newPage();
        console.log("Launching Page");
        page.setDefaultNavigationTimeout(100000)

    // LOGING IN TO A FACEBOOK ACCOUNT --- //
    try {
            console.log("Logging in");
            await login(page)
        } catch (error) {
            return console.log(error.message)
        }
    
        const posts  = await createPosts(id, page)
        browser.close()
       

        return posts
    
}

app.post('/api/post', async function (req, res) {
    const id = req.body.id
    console.log(id);
    const posts = await createGroupsCollection(id)
    if(!posts) res.status(404).send('It doesnt exist')
    res.send(posts);
    
});
app.get('/api/search/:id', async function (req, res) {
    const id1 = req.params.id
    const result = await serachItem(id1)
    if(!result) res.status(404).send('It doesnt exist')
    res.send(result);
    
});

const port = process.env.PORT || 3555;
app.listen(port, () => console.log(`Listening on port ${port}...`));




