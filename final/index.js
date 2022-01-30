const fs = require("fs");
const superagent = require("superagent");
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

/*
console.log("Begin");
setTimeout(() => console.log("Waited 2 seconds"), 2000);
console.log("End");
*/

const questionPromise = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (data) => {
      rl.close();
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(new Error(err.message));
      resolve("success");
    });
  });
};

/*
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePromise("starter", res.body.message);
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
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    await writeFilePromise("img.txt", res.body.message);
    console.log(res.body.message);
    console.log("Saved image");
  } catch (err) {
    console.log(err.message);
  }
};

textToPic();
