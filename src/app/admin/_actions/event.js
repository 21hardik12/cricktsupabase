"use server"

import db from "@/db/db";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { notFound, redirect } from "next/navigation";
import crypto from "crypto";

const randomUUID = () => {
  return crypto.randomBytes(12).toString("hex");
}

const fileSchema = z.instanceof(File, {
  message: 'required'
})
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"))

const addSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  images: z.array(imageSchema.refine(file => file.size > 0, "Required")),
  date: z.date(),
  category: z.string(),
  stadium: z.string(),
});

export async function addEvent(prevState, formData) {  
  const files = formData.getAll('images');
  
  const formObject = Object.fromEntries(formData.entries());  
  formObject.images = files;

  formObject.date = new Date(formObject.date);  

  const result = addSchema.safeParse(formObject);
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  
  await fs.mkdir(path.join(process.cwd(), 'public', 'eventImages'), { recursive: true });
  const imagePaths = data.images.map(async (image) => {
    const imagePath = `/eventImages/${randomUUID()}-${image.name}`;
    await fs.writeFile(path.join(process.cwd(), 'public', imagePath), Buffer.from(await image.arrayBuffer()));
    return imagePath;
  }); 

  const startingPrice = await db.stadium.findUnique({
    where: {
      id: data.stadium,
    },
    select: {
      tickets: {
        orderBy: {
          price: 'asc',          
        },
        take: 1,
        select: {
          price: true
        }
      }
    }
  })
  try {
    const createdEvent = await db.event.create({
      data: {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        categoryId: data.category,
        stadiumId: data.stadium,
        // create eventImages
        images: {
          createMany: { data: await Promise.all(imagePaths.map(async url => ({ url: await url }))) } // Await the promises inside the map function
        },
        price: startingPrice?.tickets[0]?.price ?? 0, // Add the missing 'price' property with a default value of 0
        date: data.date, // Add the missing 'date' property with a default value
      }      
    })
  } catch (error) {
    console.log(error)
  }

  redirect('/admin/events');
}

const editSchema = addSchema.extend({
  images: z.array(imageSchema).optional(),
})

export async function editEvent(id, prevState, formData) {
  const files = formData.getAll('images');
  const formObject = Object.fromEntries(formData.entries());
  formObject.images = files;
  formObject.date = new Date(formObject.date);

  const result = editSchema.safeParse(formObject);
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  try {
    const event = await db.event.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!event) {
      notFound();
    }
    const startingPrice = await db.stadium.findUnique({
      where: { id: data.stadium },
      select: {
        tickets: {
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true },
        },
      },
    });

    const updatedEventData = {
      title: data.title,
      description: data.description,
      categoryId: data.category,
      stadiumId: data.stadium,
      price: startingPrice?.tickets[0]?.price ?? event.price,
      date: data.date ?? event.date,
    };

    // Filter out any File objects with a size of 0
    const validImages = (data.images ?? []).filter((image) => image.size > 0);

    if (validImages.length > 0) {
      // Delete existing images only if there are valid new images selected
      await Promise.all(
        event.images.map(async (image) => {
          await fs.unlink(path.join(process.cwd(), 'public', image.url));
          await db.eventImage.delete({ where: { id: image.id } });
        })
      );

      const imagePaths = await Promise.all(
        validImages.map(async (image) => {
          const imagePath = `/eventImages/${randomUUID()}-${image.name}`;
          await fs.writeFile(path.join(process.cwd(), 'public', imagePath), Buffer.from(await image.arrayBuffer()));
          return imagePath;
        })
      );

      updatedEventData.images = {
        createMany: {
          data: imagePaths.map((url) => ({ url })),
        },
      };
    }

    

    const updatedEvent = await db.event.update({
      where: { id },
      data: updatedEventData,
    });

  } catch (error) {
    console.log(error);
  }

  redirect('/admin/events');
}

export async function toggleProductAvailability(id, isAvailableForBooking) {
  await db.event.update({
    where: {
      id,
    },
    data: {
      isAvailableForBooking,
    }
  });  
}

export async function deleteEvent(id) {  
  const event = await db.event.delete({
    where: {
      id,
    }, 
    include: {
      images: true,
    }
  });

  if (event == null) return notFound();

  event.images.forEach(async (image) => {
    await fs.unlink(path.join(process.cwd(), 'public', image.url));
    // await db.eventImage.delete({
    //   where: {
    //     id: image.id,
    //   },
    // });
  });
}


// "use server"

// import db from "@/db/db";
// import { z } from "zod";
// import fs from "fs/promises";
// import { notFound, redirect } from "next/navigation";
// import crypto from "crypto";

// const randomUUID = () => {
//   return crypto.randomBytes(12).toString("hex");
// }

