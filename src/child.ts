// import App from "../app";

// process.on("message", async (message: string) => {
//     console.log('ChildProcess', process.pid)

//     try {

//       await App.InitStatic(message);
//       setTimeout(() => {
//         process.send?.("ok");
//         process.exit();
//       }, 3000);

//     } catch {

//         process.send?.("ok");
//         process.exit();
        
//     }
// });

// // const { fork } = require("child_process");


// // const child = fork("./utils/child.js");
// //     child.send('testing');
// //     child.on("message", (message) => {
// //         console.log(
// //         "🚀 ~ file: server.js ~ line 37 ~ child.on ~ message",
// //         message);
// //         });