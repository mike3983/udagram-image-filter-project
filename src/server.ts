import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import validUrl from "valid-url";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;
    if (!image_url || !validUrl.isUri(image_url)) {
      return res.sendStatus(400).send("image_url is required or malformed");
    }
    try {
      const filteredpath = await filterImageFromURL(image_url);
      await res.status(200).sendFile(filteredpath, {}, err => {
        if (err) {
          return res.status(422).send(`Not able to process the image`);
        }
        // Deleting the used image file.
        deleteLocalFiles([filteredpath]);
      });
    } catch (err) {
      res
        .status(422)
        .send(`Not able to process the request, Please check the image url`);
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
