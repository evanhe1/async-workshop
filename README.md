# Introduction

Operations within a program will typically run **synchronously** - this is, one after another. However, this structure can prove problematic when a really expensive operation can block the execution of the entire program. A real life analogy for this would be putting your clothes in the drier and just staring the machine instead of taking the time to go do something else. Asychronous code makes an effort to resolve this inefficiency and allow your program to "do something else". Today, we'll be exploring asynchronous code using Javascript!

# Motivating Example

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
As it turns out, the ```setTimeout``` function is asynchronous! After "Finished cheap task 1" is printed to the console, execution does not pause to wait for the 10-second timer to expire, but instead continues onto the next statement, resulting in "Finished cheap task 2" being printed next. After the timer expires, only then is "Finished expensive task" printed. 

# Promises

Now with a better understanding of the motivations for asynchronous code, let's use another example to introduce Promises, the primary asynchronous construct in Javascript. A **Promise** is a Javascript object whose value depends on the outcome of an asynchronous operation. Thus, a promise can exist in three states: pending, fulfilled, or rejected. The initial state of the Promise will be pending, and the final state of the Promise will only become known when the operation that defines its value terminates. Based on this final value, the Promise's state will either be fulfilled (if the operation was succeeded) or rejected (if the operation failed). 

![Promise state diagram](https://user-images.githubusercontent.com/72584623/151504184-1c8cd3de-433e-4289-a04e-ccab39aeaedb.png)

Promises will allow us to chain together asynchronous operations and only execute a second, dependent asynchronous operation when the result of the original operation is known. To further explore promises, we will be building a simple app that takes in user input of a dog breed through the console, and retrives either a corresponding picture upon success, or reports an error upon failure. The app's overall pipeline is fairly straightforward: read user input, use this input to perform an http request for the image, and store the url of the image in a text file. Each of these operations has already been implemented an asychronous function for us to use, with only a few small modifications. Navigate to the ```starter/index.js``` file and let's get started!

# Building our Project!

# Initial Setup

This small app will make use of some third-party modules that must be installed into our project directory. To do so, navigate to the project directory in your terminal and simply run

```npm install```. This command will perform all the necessary setup work for us. For more information on how npm works check out the links avilable in the "Additional Resources" section.

# Reading User Data

According to our pipeline, we will be first reading in user input. For this action, we will be using the ```question``` function from the ```readline``` module. Below is a standard instance of the ```question``` function that will simply print the user's input to the console:

```Javascript
rl.question(query, (data) => {
      rl.close();
      console.log(`${data}`);
    });
```

The function's first argument: ```query```, represents a prompt string to communicate what the user should input, and is second argument is a ```callback``` function. A **callback** is a function passed to another function that this other function will invoke at a specified point in its execution. For the ```question``` function, the callback represents the code to execute after the user submits their input. It takes in a single argument (which we will call ```data```) which will provide us access to the user's input. This callback is unique in that is does not take in an additional argument representing potential errors that occurred during the function's exeuction. As such, we cannot rely on the value of this hypothetical argument to handle errors. We will return to this point later. The ```rl.close()``` function call inside the callback is simply to prevent the user from entering any more text after they have submitted. 

The only remaining difficulty for us to overcome is this function's return value, which is currently ```null```. However, in order to chain on another asynchronous operation after reading user input, we will need the ```question``` function to return a Promise. To do this, we will wrap the ```question```function, ```questionPromise```. This function will return the Promise that we are looking for. The ```questionPromise``` wrapper function might look something like this:

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

In this case, we want the final state of the Promise to depend on what the user entered into the ```question``` function. Fortunately, the user's input is available to us through the ```data``` argument of the callback for the ```question``` function. Since we are not handling input validation at this stage in the pipeline, we can simply resolve the Promise, attaching ```data``` as an argument so that this value is available for future use. If any error had occurred, we would have had to reject the Promise and returned the value of this error using the ```reject``` function. Now recall that the callback did not provide an error argument for us to process. For our purposes, this is unimportant since we can catch potential errors later in the pipeline. Thus we can make our lives easier and simply always resolve the Promise. In fact, we could even omit the ```reject``` argument. It had only appeared previously for the sake of completion.

# Performing an HTTP Request

Now that the user's input is available for use, we can move on to the next step of the pipeline: performing an http request based on the user's input. To do this, we will be using another function that will greatly simplify making the request for us: ```superagent.get```. The function is used as follows:

```Javascript
superagent.get(url)
```

This function takes only one argument: ```url```, which is simply the url that we will retrieving data from. Just passing a valid url will be enough will be enough to perform a successful request, the ```get``` function will handle all the details of performing the request under the hood.

Fortunately for us, the ```get``` function will already return a Promise, so we can directly integrate it into the Promise chain without the use of a wrapper function. Internally, the execution of the ```get``` can be thought of as producing two objects: ```err``` representing any errors that may have occurred (Unlike the ```question``` function, which did not produce error objects, the ```get``` function will produce an error if the request is unsucessful), and ```res```, representing the response to the request. If an error occurred (i. e. the ```err``` object is defined), then the ```reject``` function will be called with ```err``` as its argument. Otherwise, the ```resolve``` function will be called with the ```res``` as its argument. 

With a better understanding of the ```get``` function, we can now consider how to chain it onto the previous ```questionPromise``` function. To accomplish this chaining, we will use the ```then``` function. Below is an example of combining the ```questionPromise``` and ```get``` functions with ```then```:

```Javascript
questionPromise("Enter a dog breed: ")
  .then((data) => {
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
 ```
