# parse-form-data

Parse a multipart form data on your server.

## Start

```sh
npm i --save parse-multipart-form-data
```

## Example
```js
import { extractBoundary, parse } from "parse-multipart-form-data"

const boundary = extractBoundary(req.headers["Content-Type"])

const files = parse(Buffer.from(req.body, "base64"), boundary)

console.log(files)

// {
//   filename: "...",
//   type: "...",   
//   data: <Buffer ...>
// }
```