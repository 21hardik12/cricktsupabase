"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-100">
      <div className="relative w-full sm:w-auto">
        <input
          type="email"
          name="email"
          id="email"
          className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
          placeholder="Email Address"
        />
        {submitted && (
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
            &#10003;
          </span>
        )}
      </div>
      <div className="relative w-full sm:w-auto">
        <input
          type="tel"
          name="phone"
          id="phone"
          className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
          placeholder="+91 XXXXXXXXXX"
        />
        {submitted && (
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
            &#10003;
          </span>
        )}
      </div>
      <button className="py-2 sm:py-1 px-6 bg-red-500 rounded-sm text-white text-sm sm:text-base">
        Continue
      </button>
    </form>
  );
}

// "use client";
// import { useState } from "react";

// export default function ContactForm() {
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     setSubmitted(true);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-gray-100">
//       <div className="relative">
//         <input
//           type="email"
//           name="email"
//           id="email"
//           className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
//           placeholder="Email Address"
//         />
//         {submitted && (
//           <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
//             &#10003;
//           </span>
//         )}
//       </div>
//       <div className="relative">
//         <input
//           type="tel"
//           name="phone"
//           id="phone"
//           className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
//           placeholder="+91 XXXXXXXXXX"
//         />
//         {submitted && (
//           <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
//             &#10003;
//           </span>
//         )}
//       </div>
//       <button className="px-6 bg-red-500 rounded-sm text-white text-base">
//         Continue
//       </button>
//     </form>
//   );
// }

// // "use client";

// // export default function ContactForm() {
// //   const handleSubmit = (event) => {
// //     event.preventDefault();
// //   }

// //   return (
// //     <form
// //           onSubmit={handleSubmit}
// //           className="flex gap-3 p-4 bg-gray-100"
// //         >
// //           <div className="">
// //             <input
// //               type="email"
// //               name="email"
// //               id="email"
// //               className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
// //               placeholder="Email Address"
// //             />
// //           </div>
// //           <div className="">
// //             <input
// //               type="tel"
// //               name="phone"
// //               id="phone"
// //               className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
// //               placeholder="+91 XXXXXXXXXX"
// //             ></input>
// //           </div>
// //           <button className="px-6 bg-red-500 rounded-sm text-white text-base">
// //             Continue
// //           </button>
// //         </form>
// //   );
// // }