require("dotenv").config();
import express from 'express'
import cors from 'cors'
import routes from './routes';


const app = express();
app.options('*', cors());
app.use(
    cors({
      exposedHeaders: ["x-content-length"]
    })
  );
app.use(cors())
app.use(express.json());
app.get('/', function(req, res, next) {
  if (req.headers.host === 'catalogueme.herokuapp.com') {
    res.redirect('http://catalogueme.store', 301);
  } else {
    res.redirect('http://catalogueme.store', 301);
  }
});
app.use(routes);
app.use(express.static('./public'));


app.listen(process.env.PORT || 3333);