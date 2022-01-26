const util = require("util");
const fs = require("fs");
const https = require("https");

const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const wfPromiseUtil = util.promisify(fs.writeFile);

rl.question[util.promisify.custom] = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (data) => {
      rl.close();
      resolve(data);
    });
  });
};

const httpsPromise = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(`${url}`, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            if (res.statusCode !== 200)
              throw new Error("Failed to retrieve image");
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (err) {
            reject(err.message);
          }
        });
      })
      .on("error", (err) => {
        reject(err.message);
      });
  });
};

const questionPromiseUtil = util.promisify(rl.question).bind(rl);

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject("Could not write file");
      resolve("success");
    });
  });
};

const questionPromise = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (data) => {
      rl.close();
      resolve(data);
    });
  });
};

/*
rl.question("Enter a dog breed: ", (data) => {
  rl.close();
  console.log(`Breed: ${data}`);
  superagent.get(
    `https://dog.ceo/api/breed/${data}/images/random`,
    (err, res) => {
      if (err) return console.log(err.message);
      console.log(res.body.message);
      fs.writeFile("img.txt", res.body.message, (err) => {
        if (err) return console.log(err.message);
        console.log("Saved image");
      });
    }
  );
});
*/

/*
rl.question("Enter a dog breed: ", (data) => {
  rl.close();
  console.log(`Breed: ${data}`);
  https
    .get(`https://dog.ceo/api/breed/${data}/images/random`, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode !== 200)
            throw new Error("Failed to retrieve image");
          const parsedData = JSON.parse(data);
          console.log(parsedData.message);
          fs.writeFile("img.txt", parsedData.message, (err) => {
            if (err) return console.log(err.message);
            console.log("Saved image");
          });
        } catch (err) {
          return console.log(err.message);
        }
      });
    })
    .on("error", (err) => {
      return console.log(err.message);
    });
});
*/
/*
questionPromise("Enter a dog breed: ")
  .then((data) => {
    console.log(`Breed: ${data}`);
    return data;
  })
  .then((data) => {
    return httpsPromise(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return wfPromise("img.txt", res.body.message);
  })
  .then(() => {
    console.log("Saved image");
  })
  .catch((err) => {
    console.log(err.message);
  });
*/

const textToPic = async () => {
  try {
    const data = await questionPromise("Enter a dog breed: ");
    console.log(`Breed: ${data}`);

    const res = await httpsPromise(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    await writeFilePromise("img.txt", res.message);
    console.log(res.message);
    console.log("Saved image");
  } catch (err) {
    if (err && err.message) console.log(err.message);
    else console.log(err);
  }
};

textToPic();
