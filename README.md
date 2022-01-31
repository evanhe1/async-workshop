# Introduction to Asynchronous Code
## Table of Contents

- [Introduction](#introduction)
- [Motivation](#motivation)
- [Promises](#promises)
- [Building our Example](#building-our-project)
  - [Running the Code](#running-the-code)
  - [Reading User Data](#reading-user-data)
  - [Performing an HTTP Request](#performing-an-http-request)
  - [Writing to a File](#writing-to-a-file)
  - [Handling Errors](#handling-errors)
- [async/await](#asyncawait)
  - [Using async/await with our Example](#using-asyncawait-with-our-example)
  - [Handling Errors with try/catch](#handling-errors-with-try-catch)
- [Conclusion](#conclusion)
- [Additional Resources](#additional-resources)

## Introduction

Operations within a program will typically run **synchronously** - this is, one after another. However, this structure can prove problematic when a really expensive operation can block the execution of the entire program. A real life analogy for this would be putting your clothes in the drier and just staring the machine instead of taking the time to go do something else. Asychronous code makes an effort to resolve this inefficiency and allow your program to "do something else". Today, we'll be exploring asynchronous code using Javascript!

## Motivation

**Asynchronous** code is code whose execution is independent of the overall program flow. More concretely, the program will not wait for the output of an asynchronous piece of code to be ready, and will simply move on to execute the next statement. Consider the example below, which simulates performing three tasks. The setTimeout function simply sets a timer and executes the function passed as its first argument after the timer expires, and will simulate performing an expensive task that takes 5 seconds to complete.

```Javascript
console.log("Finished cheap task 1");
setTimeout(() => console.log("Finished expensive task"), 5000);
console.log("Finished cheap task 2");
```

The output of the above statements is
```
Finished cheap task 1
Finished cheap task 2
Finished expensive task
```
As it turns out, the ```setTimeout``` function is asynchronous! After "Finished cheap task 1" is printed to the console, execution does not pause to wait for the 5-second timer to expire, but instead continues onto the next statement, resulting in "Finished cheap task 2" being printed next. After the timer expires, only then is "Finished expensive task" printed. 

## Promises

Now with a better understanding of the motivations for asynchronous code, let's use another example to introduce Promises, the primary asynchronous construct in Javascript. A **Promise** is a Javascript object whose value depends on the outcome of an asynchronous operation. Thus, a promise can exist in three states:

- pending
- fulfilled
- rejected 

The initial state of the Promise will be pending, and the final state of the Promise will only become known when the operation that defines its value terminates. Based on this final value, the Promise's state will either be fulfilled (if the operation succeeded) or rejected (if the operation failed). 

![Promise state diagram](https://user-images.githubusercontent.com/72584623/151504184-1c8cd3de-433e-4289-a04e-ccab39aeaedb.png)

Promises will allow us to chain together asynchronous operations and only execute a second, dependent asynchronous operation when the result of the original operation is known. To further explore promises, we will be building a simple program that takes in user input of a dog breed through the console, and retrives either a corresponding picture upon success, or reports an error upon failure. The app's overall pipeline is fairly straightforward: read user input, use this input to perform an http request for the image, and store the url of the image in a text file. Each of these operations has already been implemented an asychronous function for us to use, with only a few small modifications. Navigate to the ```starter/index.js``` file and let's get started!

## Building our Project

### Initial Setup

This small program will make use of some third-party modules that must be installed into our project directory. To do so, navigate to the project directory in your terminal and simply run

```npm install```

This command will perform all the necessary setup work for us. For more information on how npm works check out the links avilable in the [Additional Resources](#additional-resources) section.

### Running the Code

At any point, you can run the code you have written so far with the command 

```npm start```

### Reading User Data

According to our pipeline, we will first be reading in user input. For this action, we will be using the ```question``` function from the ```readline``` module. Below is a standard instance of the ```question``` function that will simply print the user's input to the console:

```Javascript
rl.question(query, (data) => {
      rl.close();
      console.log(`${data}`);
    });
```

The function's first argument, ```query```, represents a prompt string to communicate what the user should input, and is second argument is a ```callback``` function. A **callback** is a function passed to another function that this other function will invoke at a specified point in its execution (in this case, after the user submits their input). It takes in a single argument, ```data```, which will provide us access to the user's input. This callback is unique in that it does not take in an additional argument representing potential errors that occurred during the function's execution. As such, we cannot rely on the value of this hypothetical argument to handle errors. We will return to this point later. The ```rl.close``` function call inside the callback is simply to prevent the user from entering any more text after they have submitted. 

The only remaining difficulty for us to overcome is this function's return value, which is currently ```null```. However, in order to chain on another asynchronous operation after reading user input, we will need the ```question``` function to return a Promise. To do this, we will wrap the ```question```function, in another function, ```questionPromise```. This function will return the Promise that we are looking for. The ```questionPromise``` wrapper function will look like this:

```Javascript
const questionPromise = (query) => {
  return new Promise((resolve, reject) => {
    rl.question(query, (data) => {
      rl.close();
      resolve(data);
    });
  });
};
```

```questionPromise``` is just a standard arrow function that returns a Promise. Its single argument, ```query```, will simply be passed down as the ```query``` argument for the inner ```question``` function call. In the return statement, we invoke the Promise constructor and pass a single argument to it: an anonymous arrow function that will be evaluated to determine the Promise's ultimate value. This arrow function in turn takes two arguments: ```resolve``` and ```reject```. These arguments represent predefined functions to be called to set the Promise's final state. Calling the ```resolve``` function represents a fulfilled Promise, while calling the ```reject``` function represents a rejected Promise. Since we are implementing this Promise, when to call each of these functions is completely up to us! 

In this case, we want the final state of the Promise to depend on what the user entered into the ```question``` function. Fortunately, the user's input is available to us through the ```data``` argument of the callback for the ```question``` function. Since the function does not produce an error object, we can simply resolve the Promise, attaching ```data``` as an argument so that this value is available for future use. In fact, we could even omit the ```reject``` argument. It had only appeared previously for the sake of completion, so that we could briefly introduce its purpose. 

### Performing an HTTP Request

Now that the user's input is available for use, we can move on to the next step of the pipeline: performing an http request based on the user's input. To do this, we will be using another function that will greatly simplify making the request for us: ```superagent.get```. The function is used as follows:

```Javascript
superagent.get(url)
```

This function takes only one argument: ```url```, which is simply the url that we will retrieving data from. Just passing a valid url will be enough to perform a successful request; the ```get``` function will handle all the details of performing the request under the hood. For more details on HTTP requests, check out the links in the [Additional Resources](#additional-resources) section.

Fortunately for us, the ```get``` function will already return a Promise, so we can directly integrate it into the Promise chain without the use of a wrapper function. Internally, the execution of the ```get``` function can be thought of as producing two objects: ```err``` representing any errors that may have occurred (Unlike the ```question``` function, which did not produce error objects, the ```get``` function will produce an error if the request is unsucessful), and ```res```, representing the response to the request. If an error occurred (i. e. the ```err``` object is defined), then the ```reject``` function will be called with ```err``` as its argument. Otherwise, the ```resolve``` function will be called with the ```res``` as its argument. 

With a better understanding of the ```get``` function, we can now consider how to chain it onto the previous ```questionPromise``` function. To accomplish this chaining, we will use the ```then``` function. Below is an example of combining the ```questionPromise``` and ```get``` functions with ```then```:

```Javascript
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
 ```
 
The ```then``` function is a method of the Promise object. It executes when a Promise updates its state, and can take two optional arguments: ```onFulfilled```, a callback executed when a promise is resolved, and ```onRejected```, a callback executed when a promise is rejected. As mentioned earlier, the ```questionPromise``` function does not return an error object, so the ```onRejected``` argument can be omitted. 

In the ```questionPromise``` function, we passed the value ```data``` (representing the user's input) to the ```resolve``` function when returning a resolved Promise, so this value will be available for the ```onFulfilled``` callback to use. Inside this callback, we are free to call the ```get``` function with the value of ```data```, since the Promise that produces the value of ```data``` will be guaranteed to have a resolved state at this point. We will be using dog.ceo as the source of our images. The value of the ```url``` argument of the ```get``` function takes the form of a template string, with the response to the request depending on the value of ```data```, which will determine the breed of the dog in the image that dog.ceo returns. As mentioned earlier, ```get``` already returns a Promise so we are free to chain on the next function.

### Writing to a File

The final step in our pipeline is to write the url of the returned image to a text file. This can be accomplished with the ```writeFile``` function from the ```fs``` module. As example usage is as follows:

```Javascript
fs.writeFile(file, data, (err) => {
      if (err) return console.log("Could not write file");
      return console.log(success);
    });
```

The ```file``` parameter specifies the file location to write to, the ```data``` parameter specifies the data to write, and the third parameter is the callback. Like the ```question``` function, the ```writeFile``` function does not return a Promise by default, so we must write a wrapper function for it. But unlike the ```question``` function, the ```writeFile``` function does return an error object, and we will need to account for this complication as well. 

Now here is the wrapper around ```writeFile```, which we will call ```writeFilePromise```:

```Javascript
const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(new Error(err.message));
      resolve("success");
    });
  });
};
```

The format of this function is similar to that of ```questionPromise```, but with the introduction of potentially rejecting a Promise. We can now check if the ```err``` object is set (not ```null```) and reject the Promise if that is the case. The argument passed into the ```reject``` parameter uses the Javascript ```Error``` object constructor to standardize error handling later on.

With ```writeFile``` rewritten to return a Promise, we can now chain it on to our previous Promises. Just like before, we will use the ```then``` method. Below is our three Promises chained together:

```Javascript
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePromise("img.txt", res.body.message);
  })
```

```res``` is the output of the ```get``` function (the response) in the case of a successful HTTP request. This object will contain metadata about the request in addition to the dog image URL that we are looking for. To access the dog image URL, we must access the field ```res.body.message```. We will first log this field to the console (as more feedback to the user of a successful retrieval), and then write the contents of this field to a ```img.txt``` file in our current directory. ```writeFile``` will automatically create this file if it doesn't already exist. 

Finally, we want to log a feedback message confirming that the write was successfully completed. To guarantee this that output displays only after the write completes, we will chain the displaying of this message with yet another ```then``` function:

```Javascript
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePromise("img.txt", res.body.message);
  })
  .then(() => {
    console.log("Saved image");
  })
```

### Handling Errors

After putting it off for so long, we will finally handle the multitude of potential errors these functions could have produced. We will do so using a ```catch``` block. Below is the ```catch``` block chained on to our previous Promises:

```Javascript
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePromise("img.txt", res.body.message);
  })
  .then(() => {
    console.log("Saved image");
  })
  .catch((err) => {
    console.log(err.message);
  });
```

The ```catch``` function behaves exactly like a ```then``` function, except for the fact that it only takes in the  ```onRejected``` callback. Thus, the ```catch``` function is useful for error handling. We have avoided using this function thus far because we can use a single ```catch``` function at the end of the Promise chain to handle all errors that result in rejected Promises, and we do not need to consider errors from each function along the way separately. All Javascript ```Error``` objects have a ```message``` field that contains a human-readable description of the error that occurred, so in the callback we will simply log this description to the console.

With error handling complete, we have fully implemented our program! The program will take in a user input, make an HTTP request, and write the result of this request to a file. Test the program (using ```npm start``` as mentioned earlier) using both valid and invalid dog breed names and make sure you get the expected outputs and errors.

## async/await

Now that we have some familiarity with Promises and how our program could have been implemented using them, let's learn a new syntax that will make Promises easier to work with. This syntax is called **async/await**. Let's consider the ```async``` keyword first. The ```async``` keyword is used in the header of a function. Here it is in a regular function:

```Javascript
async function f1() {
  // body
}
```
and here it is in an arrow function: 

```Javascript
const f1 = async () => {
  // body
};
```

Using the ```async``` keyword will cause the associated function to return a Promise. Even when the return value is not a Promise, this value will be wrapped in a resolved Promise, much in the same way that we manually created wrappers earlier. See the function below:

```Javascript
const f1 = async () => {
  return 1;
};
```

The return value will be a resolved Promise with the value 1.

The other keyword to this syntax is ```await```. When used inside an ```async``` function on the Promise, execution of the function will block until the Promise's state updates. When the next line of the ```async``` function executes, the value of the ```Promise``` labelled with the ```await``` keyword will be guaranteed to be available, essentially making the execution synchronous. Thus the ```await``` keyword serves essentially the same purpose that the ```then``` function served previously. Note the difference between the following two code examples:

```Javascript
const with_await = async () => {
  console.log("start");
  const waited = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("waited 2 seconds");
    }, 2000);
  });
  console.log(waited);
  console.log("end");
};
```

```Javascript
const no_await = async () => {
  console.log("start");
  const waited = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("waited 2 seconds");
    }, 2000);
  });
  console.log(waited);
  console.log("end");
};
```

The ```with_await``` function will output

```
start
waited 2 seconds
end
```

(since execution blocks for two seconds waiting for the timer to expire and resolve the Promise), while the ```no_await``` function will output

```
start
end
waited for 2 seconds
```

since the function does not block execution and wait for the timer.

### Using async/await with our Example

With our new knowledge of how the ```async``` and ```await``` keywords work together, let's trying rewriting our dog image retrieval program as a single ```async``` function. Since all three functions that we used in our pipeline already return Promises, we can directly use them with the ```await``` keyword, as follows:

```Javascript
const textToPic = async () => {
  const data = await questionPromise("Enter a dog breed: ");
  const res = await superagent.get(
    `https://dog.ceo/api/breed/${data}/images/random`
  );
  console.log(res.body.message);
  await writeFilePromise("img.txt", res.body.message);
  console.log("Saved image");
};
```

Note that the asynchronous Promises and synchronous ```console.log``` calls are written as if everything were synchronous, with the ```await``` keyword serving as the only distinguishing characteristic. This is the main benefit of using the async/await syntax: it allows us to integrate asynchronous and synchronous code much more seamlessly.

### Handling Errors

Now the one remaining issue to resolve is error handling, since we have not yet discussed an equivalent to the ```catch``` function in the async/await syntax. Now we can again use the ```catch``` function by chaining it on to an ```async``` function call, but there is a more elegant solution: the standard Javascript ```try/catch``` block. ```try/catch``` can be integrated into our function as follows

```Javascript
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
```

The function will attempt to execute to code inside the ```try``` block, which is identical to the body of the previous function above. The only difference is that the ```catch``` block will now handle errors by logging them to the console. The control flow is ultimately very similar to the Promise chain that we utilized above, but with the added benefit of appearing more like pure synchronous code.

Note that the ```try/catch``` block is a synchronous construct, and will not work immediately with all asychronous code. It is only because of the blocking introduced by the ```await``` keywords that enables the ```try/catch``` block to work properly inside of an ```async``` function.

## Conclusion

This workshop introduced asynchronous code and the motivations behind it, as well as how to use it in Javascript. As an example, we implemented a dog image retriever in two different ways: using Promises alone and ```async/await```. To learn more about all the topics discussed in this workshop, check out the links below. Thank you all so much!

## Additional Resources

- [npm Introduction](https://nodejs.dev/learn/an-introduction-to-the-npm-package-manager)
- [readline.question](https://nodejs.org/api/readline.html#rlquestionquery-options-callback)
- [superagent](https://visionmedia.github.io/superagent/)
- [More info on HTTP Requests](https://www.codecademy.com/article/http-requests)
- [fs.writeFile](https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback)
- [Promise Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [async/await Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