// const fileSchema = z.instanceof(File, {
//   message: 'required'
// })
// const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"))

// const addSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().min(1),
//   images: z.array(imageSchema.refine(file => file.size > 0, "Required")),
//   date: z.date(),
//   category: z.string(),
//   stadium: z.string(),
// });

// export async function addEvent(prevState, formData) {  
//   const files = formData.getAll('images');
  
//   const formObject = Object.fromEntries(formData.entries());  
//   formObject.images = files;

//   formObject.date = new Date(formObject.date);  

//   const result = addSchema.safeParse(formObject);
//   if (result.success === false) {
//     return result.error.formErrors.fieldErrors;
//   }

//   const data = result.data;
  
//   await fs.mkdir('public/eventImages', { recursive: true });
//   const imagePaths = data.images.map(async (image) => {
//     const imagePath = `/eventImages/${randomUUID()}-${image.name}`;
//     await fs.writeFile(`public${imagePath}`, Buffer.from(await image.arrayBuffer()));
//     return imagePath;
//   }); 

//   const startingPrice = await db.stadium.findUnique({
//     where: {
//       id: data.stadium,
//     },
//     select: {
//       tickets: {
//         orderBy: {
//           price: 'asc',          
//         },
//         take: 1,
//         select: {
//           price: true
//         }
//       }
//     }
//   })
//   try {
//     const createdEvent = await db.event.create({
//       data: {
//         id: randomUUID(),
//         title: data.title,
//         description: data.description,
//         categoryId: data.category,
//         stadiumId: data.stadium,
//         // create eventImages
//         images: {
//           createMany: { data: await Promise.all(imagePaths.map(async url => ({ url: await url }))) } // Await the promises inside the map function
//         },
//         price: startingPrice?.tickets[0]?.price ?? 0, // Add the missing 'price' property with a default value of 0
//         date: data.date, // Add the missing 'date' property with a default value
//       }      
//     })
//   } catch (error) {
//     console.log(error)
//   }

//   redirect('/admin/events');
// }

// const editSchema = addSchema.extend({
//   images: z.array(imageSchema).optional(),
// })

// export async function editEvent(id, prevState, formData) {
//   const files = formData.getAll('images');
//   const formObject = Object.fromEntries(formData.entries());
//   formObject.images = files;
//   formObject.date = new Date(formObject.date);

//   const result = editSchema.safeParse(formObject);
//   if (result.success === false) {
//     return result.error.formErrors.fieldErrors;
//   }

//   const data = result.data;

//   try {
//     const event = await db.event.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!event) {
//       notFound();
//     }
//     const startingPrice = await db.stadium.findUnique({
//       where: { id: data.stadium },
//       select: {
//         tickets: {
//           orderBy: { price: 'asc' },
//           take: 1,
//           select: { price: true },
//         },
//       },
//     });

//     const updatedEventData = {
//       title: data.title,
//       description: data.description,
//       categoryId: data.category,
//       stadiumId: data.stadium,
//       price: startingPrice?.tickets[0]?.price ?? event.price,
//       date: data.date ?? event.date,
//     };

//     // Filter out any File objects with a size of 0
//     const validImages = (data.images ?? []).filter((image) => image.size > 0);

//     if (validImages.length > 0) {
//       // Delete existing images only if there are valid new images selected
//       await Promise.all(
//         event.images.map(async (image) => {
//           await fs.unlink(`public${image.url}`);
//           await db.eventImage.delete({ where: { id: image.id } });
//         })
//       );

//       const imagePaths = await Promise.all(
//         validImages.map(async (image) => {
//           const imagePath = `/eventImages/${randomUUID()}-${image.name}`;
//           await fs.writeFile(`public${imagePath}`, Buffer.from(await image.arrayBuffer()));
//           return imagePath;
//         })
//       );

//       updatedEventData.images = {
//         createMany: {
//           data: imagePaths.map((url) => ({ url })),
//         },
//       };
//     }

    

//     const updatedEvent = await db.event.update({
//       where: { id },
//       data: updatedEventData,
//     });

//   } catch (error) {
//     console.log(error);
//   }

//   redirect('/admin/events');
// }

// export async function toggleProductAvailability(id, isAvailableForBooking) {
//   await db.event.update({
//     where: {
//       id,
//     },
//     data: {
//       isAvailableForBooking,
//     }
//   });  
// }

// export async function deleteEvent(id) {  
//   const event = await db.event.delete({
//     where: {
//       id,
//     }, 
//     include: {
//       images: true,
//     }
//   });

//   if (event == null) return notFound();

//   event.images.forEach(async (image) => {
//     await fs.unlink(`public${image.url}`);
//     await db.eventImage.delete({
//       where: {
//         id: image.id,
//       },
//     });
//   });
// }