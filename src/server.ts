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
app.use(routes);
app.use(express.static('./public'));
app.get('/', function(request, response, next) {
  if(request.headers.host =="https://catalogueme.herokuapp.com") {
      response.writeHead(301, {'Location':'http://www.catalogueme.store'+ request.url, 'Expires': (new Date).toUTCString()});
      response.end();
  }
  else{
      next();
  }})

app.listen(process.env.PORT || 3333);