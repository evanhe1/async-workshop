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

Now with a better understanding of the motivations for asynchronous code, let's use another example to introduce Promises, the primary asynchronous construct in Javascript. A **Promise** is a Javascript object whose value depends on the outcome of an asynchronous operation. Thus, the ultimate value of a promise is not immediately available upon creation. To further explore promises, we will be building a simple app that takes in user input of a dog breed through the console, and retrives either a corresponding picture upon success, or reports an error upon failure. The app's overall pipeline is fairly straightforward: read user input, use this input to perform an https request for the image, and store the url of the image in a text file. Now each of these operations has already been implemented an asychronous function for us to use, with only a few small modifications.
