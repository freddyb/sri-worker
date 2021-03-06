function shaNdigest(input, n=384) {
  if (typeof input !== "string") {
    throw new Error("sha384digest expects a string");
  }
  if ([256, 384, 512].indexOf(n) === -1) {
    throw new Error("Unexpected digest output size for shaNdigest: " + n);
  }
  const te = new TextEncoder();
  let buffer = te.encode(input);
  return window.crypto.subtle.digest({ name: "SHA-" + n}, buffer)
        .then(function(hash){
          // turn arraybuffer into base64 encoding
          let base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
          return "sha384-" + base64;
        })
        .catch(function(err){
          throw err;
        });
}


fetch("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js").then(
  response => response.text())
  .then(text => shaNdigest(text))
  .then(digest => digest === "sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa");
